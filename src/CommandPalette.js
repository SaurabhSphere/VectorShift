import React, { useState, useEffect, useRef } from 'react';
import { useStore } from './store';
import { useToast } from './utils/ToastContext';

export const CommandPalette = ({ isOpen, onClose, reactFlowInstance, triggerImportClick, submitPipeline }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const itemRefs = useRef([]);

  const addNode = useStore((state) => state.addNode);
  const getNodeID = useStore((state) => state.getNodeID);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const clearCanvas = useStore((state) => state.clearCanvas);
  const exportPipeline = useStore((state) => state.exportPipeline);
  const toast = useToast();

  const handleAddNode = (type, label) => {
    let position = { x: 250, y: 250 };
    if (reactFlowInstance) {
      const zoom = reactFlowInstance.getZoom();
      const { x, y } = reactFlowInstance.getViewport();
      // Center of the window projected onto canvas coordinates
      position = reactFlowInstance.project({
        x: (window.innerWidth / 2 - x) / zoom - 100,
        y: (window.innerHeight / 2 - y) / zoom - 40,
      });
    }

    const nodeID = getNodeID(type);
    const newNode = {
      id: nodeID,
      type,
      position,
      data: { id: nodeID, nodeType: type },
    };

    addNode(newNode);
    toast.success(`Added ${label} Node`);
    onClose();
  };

  const commands = [
    { id: 'add-input', name: 'Add Node: Input', category: 'Nodes', action: () => handleAddNode('customInput', 'Input') },
    { id: 'add-llm', name: 'Add Node: LLM', category: 'Nodes', action: () => handleAddNode('llm', 'LLM') },
    { id: 'add-output', name: 'Add Node: Output', category: 'Nodes', action: () => handleAddNode('customOutput', 'Output') },
    { id: 'add-text', name: 'Add Node: Text', category: 'Nodes', action: () => handleAddNode('text', 'Text') },
    { id: 'add-filter', name: 'Add Node: Filter', category: 'Nodes', action: () => handleAddNode('filter', 'Filter') },
    { id: 'add-merge', name: 'Add Node: Merge', category: 'Nodes', action: () => handleAddNode('merge', 'Merge') },
    { id: 'add-timer', name: 'Add Node: Timer', category: 'Nodes', action: () => handleAddNode('timer', 'Timer') },
    { id: 'add-apiCall', name: 'Add Node: API Call', category: 'Nodes', action: () => handleAddNode('apiCall', 'API Call') },
    { id: 'add-conditional', name: 'Add Node: Conditional', category: 'Nodes', action: () => handleAddNode('conditional', 'Conditional') },
    
    { id: 'submit', name: 'Submit & Validate Pipeline', category: 'Actions', action: () => { submitPipeline(); onClose(); }, shortcut: 'Ctrl+S' },
    { id: 'export', name: 'Export Pipeline (JSON)', category: 'Data', action: () => {
      try {
        exportPipeline();
        toast.success('Pipeline exported successfully!');
      } catch (err) {
        toast.error(err.message);
      }
      onClose();
    } },
    { id: 'import', name: 'Import Pipeline (JSON)', category: 'Data', action: () => { triggerImportClick(); onClose(); } },
    { id: 'undo', name: 'Undo last action', category: 'History', action: () => { undo(); onClose(); }, shortcut: 'Ctrl+Z' },
    { id: 'redo', name: 'Redo last action', category: 'History', action: () => { redo(); onClose(); }, shortcut: 'Ctrl+Shift+Z' },
    { id: 'clear', name: 'Clear Canvas / Reset', category: 'Actions', action: () => {
      clearCanvas();
      toast.warning('Canvas cleared');
      onClose();
    } },
  ];

  // Filtering
  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Scroll active item into view
  useEffect(() => {
    const activeItem = itemRefs.current[selectedIndex];
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 7, 12, 0.75)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 11000,
        backdropFilter: 'blur(8px)',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '550px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60vh',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#f8fafc',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            aria-autocomplete="list"
            aria-controls="command-list"
            aria-activedescendant={filtered[selectedIndex] ? filtered[selectedIndex].id : undefined}
          />
        </div>

        <div
          id="command-list"
          role="listbox"
          style={{
            overflowY: 'auto',
            padding: '8px',
            flexGrow: 1,
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              No results found for "{search}"
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  id={cmd.id}
                  ref={(el) => (itemRefs.current[idx] = el)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={cmd.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                    border: isSelected ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                    color: isSelected ? '#fff' : '#94a3b8',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#818cf8' : '#64748b',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {cmd.category}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{cmd.name}</span>
                  </div>
                  {cmd.shortcut && (
                    <kbd
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        color: '#64748b',
                      }}
                    >
                      {cmd.shortcut}
                    </kbd>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
          <span>Press Ctrl+K to toggle anywhere</span>
        </div>
      </div>
    </div>
  );
};
