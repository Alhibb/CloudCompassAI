'use client';

import { useState, useCallback, useRef } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { CanvasFlow, CanvasFlowRef } from '@/components/CanvasFlow';
import { ExportModal } from '@/components/ExportModal';
import { GenerateModal } from '@/components/GenerateModal';
import { DetailsPanel } from '@/components/DetailsPanel';
import { CostBadge } from '@/components/CostBadge';
import { AWSService } from '@/types/aws-services';
import { useCanvasStore } from '@/store/canvas-store';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

export default function Page() {
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { nodes, edges, setArchitecture, selectedNode, setSelectedNode } = useCanvasStore();
  const canvasRef = useRef<CanvasFlowRef>(null);
  const { toast } = useToast();

  const onDragStart = useCallback((event: React.DragEvent, service: AWSService) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(service));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleGenerate = useCallback(() => {
    setGenerateModalOpen(true);
  }, []);

  const handleGenerateSubmit = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate architecture');
      }

      const data = await response.json();
      
      // Update the canvas with generated nodes and edges
      setArchitecture(data.nodes, data.edges);
      
      // Close modal and fit view
      setGenerateModalOpen(false);
      
      // Use fitView to zoom into the diagram
      setTimeout(() => {
        canvasRef.current?.fitView();
      }, 100);
    } catch (error) {
      console.error('Error generating architecture:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [setArchitecture]);

  const handleDownloadImage = useCallback(() => {
    canvasRef.current?.downloadImage();
  }, []);

  const generateTerraformCode = useCallback(() => {
    if (nodes.length === 0) {
      return '# No resources to export\n# Add AWS components to the canvas to generate Terraform code';
    }

    let terraform = `# CloudCompass AI - Generated Terraform Configuration
# Generated on ${new Date().toLocaleString()}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

`;

    nodes.forEach((node) => {
      const data = node.data;
      const resourceId = node.id.replace(/-/g, '_');

      switch (data.label) {
        case 'EC2':
          terraform += `
resource "aws_instance" "${resourceId}" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "${data.label}-${resourceId}"
  }
}
`;
          break;

        case 'Lambda':
          terraform += `
resource "aws_lambda_function" "${resourceId}" {
  filename      = "lambda_function.zip"
  function_name = "${resourceId}"
  role          = aws_iam_role.${resourceId}_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  tags = {
    Name = "${data.label}-${resourceId}"
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
`;
          break;

        case 'S3':
          terraform += `
resource "aws_s3_bucket" "${resourceId}" {
  bucket = "${resourceId}-bucket"

  tags = {
    Name = "${data.label}-${resourceId}"
  }
}
`;
          break;

        case 'DynamoDB':
          terraform += `
resource "aws_dynamodb_table" "${resourceId}" {
  name           = "${resourceId}_table"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "${data.label}-${resourceId}"
  }
}
`;
          break;

        case 'RDS':
          terraform += `
resource "aws_db_instance" "${resourceId}" {
  identifier           = "${resourceId}-db"
  engine               = "postgres"
  engine_version       = "15.3"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "admin"
  password             = "changeme123" # Change this!
  skip_final_snapshot  = true

  tags = {
    Name = "${data.label}-${resourceId}"
  }
}
`;
          break;

        case 'API Gateway':
          terraform += `
resource "aws_api_gateway_rest_api" "${resourceId}" {
  name        = "${resourceId}_api"
  description = "API Gateway for ${resourceId}"

  tags = {
    Name = "${data.label}-${resourceId}"
  }
}
`;
          break;
      }
    });

    if (edges.length > 0) {
      terraform += `
# Connections between resources
# The following edges were defined:
`;
      edges.forEach((edge, index) => {
        terraform += `# ${index + 1}. ${edge.source} -> ${edge.target}\n`;
      });
    }

    return terraform;
  }, [nodes, edges]);

  const handleExport = useCallback(async () => {
    if (nodes.length === 0) {
      toast({
        title: "No resources to export",
        description: "Add AWS components to the canvas first",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Generating Infrastructure Code...",
      description: "AI is creating your Terraform configuration",
    });

    try {
      const response = await fetch('/api/export-terraform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Terraform');
      }

      const data = await response.json();
      
      // Create and trigger file download
      const blob = new Blob([data.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'architecture.tf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success toast
      toast({
        title: "Export Successful! 🎉",
        description: "Your Terraform configuration has been downloaded",
      });

    } catch (error) {
      console.error('Error exporting Terraform:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating your Terraform code",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [nodes, edges, toast]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Radial gradient background overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.5) 0%, rgba(2, 6, 23, 1) 70%)',
        }}
      />
      
      {/* Geometric pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <Sidebar onDragStart={onDragStart} />
      <TopBar onGenerate={handleGenerate} onExport={handleExport} onDownloadImage={handleDownloadImage} isExporting={isExporting} />
      
      <div className="absolute left-[280px] top-[72px] right-0 bottom-0 z-10">
        <CanvasFlow ref={canvasRef} />
      </div>

      <ExportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        terraformCode={generateTerraformCode()}
      />

      <GenerateModal
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        onGenerate={handleGenerateSubmit}
        isLoading={isGenerating}
      />

      <DetailsPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      <CostBadge nodeCount={nodes.length} />
      <Toaster />
    </div>
  );
}
