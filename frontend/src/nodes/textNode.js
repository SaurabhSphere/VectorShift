// textNode.js
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';
import { parseVariables } from '../utils/parseVariables';

// Helper for measuring text width using canvas to avoid layout thrashing
const getTextWidth = (text, font) => {
  if (!getTextWidth.canvas) {
    getTextWidth.canvas = document.createElement('canvas');
  }
  const context = getTextWidth.canvas.getContext('2d');
  context.font = font;
  return context.measureText(text).width;
};

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const edges = useStore((state) => state.edges);
  const onEdgesChange = useStore((state) => state.onEdgesChange);

  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [dimensions, setDimensions] = useState({ width: 220, height: 80 });
  const textareaRef = useRef(null);

  // Dynamic variable parsing
  const variables = useMemo(() => parseVariables(currText), [currText]);
  
  // Build input handles from parsed variables
  const inputs = useMemo(() => {
    return variables.map((variable) => ({
      id: `${id}-var-${variable}-text`,
      label: variable,
    }));
  }, [id, variables]);

  // Function to adjust node dimensions based on text content
  const adjustSize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to measure scroll size accurately
    textarea.style.height = 'auto';
    const scrollH = textarea.scrollHeight;
    // Remove inline height override to let flexbox fill the card
    textarea.style.height = '';

    // Measure line widths
    const font = '12px system-ui, -apple-system, sans-serif';
    const lines = currText.split('\n');
    const maxWidth = lines.reduce((max, line) => {
      const w = getTextWidth(line, font);
      return w > max ? w : max;
    }, 0);

    // Add padding to widths and heights
    const newWidth = Math.min(500, Math.max(220, maxWidth + 40));
    const newHeight = Math.min(400, Math.max(80, scrollH + 40));

    setDimensions({ width: newWidth, height: newHeight });
  }, [currText]);

  // Adjust size when text changes locally (instant response)
  useEffect(() => {
    adjustSize();
  }, [adjustSize]);

  // Debounced store sync to prevent rapid state writes and edge-creation glitches
  useEffect(() => {
    const handler = setTimeout(() => {
      updateNodeField(id, 'text', currText);
    }, 200);

    return () => clearTimeout(handler);
  }, [currText, id, updateNodeField]);

  // Clean up orphaned edges when variables are removed
  useEffect(() => {
    const currentHandleIds = new Set(inputs.map((inp) => inp.id));
    const edgesToRemove = edges.filter((edge) => {
      // If the edge target is this node and is connected to a variable handle
      if (edge.target === id && edge.targetHandle && edge.targetHandle.startsWith(`${id}-var-`)) {
        return !currentHandleIds.has(edge.targetHandle);
      }
      return false;
    });

    if (edgesToRemove.length > 0) {
      onEdgesChange(edgesToRemove.map((edge) => ({ id: edge.id, type: 'remove' })));
    }
  }, [inputs, edges, id, onEdgesChange]);

  const handleTextChange = (e) => {
    setCurrText(e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Text"
      icon="📄"
      inputs={inputs}
      outputs={[{ id: `${id}-output-text`, label: 'Output' }]}
      onDelete={handleDelete}
      className="node-text"
      styles={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        transition: 'width 0.1s ease, height 0.1s ease',
      }}
    >
      <div className="node-field-group" style={{ height: 'calc(100% - 20px)' }}>
        <label className="node-label" style={{ height: '100%' }}>
          Text
          <textarea
            ref={textareaRef}
            value={currText}
            onChange={handleTextChange}
            rows={1}
            className="node-textarea"
            style={{
              resize: 'none',
              overflow: 'hidden',
              flexGrow: 1,
              width: '100%',
            }}
          />
        </label>
      </div>
    </BaseNode>
  );
};
