// inputNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const InputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const currName = data?.inputName || id.replace('customInput-', 'input_');
  const inputType = data?.inputType || 'Text';

  // Sync initial defaults to store on mount
  useEffect(() => {
    if (data?.inputName === undefined) {
      updateNodeField(id, 'inputName', currName);
    }
    if (data?.inputType === undefined) {
      updateNodeField(id, 'inputType', inputType);
    }
  }, [id, data, currName, inputType, updateNodeField]);

  const handleNameChange = (e) => {
    updateNodeField(id, 'inputName', e.target.value);
  };

  const handleTypeChange = (e) => {
    updateNodeField(id, 'inputType', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Input"
      icon="📥"
      outputs={[{ id: `${id}-value-text`, label: 'Value' }]}
      onDelete={handleDelete}
      className="node-customInput"
    >
      <div className="node-field-group">
        <label className="node-label">
          Name
          <input
            type="text"
            value={currName}
            onChange={handleNameChange}
            className="node-input"
          />
        </label>
        <label className="node-label">
          Type
          <select
            value={inputType}
            onChange={handleTypeChange}
            className="node-select"
          >
            <option value="Text">Text</option>
            <option value="File">File</option>
          </select>
        </label>
      </div>
    </BaseNode>
  );
};
