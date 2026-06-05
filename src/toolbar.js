// toolbar.js
import React, { useRef } from 'react';
import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { useToast } from './utils/ToastContext';
import { shallow } from 'zustand/shallow';
import { UndoIcon, RedoIcon, ExportIcon, ImportIcon, TrashIcon, KeyboardIcon, ZapIcon } from './utils/Icons';

const selector = (state) => ({
  past: state.past,
  future: state.future,
  undo: state.undo,
  redo: state.redo,
  clearCanvas: state.clearCanvas,
  exportPipeline: state.exportPipeline,
  importPipeline: state.importPipeline,
  toggleCommandPalette: state.toggleCommandPalette,
  nodes: state.nodes,
  connectionStyle: state.connectionStyle,
  connectionRouting: state.connectionRouting,
  setConnectionStyle: state.setConnectionStyle,
  setConnectionRouting: state.setConnectionRouting,
});

export const PipelineToolbar = () => {
  const {
    past,
    future,
    undo,
    redo,
    clearCanvas,
    exportPipeline,
    importPipeline,
    toggleCommandPalette,
    nodes,
    connectionStyle,
    connectionRouting,
    setConnectionStyle,
    setConnectionRouting,
  } = useStore(selector, shallow);

  const toast = useToast();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    try {
      exportPipeline();
      toast.success('Pipeline exported successfully!');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
          throw new Error('Invalid file format. Pipeline JSON must contain "nodes" and "edges" arrays.');
        }

        importPipeline(data.nodes, data.edges);
        toast.success(`Imported pipeline with ${data.nodes.length} nodes and ${data.edges.length} edges.`);
      } catch (err) {
        toast.error(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <div className="pipeline-toolbar">
      <div className="toolbar-header">
        <h1 className="toolbar-title">
          <span className="toolbar-logo" style={{ color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center' }}>
            <ZapIcon size={20} />
          </span>
          VectorShift Pipeline Editor
        </h1>
        <div className="toolbar-actions">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
          >
            <UndoIcon size={14} />
            {/* Undo */}
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="toolbar-btn"
            title="Redo (Ctrl+Y or Ctrl+Shift+Z)"
          >
            <RedoIcon size={14} />
            {/* Redo */}
          </button>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          <button
            onClick={handleExport}
            disabled={nodes.length === 0}
            className="toolbar-btn"
            title="Export JSON"
          >
            <ExportIcon size={14} />
            {/* Export */}
          </button>
          <button
            onClick={handleImportClick}
            className="toolbar-btn"
            title="Import JSON"
          >
            <ImportIcon size={14} />
            {/* Import */}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            style={{ display: 'none' }}
          />
          <button
            onClick={clearCanvas}
            disabled={nodes.length === 0}
            className="toolbar-btn"
            title="Clear canvas"
            style={{ color: 'var(--accent-red)' }}
          >
            <TrashIcon size={14} />
            Reset
          </button>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Route
            <select
              value={connectionRouting}
              onChange={(e) => setConnectionRouting(e.target.value)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-node)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-node)'}
            >
              <option value="smoothstep">SmoothStep</option>
              <option value="straight">Straight</option>
              <option value="step">Step</option>
              <option value="default">Bezier</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
            Style
            <select
              value={connectionStyle}
              onChange={(e) => setConnectionStyle(e.target.value)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-node)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '4px 8px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-indigo)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-node)'}
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
            </select>
          </label>
          <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
          <button
            onClick={toggleCommandPalette}
            className="toolbar-btn"
            title="Toggle Command Palette (Ctrl+K)"
            style={{ borderStyle: 'dashed' }}
          >
            <KeyboardIcon size={14} />
            Palette <kbd>Ctrl+K</kbd>
          </button>
        </div>
      </div>
      <div className="toolbar-chips-container">
        <DraggableNode type='customInput' label='Input' />
        <DraggableNode type='llm' label='LLM' />
        <DraggableNode type='customOutput' label='Output' />
        <DraggableNode type='text' label='Text' />
        <DraggableNode type='filter' label='Filter' />
        <DraggableNode type='merge' label='Merge' />
        <DraggableNode type='timer' label='Timer' />
        <DraggableNode type='apiCall' label='API Call' />
        <DraggableNode type='conditional' label='Conditional' />
      </div>
    </div>
  );
};
