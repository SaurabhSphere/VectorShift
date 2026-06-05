// BaseNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { XIcon } from '../utils/Icons';

export const BaseNode = ({
  id,
  title,
  icon,
  inputs = [],
  outputs = [],
  children,
  className = '',
  styles = {},
  onDelete,
}) => {
  return (
    <div
      className={`base-node ${className}`}
      style={{
        ...styles,
      }}
    >
      {/* Header */}
      <div className="base-node-header">
        <div className="base-node-title-area">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="base-node-delete-btn"
            title="Delete Node"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <XIcon size={12} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="base-node-body">
        {children}
      </div>

      {/* Input Handles (Left side) */}
      {inputs.map((input, index) => {
        const topPercent = input.top || (inputs.length === 1 ? '50%' : `${((index + 1) / (inputs.length + 1)) * 100}%`);
        return (
          <React.Fragment key={input.id}>
            <Handle
              type="target"
              position={input.position || Position.Left}
              id={input.id}
              style={{
                top: topPercent,
                ...input.style,
              }}
            />
            {input.label && (
              <span
                className="handle-label input-handle-label"
                style={{
                  top: topPercent,
                }}
              >
                {input.label}
              </span>
            )}
          </React.Fragment>
        );
      })}

      {/* Output Handles (Right side) */}
      {outputs.map((output, index) => {
        const topPercent = output.top || (outputs.length === 1 ? '50%' : `${((index + 1) / (outputs.length + 1)) * 100}%`);
        return (
          <React.Fragment key={output.id}>
            <Handle
              type="source"
              position={output.position || Position.Right}
              id={output.id}
              style={{
                top: topPercent,
                ...output.style,
              }}
            />
            {output.label && (
              <span
                className="handle-label output-handle-label"
                style={{
                  top: topPercent,
                }}
              >
                {output.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
