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
    category?: string;
    instanceType?: string;
    storageSize?: string;
    region?: string;
  };
}

interface EdgeData {
  id: string;
  source: string;
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, nodes, edges } = await request.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({
        explanation: '## No Architecture to Explain\n\nAdd some AWS services to the canvas to generate an architecture explanation.',
      });
    }

    // Build service list for the prompt
    const serviceList = nodes.map((node: NodeData) => {
      const details = [];
      details.push(node.data.label);
      if (node.data.instanceType) details.push(`instance: ${node.data.instanceType}`);
      if (node.data.storageSize) details.push(`storage: ${node.data.storageSize}`);
      if (node.data.region) details.push(`region: ${node.data.region}`);
      return details.join(', ');
    }).join('\n- ');

    // Build connections list
    const connectionsList = edges?.map((edge: EdgeData) => {
      const sourceNode = nodes.find((n: NodeData) => n.id === edge.source);
      const targetNode = nodes.find((n: NodeData) => n.id === edge.target);
      if (sourceNode && targetNode) {
        return `${sourceNode.data.label} → ${targetNode.data.label}`;
      }
      return null;
    }).filter(Boolean).join('\n- ') || 'No connections defined';

    const systemPrompt = `You are a Senior Cloud Architect. Briefly explain this architecture to a client. Use Markdown formatting.
Structure:
**The Strategy:** 1 sentence summary.
**Key Decisions:** 3 bullet points explaining why specific services were chosen (e.g., "Chosen DynamoDB for millisecond latency").
**Data Flow:** How data moves through the system.
Keep it under 150 words. Be professional and concise.`;

    const userPrompt = `Architecture context: ${prompt || 'AWS cloud architecture'}

Services:
- ${serviceList}

Connections:
- ${connectionsList}`;

    try {
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      };

      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-haiku-20240307-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      });

      const response = await bedrockClient.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const explanation = responseBody.content[0].text;

      return NextResponse.json({ explanation });
    } catch (aiError) {
      console.error('AI explanation failed:', aiError);
      // Fallback explanation
      const fallbackExplanation = `## Architecture Overview

**The Strategy:** This architecture leverages ${nodes.length} AWS services to build a scalable cloud solution.

**Key Decisions:**
- **${nodes[0]?.data.label || 'Primary Service'}** selected as the foundation for reliable performance
- **Multi-service approach** ensures separation of concerns and scalability
- **AWS-native services** provide seamless integration and managed infrastructure

**Data Flow:** Requests flow through the connected services, with each component handling its specialized function before passing data downstream.`;

      return NextResponse.json({ explanation: fallbackExplanation });
    }
  } catch (error) {
    console.error('Explanation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate explanation' },
      { status: 500 }
    );
  }
}
