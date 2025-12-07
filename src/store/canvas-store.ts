'use client';

import { create } from 'zustand';
import { Node, Edge, addEdge, Connection, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react';
import { AWSNodeData } from '@/components/AWSNode';

interface CanvasState {
  nodes: Node<AWSNodeData>[];
  edges: Edge[];
  selectedNode: Node<AWSNodeData> | null;
  setNodes: (nodes: Node<AWSNodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange<Node<AWSNodeData>>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: Node<AWSNodeData>) => void;
  clearCanvas: () => void;
  setArchitecture: (nodes: Node<AWSNodeData>[], edges: Edge[]) => void;
  setSelectedNode: (node: Node<AWSNodeData> | null) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<AWSNodeData>[],
    });
  },
  
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          animated: true,
          style: {
            stroke: 'url(#edge-gradient)',
            strokeWidth: 2,
          },
        },
        get().edges
      ),
    });
  },
  
  addNode: (node) => {
    set({
      nodes: [...get().nodes, node],
    });
  },
  
  clearCanvas: () => set({ nodes: [], edges: [], selectedNode: null }),
  
  setArchitecture: (nodes, edges) => set({ nodes, edges }),
  
  setSelectedNode: (node) => set({ selectedNode: node }),
}));
