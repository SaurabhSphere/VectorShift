// mergeNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const MergeNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const mergeStrategy = data?.mergeStrategy || 'Concat';

  // Sync default state to store on mount
  useEffect(() => {
    if (data?.mergeStrategy === undefined) {
      updateNodeField(id, 'mergeStrategy', mergeStrategy);
    }
  }, [id, data, mergeStrategy, updateNodeField]);

  const handleStrategyChange = (e) => {
    updateNodeField(id, 'mergeStrategy', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Merge"
      icon="🔗"
      inputs={[
        { id: `${id}-input_1-any`, label: 'Input 1' },
        { id: `${id}-input_2-any`, label: 'Input 2' },
      ]}
      outputs={[{ id: `${id}-merged-any`, label: 'Merged' }]}
      onDelete={handleDelete}
      className="node-merge"
    >
      <div className="node-field-group">
        <label className="node-label">
          Strategy
          <select
            value={mergeStrategy}
            onChange={handleStrategyChange}
            className="node-select"
          >
            <option value="Concat">Concatenate</option>
            <option value="Zip">Zip</option>
            <option value="Join">Join</option>
          </select>
        </label>
      </div>
    </BaseNode>
  );
};
