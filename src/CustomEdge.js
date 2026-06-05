import React from 'react';
import { getBezierPath, getSmoothStepPath, getStraightPath, EdgeLabelRenderer } from 'reactflow';
import { useStore } from './store';
import { XIcon } from './utils/Icons';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
}) => {
  const connectionRouting = useStore((state) => state.connectionRouting);
  const connectionStyle = useStore((state) => state.connectionStyle);
  const onEdgesChange = useStore((state) => state.onEdgesChange);

  const params = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  let edgePath = '';
  let labelX = 0;
  let labelY = 0;

  if (connectionRouting === 'straight') {
    [edgePath, labelX, labelY] = getStraightPath(params);
  } else if (connectionRouting === 'step') {
    [edgePath, labelX, labelY] = getSmoothStepPath({ ...params, borderRadius: 0 });
  } else if (connectionRouting === 'default') {
    [edgePath, labelX, labelY] = getBezierPath(params);
  } else {
    // smoothstep (default)
    [edgePath, labelX, labelY] = getSmoothStepPath(params);
  }

  // Format connection line style dynamically in real-time
  const edgeStyle = { ...style };
  let animatedClass = '';
  
  if (connectionStyle === 'dashed') {
    edgeStyle.strokeDasharray = '6,6';
    animatedClass = 'edge-animated';
  } else if (connectionStyle === 'dotted') {
    edgeStyle.strokeDasharray = '2,6';
    edgeStyle.strokeLinecap = 'round';
    edgeStyle.strokeWidth = 3;
    animatedClass = 'edge-animated';
  } else {
    // Solid line - clear dash configurations
    edgeStyle.strokeDasharray = undefined;
    edgeStyle.strokeLinecap = undefined;
    edgeStyle.strokeWidth = undefined;
  }

  const handleDelete = (event) => {
    event.stopPropagation();
    onEdgesChange([{ id, type: 'remove' }]);
  };

  return (
    <>
      {/* Visible formatted path */}
      <path
        id={id}
        style={edgeStyle}
        className={`react-flow__edge-path custom-edge-path ${animatedClass}`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* Invisible wider path on top to make clicking/hovering 10x easier */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="react-flow__edge-interaction"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              zIndex: 1000,
            }}
          >
            <button
              onClick={handleDelete}
              title="Delete connection"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.1s, background-color 0.1s',
                outline: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#ef4444';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
            >
              <XIcon size={10} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
