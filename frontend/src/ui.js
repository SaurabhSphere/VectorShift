// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode, LLMNode, OutputNode, TextNode, FilterNode, MergeNode, TimerNode, APICallNode, ConditionalNode } from './nodes';
import { CommandPalette } from './CommandPalette';
import { useKeyboardShortcuts } from './utils/useKeyboardShortcuts';

import { CustomEdge } from './CustomEdge';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  filter: FilterNode,
  merge: MergeNode,
  timer: TimerNode,
  apiCall: APICallNode,
  conditional: ConditionalNode,
};

const edgeTypes = {
  custom: CustomEdge,
  smoothstep: CustomEdge,
  straight: CustomEdge,
  step: CustomEdge,
  default: CustomEdge,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  takeSnapshot: state.takeSnapshot,
  commandPaletteOpen: state.commandPaletteOpen,
  setCommandPaletteOpen: state.setCommandPaletteOpen,
  toggleCommandPalette: state.toggleCommandPalette,
  submitPipeline: state.submitPipeline,
  connectionStyle: state.connectionStyle,
  connectionRouting: state.connectionRouting,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      takeSnapshot,
      commandPaletteOpen,
      setCommandPaletteOpen,
      toggleCommandPalette,
      submitPipeline,
      connectionStyle,
      connectionRouting,
    } = useStore(selector, shallow);

    useKeyboardShortcuts({ toggleCommandPalette, submitPipeline });

    const onNodeDragStop = useCallback(() => {
      takeSnapshot();
    }, [takeSnapshot]);

    const isValidConnection = useCallback((connection) => {
      // 1. Prevent self-connection
      if (connection.source === connection.target) {
        return false;
      }

      // 2. Prevent duplicate connections
      const alreadyConnected = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.sourceHandle === connection.sourceHandle &&
          edge.target === connection.target &&
          edge.targetHandle === connection.targetHandle
      );
      if (alreadyConnected) {
        return false;
      }

      // 3. Prevent multiple inputs into the same target handle
      const targetAlreadyConnected = edges.some(
        (edge) =>
          edge.target === connection.target &&
          edge.targetHandle === connection.targetHandle
      );
      if (targetAlreadyConnected) {
        return false;
      }

      // 4. Validate types based on handle ID suffixes
      const getHandleType = (handleId) => {
        if (!handleId) return 'any';
        const parts = handleId.split('-');
        return parts[parts.length - 1] || 'any';
      };

      const sourceType = getHandleType(connection.sourceHandle);
      const targetType = getHandleType(connection.targetHandle);

      if (sourceType === 'any' || targetType === 'any') {
        return true;
      }

      return sourceType === targetType;
    }, [edges]);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const triggerImportClick = () => {
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        fileInput.click();
      }
    };

    const getConnectionLineStyle = () => {
      if (connectionStyle === 'dashed') {
        return { stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '6,6' };
      }
      if (connectionStyle === 'dotted') {
        return { stroke: '#6366f1', strokeWidth: 3, strokeDasharray: '2,6', strokeLinecap: 'round' };
      }
      return { stroke: '#6366f1', strokeWidth: 2 }; // solid
    };

    return (
        <>
        <div ref={reactFlowWrapper} style={{width: '100%', height: '100%'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                onNodeDragStop={onNodeDragStop}
                isValidConnection={isValidConnection}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType={connectionRouting}
                connectionLineStyle={getConnectionLineStyle()}
            >
                <Background color="#aaa" gap={gridSize} />
                <Controls />
                <MiniMap />
            </ReactFlow>
            <CommandPalette
              isOpen={commandPaletteOpen}
              onClose={() => setCommandPaletteOpen(false)}
              reactFlowInstance={reactFlowInstance}
              triggerImportClick={triggerImportClick}
              submitPipeline={submitPipeline}
            />
        </div>
        </>
    )
}
