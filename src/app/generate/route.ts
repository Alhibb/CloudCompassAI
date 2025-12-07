import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextResponse } from "next/server";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // The "Winning" System Prompt
    const systemPrompt = `You are an expert AWS Solutions Architect.
    User Goal: "${prompt}"
    
    Task: Generate a React Flow JSON structure for this architecture.
    
    Requirements:
    1. Use accurate AWS service names.
    2. Layout: Input/Client on Left -> Processing in Middle -> Database/Storage on Right.
    3. Edges: Connect them logically. Add "animated: true" to all edges to make them flow.
    4. Return STRICT JSON only. No markdown.
    
    Output Format:
    {
      "nodes": [
        { "id": "1", "type": "default", "position": { "x": 0, "y": 0 }, "data": { "label": "Service Name", "icon": "service-type" } }
      ],
      "edges": [
        { "id": "e1-2", "source": "1", "target": "2", "animated": true, "style": { "stroke": "#3b82f6" } }
      ]
    }`;

    const input = {
      modelId: "anthropic.claude-3-haiku-20240307-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 2500,
        messages: [{ role: "user", content: systemPrompt }],
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    const rawRes = new TextDecoder().decode(response.body);
    const jsonRes = JSON.parse(rawRes);
    // Extract JSON from potential chatter
    const text = jsonRes.content[0].text;
    const cleanJson = text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1,
    );

    return NextResponse.json(JSON.parse(cleanJson));
  } catch (error) {
    console.error("Bedrock Error:", error);
    return NextResponse.json(
      { error: "Architecture generation failed" },
      { status: 500 },
    );
  }
}
