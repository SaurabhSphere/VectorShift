// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';

let debounceTimeout = null;
let initialSnapshotState = null;

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
    nodeIDs: {},
    past: [],
    future: [],
    commandPaletteOpen: false,
    connectionStyle: 'solid',
    connectionRouting: 'smoothstep',

    setConnectionStyle: (style) => set({ connectionStyle: style }),
    setConnectionRouting: (routing) => set({ connectionRouting: routing }),

    toggleCommandPalette: () => {
      set({ commandPaletteOpen: !get().commandPaletteOpen });
    },

    setCommandPaletteOpen: (isOpen) => {
      set({ commandPaletteOpen: isOpen });
    },

    takeSnapshot: () => {
      // If there is a pending debounced snapshot (e.g. typing session), flush it first to keep chronology
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
      }
      if (initialSnapshotState) {
        const past = get().past || [];
        const lastPast = past[past.length - 1];
        const snapshotStr = JSON.stringify(initialSnapshotState);
        const lastPastStr = lastPast ? JSON.stringify(lastPast) : '';

        if (snapshotStr !== lastPastStr) {
          set({
            past: [...past, initialSnapshotState].slice(-50),
            future: [],
          });
        }
        initialSnapshotState = null;
      }

      const { nodes, edges, nodeIDs } = get();
      const nodesClone = JSON.parse(JSON.stringify(nodes));
      const edgesClone = JSON.parse(JSON.stringify(edges));
      const nodeIDsClone = JSON.parse(JSON.stringify(nodeIDs));

      // Limit history to 50 entries
      const newPast = [...get().past, { nodes: nodesClone, edges: edgesClone, nodeIDs: nodeIDsClone }].slice(-50);
      set({
        past: newPast,
        future: [], // clear future stack on new user actions
      });
    },

    takeDebouncedSnapshot: () => {
      if (!initialSnapshotState) {
        const { nodes, edges, nodeIDs } = get();
        initialSnapshotState = {
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          nodeIDs: JSON.parse(JSON.stringify(nodeIDs)),
        };
      }

      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }

      debounceTimeout = setTimeout(() => {
        if (initialSnapshotState) {
          const past = get().past || [];
          const lastPast = past[past.length - 1];

          const snapshotStr = JSON.stringify(initialSnapshotState);
          const lastPastStr = lastPast ? JSON.stringify(lastPast) : '';

          if (snapshotStr !== lastPastStr) {
            const newPast = [...past, initialSnapshotState].slice(-50);
            set({
              past: newPast,
              future: [],
            });
          }
          initialSnapshotState = null;
        }
      }, 800);
    },

    undo: () => {
      const { past, future, nodes, edges, nodeIDs } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);

      const currentNodesClone = JSON.parse(JSON.stringify(nodes));
      const currentEdgesClone = JSON.parse(JSON.stringify(edges));
      const currentNodeIDsClone = JSON.parse(JSON.stringify(nodeIDs));

      set({
        past: newPast,
        future: [...future, { nodes: currentNodesClone, edges: currentEdgesClone, nodeIDs: currentNodeIDsClone }],
        nodes: previous.nodes,
        edges: previous.edges,
        nodeIDs: previous.nodeIDs || {},
      });
    },

    redo: () => {
      const { future, past, nodes, edges, nodeIDs } = get();
      if (future.length === 0) return;

      const next = future[future.length - 1];
      const newFuture = future.slice(0, future.length - 1);

      const currentNodesClone = JSON.parse(JSON.stringify(nodes));
      const currentEdgesClone = JSON.parse(JSON.stringify(edges));
      const currentNodeIDsClone = JSON.parse(JSON.stringify(nodeIDs));

      set({
        past: [...past, { nodes: currentNodesClone, edges: currentEdgesClone, nodeIDs: currentNodeIDsClone }],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
        nodeIDs: next.nodeIDs || {},
      });
    },

    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;
    },

    addNode: (node) => {
        get().takeSnapshot();
        set({
            nodes: [...get().nodes, node]
        });
    },

    onNodesChange: (changes) => {
      // Take snapshot if there is a deletion change
      const isRemoval = changes.some(c => c.type === 'remove');
      if (isRemoval) {
        get().takeSnapshot();
      }
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      // Take snapshot if there is a deletion change
      const isRemoval = changes.some(c => c.type === 'remove');
      if (isRemoval) {
        get().takeSnapshot();
      }
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection) => {
      get().takeSnapshot();
      const { connectionStyle, connectionRouting } = get();

      let edgeStyle = {};
      if (connectionStyle === 'dashed') {
        edgeStyle = { strokeDasharray: '6,6' };
      } else if (connectionStyle === 'dotted') {
        edgeStyle = { strokeDasharray: '2,6', strokeLinecap: 'round', strokeWidth: 3 };
      }

      set({
        edges: addEdge({
          ...connection,
          type: connectionRouting,
          animated: false,
          style: edgeStyle,
          markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}
        }, get().edges),
      });
    },

    updateNodeField: (nodeId, fieldName, fieldValue) => {
      get().takeDebouncedSnapshot();
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },

    importPipeline: (importedNodes, importedEdges) => {
      get().takeSnapshot();
      set({
        nodes: importedNodes,
        edges: importedEdges,
      });
      // Re-scan nodeIDs to adjust our counters so new nodes don't collide with existing ones
      const newIDs = {};
      importedNodes.forEach(node => {
        const parts = node.id.split('-');
        if (parts.length >= 2) {
          const type = parts.slice(0, parts.length - 1).join('-');
          const idNum = parseInt(parts[parts.length - 1], 10);
          if (!isNaN(idNum)) {
            newIDs[type] = Math.max(newIDs[type] || 0, idNum);
          }
        }
      });
      set({ nodeIDs: newIDs });
    },

    clearCanvas: () => {
      if (get().nodes.length > 0) {
        get().takeSnapshot();
        set({
          nodes: [],
          edges: [],
        });
      }
    },

    exportPipeline: () => {
      const { nodes, edges } = get();
      if (nodes.length === 0) {
        throw new Error('Cannot export an empty pipeline.');
      }
      const pipelineData = {
        version: "1.0.0",
        nodes,
        edges
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pipelineData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "pipeline-export.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    submitLoading: false,
    submitResult: null,
    showSubmitModal: false,
    setShowSubmitModal: (show) => set({ showSubmitModal: show }),
    submitPipeline: async () => {
      const { nodes, edges } = get();
      if (nodes.length === 0) {
        set({
          submitResult: { error: 'Please add at least one node to your pipeline first.' },
          showSubmitModal: true,
        });
        return;
      }

      set({ submitLoading: true });
      try {
        const response = await fetch('http://localhost:8000/pipelines/parse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nodes: nodes.map(n => ({ id: n.id })),
            edges: edges.map(e => ({ source: e.source, target: e.target })),
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        set({
          submitResult: {
            num_nodes: data.num_nodes,
            num_edges: data.num_edges,
            is_dag: data.is_dag,
          },
          showSubmitModal: true,
        });
      } catch (error) {
        set({
          submitResult: {
            error: `Failed to connect to the backend server. Make sure your FastAPI backend is running on http://localhost:8000.\n\nDetail: ${error.message}`,
          },
          showSubmitModal: true,
        });
      } finally {
        set({ submitLoading: false });
      }
    },
}));
