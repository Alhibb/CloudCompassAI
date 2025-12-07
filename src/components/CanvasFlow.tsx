'use client';

import { useCallback, useRef, forwardRef, useImperativeHandle, Ref } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { AWSNode, AWSNodeData } from './AWSNode';
import { AWSService } from '@/types/aws-services';
import { useCanvasStore } from '@/store/canvas-store';

const nodeTypes = {
  awsNode: AWSNode,
};

export interface CanvasFlowRef {
  fitView: () => void;
  downloadImage: () => Promise<void>;
}

interface CanvasFlowInnerProps {
  innerRef: Ref<CanvasFlowRef>;
}

function CanvasFlowInner({ innerRef }: CanvasFlowInnerProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, setSelectedNode } = useCanvasStore();

  useImperativeHandle(innerRef, () => ({
    fitView: () => {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 800 });
      }, 100);
    },
    downloadImage: async () => {
      if (!reactFlowWrapper.current) {
        console.log('Canvas wrapper not found');
        return;
      }
      
      try {
        const flowElement = reactFlowWrapper.current.querySelector('.react-flow') as HTMLElement;
        if (!flowElement) {
          console.log('React Flow element not found');
          return;
        }
        
        const dataUrl = await toPng(flowElement, {
          backgroundColor: '#020617',
          quality: 1,
          pixelRatio: 2,
        });
        
        const link = document.createElement('a');
        link.download = `cloudcompass-architecture-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error downloading image:', error);
      }
    },
  }), [fitView]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const serviceData = event.dataTransfer.getData('application/reactflow');
      if (!serviceData) return;

      const service: AWSService = JSON.parse(serviceData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<AWSNodeData> = {
        id: `${service.id}-${Date.now()}`,
        type: 'awsNode',
        position,
        data: {
          label: service.name,
          icon: service.icon,
          color: service.color,
          category: service.category,
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<AWSNodeData>) => {
      setSelectedNode(node);
    },
    [setSelectedNode]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'url(#edge-gradient)', strokeWidth: 2 },
        }}
        fitView
        className="bg-slate-950"
      >
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#475569"
          style={{ opacity: 0.3 }}
        />
        <Controls
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg [&>button]:bg-transparent [&>button]:text-slate-200 [&>button]:border-b [&>button]:border-slate-800 [&>button:hover]:bg-slate-800/50"
        />
        <MiniMap
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg"
          nodeColor={(node) => {
            const data = node.data as AWSNodeData;
            return data.color || '#64748b';
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}

export const CanvasFlow = forwardRef<CanvasFlowRef>(function CanvasFlow(_, ref) {
  return (
    <ReactFlowProvider>
      <CanvasFlowInner innerRef={ref} />
    </ReactFlowProvider>
  );
});
