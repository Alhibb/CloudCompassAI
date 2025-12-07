import { NextRequest, NextResponse } from 'next/server';

// AWS service configurations for generating nodes
const AWS_SERVICES = {
  ec2: { id: 'ec2', name: 'EC2', icon: 'Server', color: '#06b6d4', category: 'compute' },
  lambda: { id: 'lambda', name: 'Lambda', icon: 'Zap', color: '#06b6d4', category: 'compute' },
  s3: { id: 's3', name: 'S3', icon: 'Database', color: '#10b981', category: 'storage' },
  dynamodb: { id: 'dynamodb', name: 'DynamoDB', icon: 'Table', color: '#8b5cf6', category: 'database' },
  rds: { id: 'rds', name: 'RDS', icon: 'HardDrive', color: '#8b5cf6', category: 'database' },
  apigateway: { id: 'apigateway', name: 'API Gateway', icon: 'Globe', color: '#d946ef', category: 'networking' },
};

interface GeneratedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    icon: string;
    color: string;
    category: string;
  };
}

interface GeneratedEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
}

// Simple keyword-based architecture generation
function generateArchitecture(prompt: string): { nodes: GeneratedNode[]; edges: GeneratedEdge[] } {
  const lowerPrompt = prompt.toLowerCase();
  const nodes: GeneratedNode[] = [];
  const edges: GeneratedEdge[] = [];
  
  let nodeIndex = 0;
  const nodeIds: string[] = [];
  
  // Grid layout configuration
  const startX = 100;
  const startY = 100;
  const spacingX = 300;
  const spacingY = 200;
  const nodesPerRow = 3;
  
  const addNode = (serviceKey: keyof typeof AWS_SERVICES) => {
    const service = AWS_SERVICES[serviceKey];
    const row = Math.floor(nodeIndex / nodesPerRow);
    const col = nodeIndex % nodesPerRow;
    const id = `${service.id}-${Date.now()}-${nodeIndex}`;
    
    nodes.push({
      id,
      type: 'awsNode',
      position: {
        x: startX + col * spacingX,
        y: startY + row * spacingY,
      },
      data: {
        label: service.name,
        icon: service.icon,
        color: service.color,
        category: service.category,
      },
    });
    
    nodeIds.push(id);
    nodeIndex++;
    return id;
  };
  
  // Detect architecture patterns from prompt
  const hasApi = lowerPrompt.includes('api') || lowerPrompt.includes('rest') || lowerPrompt.includes('endpoint');
  const hasServerless = lowerPrompt.includes('serverless') || lowerPrompt.includes('lambda') || lowerPrompt.includes('function');
  const hasDatabase = lowerPrompt.includes('database') || lowerPrompt.includes('data') || lowerPrompt.includes('store') || lowerPrompt.includes('storage');
  const hasDynamoDB = lowerPrompt.includes('dynamodb') || lowerPrompt.includes('nosql');
  const hasRDS = lowerPrompt.includes('rds') || lowerPrompt.includes('postgres') || lowerPrompt.includes('mysql') || lowerPrompt.includes('sql');
  const hasS3 = lowerPrompt.includes('s3') || lowerPrompt.includes('bucket') || lowerPrompt.includes('static') || lowerPrompt.includes('file') || lowerPrompt.includes('asset');
  const hasEC2 = lowerPrompt.includes('ec2') || lowerPrompt.includes('server') || lowerPrompt.includes('instance') || lowerPrompt.includes('vm');
  const hasWeb = lowerPrompt.includes('web') || lowerPrompt.includes('website') || lowerPrompt.includes('frontend');
  
  // Build architecture based on detected patterns
  let apiGatewayId: string | null = null;
  let lambdaId: string | null = null;
  let ec2Id: string | null = null;
  
  // Add API Gateway if API is mentioned
  if (hasApi || hasWeb) {
    apiGatewayId = addNode('apigateway');
  }
  
  // Add compute layer
  if (hasServerless) {
    lambdaId = addNode('lambda');
    if (apiGatewayId) {
      edges.push({
        id: `edge-${apiGatewayId}-${lambdaId}`,
        source: apiGatewayId,
        target: lambdaId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }
  }
  
  if (hasEC2 || (!hasServerless && (hasWeb || hasApi))) {
    ec2Id = addNode('ec2');
    if (apiGatewayId && !lambdaId) {
      edges.push({
        id: `edge-${apiGatewayId}-${ec2Id}`,
        source: apiGatewayId,
        target: ec2Id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }
  }
  
  // Add database layer
  const computeId = lambdaId || ec2Id;
  
  if (hasDynamoDB || (hasDatabase && hasServerless)) {
    const dynamoId = addNode('dynamodb');
    if (computeId) {
      edges.push({
        id: `edge-${computeId}-${dynamoId}`,
        source: computeId,
        target: dynamoId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }
  }
  
  if (hasRDS || (hasDatabase && !hasDynamoDB && !hasServerless)) {
    const rdsId = addNode('rds');
    if (computeId) {
      edges.push({
        id: `edge-${computeId}-${rdsId}`,
        source: computeId,
        target: rdsId,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }
  }
  
  // Add S3 for storage
  if (hasS3 || hasWeb) {
    const s3Id = addNode('s3');
    if (computeId) {
      edges.push({
        id: `edge-${computeId}-${s3Id}`,
        source: computeId,
        target: s3Id,
        animated: true,
        style: { stroke: '#8b5cf6', strokeWidth: 2 },
      });
    }
  }
  
  // If no specific services detected, create a basic web architecture
  if (nodes.length === 0) {
    const apiId = addNode('apigateway');
    const lambdaNodeId = addNode('lambda');
    const dynamoNodeId = addNode('dynamodb');
    
    edges.push({
      id: `edge-${apiId}-${lambdaNodeId}`,
      source: apiId,
      target: lambdaNodeId,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    });
    
    edges.push({
      id: `edge-${lambdaNodeId}-${dynamoNodeId}`,
      source: lambdaNodeId,
      target: dynamoNodeId,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
    });
  }
  
  return { nodes, edges };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Generate architecture based on prompt
    const architecture = generateArchitecture(prompt);
    
    return NextResponse.json(architecture);
  } catch (error) {
    console.error('Error generating architecture:', error);
    return NextResponse.json(
      { error: 'Failed to generate architecture' },
      { status: 500 }
    );
  }
}
