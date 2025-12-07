import { NextRequest, NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

interface NodeData {
  id: string;
  data: {
    label: string;
    category: string;
  };
}

interface EdgeData {
  source: string;
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges } = body as { nodes: NodeData[]; edges: EdgeData[] };

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'No nodes provided' },
        { status: 400 }
      );
    }

    // Build the resource list for the prompt
    const resourceList = nodes.map((node) => {
      const label = node.data.label;
      const category = node.data.category;
      return `- ${label} (${category})`;
    }).join('\n');

    // Build connections list
    const connectionsList = edges.map((edge) => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      const sourceName = sourceNode?.data.label || edge.source;
      const targetName = targetNode?.data.label || edge.target;
      return `- ${sourceName} connects to ${targetName}`;
    }).join('\n');

    const prompt = `Generate a valid main.tf Terraform configuration for these AWS resources:

Resources:
${resourceList}

${connectionsList ? `Connections:\n${connectionsList}` : ''}

Requirements:
- Use AWS provider with region variable
- Include proper resource configurations with sensible defaults
- Add appropriate tags to all resources
- Include any necessary IAM roles and policies
- Add comments explaining each resource
- Make the configuration production-ready

Return ONLY the raw Terraform code, no explanations or markdown formatting.`;

    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    let terraformCode = responseBody.content[0].text;
    
    // Clean up the response - remove any markdown code blocks if present
    terraformCode = terraformCode.replace(/```(?:hcl|terraform)?\n?/g, '').replace(/```\n?$/g, '').trim();

    return NextResponse.json({ code: terraformCode });
  } catch (error) {
    console.error('Error generating Terraform:', error);
    
    // Fallback to basic template if Bedrock fails
    const body = await request.clone().json();
    const { nodes, edges } = body as { nodes: NodeData[]; edges: EdgeData[] };
    
    let fallbackCode = `# CloudCompass AI - Generated Terraform Configuration
# Generated on ${new Date().toISOString()}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "region" {
  description = "AWS region"
  default     = "us-east-1"
}

provider "aws" {
  region = var.region
}

`;

    nodes.forEach((node) => {
      const resourceId = node.id.replace(/-/g, '_').substring(0, 30);
      const label = node.data.label;

      switch (label) {
        case 'EC2':
          fallbackCode += `
# EC2 Instance
resource "aws_instance" "${resourceId}" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "${label}-instance"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
`;
          break;
        case 'Lambda':
          fallbackCode += `
# Lambda Function
resource "aws_lambda_function" "${resourceId}" {
  filename      = "lambda_function.zip"
  function_name = "${resourceId}"
  role          = aws_iam_role.${resourceId}_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  timeout       = 30
  memory_size   = 256

  tags = {
    Name        = "${label}-function"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_role" "${resourceId}_role" {
  name = "${resourceId}_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "${resourceId}_basic" {
  role       = aws_iam_role.${resourceId}_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
`;
          break;
        case 'S3':
          fallbackCode += `
# S3 Bucket
resource "aws_s3_bucket" "${resourceId}" {
  bucket = "${resourceId.toLowerCase().replace(/_/g, '-')}-bucket"

  tags = {
    Name        = "${label}-bucket"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_versioning" "${resourceId}_versioning" {
  bucket = aws_s3_bucket.${resourceId}.id
  versioning_configuration {
    status = "Enabled"
  }
}
`;
          break;
        case 'DynamoDB':
          fallbackCode += `
# DynamoDB Table
resource "aws_dynamodb_table" "${resourceId}" {
  name           = "${resourceId}_table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name        = "${label}-table"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
`;
          break;
        case 'RDS':
          fallbackCode += `
# RDS Database Instance
resource "aws_db_instance" "${resourceId}" {
  identifier           = "${resourceId.toLowerCase().replace(/_/g, '-')}-db"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  storage_encrypted    = true
  username             = "admin"
  password             = "CHANGE_ME_IMMEDIATELY"
  skip_final_snapshot  = true
  publicly_accessible  = false

  tags = {
    Name        = "${label}-database"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
`;
          break;
        case 'API Gateway':
          fallbackCode += `
# API Gateway REST API
resource "aws_api_gateway_rest_api" "${resourceId}" {
  name        = "${resourceId}_api"
  description = "API Gateway managed by Terraform"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name        = "${label}-api"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}
`;
          break;
      }
    });

    if (edges.length > 0) {
      fallbackCode += `
# Resource Connections
# The following connections were defined in the architecture:
`;
      edges.forEach((edge, index) => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        fallbackCode += `# ${index + 1}. ${sourceNode?.data.label || edge.source} -> ${targetNode?.data.label || edge.target}\n`;
      });
    }

    return NextResponse.json({ code: fallbackCode });
  }
}
