// outputNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const currName = data?.outputName || id.replace('customOutput-', 'output_');
  const outputType = data?.outputType || 'Text';

  // Sync initial defaults to store on mount
  useEffect(() => {
    if (data?.outputName === undefined) {
      updateNodeField(id, 'outputName', currName);
    }
    if (data?.outputType === undefined) {
      updateNodeField(id, 'outputType', outputType);
    }
  }, [id, data, currName, outputType, updateNodeField]);

  const handleNameChange = (e) => {
    updateNodeField(id, 'outputName', e.target.value);
  };

  const handleTypeChange = (e) => {
    updateNodeField(id, 'outputType', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Output"
      icon="📤"
      inputs={[{ id: `${id}-value-any`, label: 'Value' }]}
      onDelete={handleDelete}
      className="node-customOutput"
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
            value={outputType}
            onChange={handleTypeChange}
            className="node-select"
          >
            <option value="Text">Text</option>
            <option value="File">Image</option>
          </select>
        </label>
      </div>
    </BaseNode>
  );
};
