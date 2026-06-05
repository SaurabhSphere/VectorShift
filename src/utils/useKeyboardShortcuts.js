import { useEffect } from 'react';
import { useStore } from '../store';
import { useToast } from './ToastContext';

export const useKeyboardShortcuts = ({ toggleCommandPalette, submitPipeline }) => {
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const toast = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.isContentEditable);
          
      if (isInput) {
        if (e.key === 'Escape') {
          activeEl.blur();
        }
        return;
      }

      const isCmd = e.ctrlKey || e.metaKey;

      if (isCmd && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
          toast.info('Redone last change');
        } else {
          undo();
          toast.info('Undone last change');
        }
      } else if (isCmd && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        toast.info('Redone last change');
      } else if (isCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      } else if (isCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        submitPipeline();
      } else if (isCmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const selectionChanges = nodes.map((node) => ({
          id: node.id,
          type: 'select',
          selected: true,
        }));
        onNodesChange(selectionChanges);
        toast.info('Selected all nodes');
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = nodes.filter((n) => n.selected);
        const selectedEdges = edges.filter((e) => e.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          e.preventDefault();
          if (selectedNodes.length > 0) {
            onNodesChange(selectedNodes.map((n) => ({ id: n.id, type: 'remove' })));
          }
          if (selectedEdges.length > 0) {
            onEdgesChange(selectedEdges.map((edge) => ({ id: edge.id, type: 'remove' })));
          }
          toast.success('Deleted selected elements');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, nodes, edges, onNodesChange, onEdgesChange, toggleCommandPalette, submitPipeline, toast]);
};
