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

interface CostBreakdown {
  service: string;
  cost: number;
}

interface CostResponse {
  totalCost: number;
  breakdown: CostBreakdown[];
}

// Fallback cost estimation when AI is unavailable
function getFallbackCost(nodes: NodeData[]): CostResponse {
  const costMap: Record<string, number> = {
    'EC2': 35.04, // t3.micro
    'Lambda': 5.00,
    'S3': 2.30,
    'DynamoDB': 12.50,
    'RDS': 45.00,
    'API Gateway': 3.50,
  };

  const breakdown: CostBreakdown[] = [];
  let totalCost = 0;

  nodes.forEach((node) => {
    const serviceName = node.data.label;
    const cost = costMap[serviceName] || 10.00;
    breakdown.push({ service: serviceName, cost });
    totalCost += cost;
  });

  return { totalCost, breakdown };
}

export async function POST(request: NextRequest) {
  try {
    const { nodes } = await request.json();

    if (!nodes || nodes.length === 0) {
      return NextResponse.json({ totalCost: 0, breakdown: [] });
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

    const systemPrompt = 'You are an AWS Billing Agent. Estimate the monthly cost for these specific services (e.g., t3.micro vs c5.large). Assume standard production traffic. Return ONLY a single JSON object: { totalCost: number, breakdown: [{ service, cost }] }.';

    const userPrompt = `Estimate monthly AWS costs for:\n- ${serviceList}`;

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
      const content = responseBody.content[0].text;

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const costData: CostResponse = JSON.parse(jsonMatch[0]);
        return NextResponse.json(costData);
      }

      // Fallback if JSON parsing fails
      return NextResponse.json(getFallbackCost(nodes));
    } catch (aiError) {
      console.error('AI cost estimation failed, using fallback:', aiError);
      return NextResponse.json(getFallbackCost(nodes));
    }
  } catch (error) {
    console.error('Cost estimation error:', error);
    return NextResponse.json(
      { error: 'Failed to estimate costs' },
      { status: 500 }
    );
  }
}
