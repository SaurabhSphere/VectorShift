// conditionalNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const ConditionalNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const condition = data?.condition || 'x > 0';

  // Sync default state to store on mount
  useEffect(() => {
    if (data?.condition === undefined) {
      updateNodeField(id, 'condition', condition);
    }
  }, [id, data, condition, updateNodeField]);

  const handleConditionChange = (e) => {
    updateNodeField(id, 'condition', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Conditional"
      icon="🔀"
      inputs={[
        { id: `${id}-condition-text`, label: 'Cond' },
        { id: `${id}-data-any`, label: 'Data' },
      ]}
      outputs={[
        { id: `${id}-true-any`, label: 'True' },
        { id: `${id}-false-any`, label: 'False' },
      ]}
      onDelete={handleDelete}
      className="node-conditional"
    >
      <div className="node-field-group">
        <label className="node-label">
          If
          <input
            type="text"
            value={condition}
            onChange={handleConditionChange}
            placeholder="e.g. x === 10"
            className="node-input"
          />
        </label>
      </div>
    </BaseNode>
  );
};
