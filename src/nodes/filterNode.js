// filterNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const FilterNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const filterOperator = data?.filterOperator || 'Equals';
  const filterValue = data?.filterValue || '';

  // Sync default state to store on mount
  useEffect(() => {
    if (data?.filterOperator === undefined) {
      updateNodeField(id, 'filterOperator', filterOperator);
    }
    if (data?.filterValue === undefined) {
      updateNodeField(id, 'filterValue', filterValue);
    }
  }, [id, data, filterOperator, filterValue, updateNodeField]);

  const handleOperatorChange = (e) => {
    updateNodeField(id, 'filterOperator', e.target.value);
  };

  const handleValueChange = (e) => {
    updateNodeField(id, 'filterValue', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Filter"
      icon="🔍"
      inputs={[
        { id: `${id}-data-any`, label: 'Data' },
        { id: `${id}-condition-text`, label: 'Cond' },
      ]}
      outputs={[{ id: `${id}-filtered-any`, label: 'Filtered' }]}
      onDelete={handleDelete}
      className="node-filter"
    >
      <div className="node-field-group">
        <label className="node-label">
          Condition
          <select
            value={filterOperator}
            onChange={handleOperatorChange}
            className="node-select"
          >
            <option value="Equals">Equals</option>
            <option value="GreaterThan">Greater Than</option>
            <option value="LessThan">Less Than</option>
            <option value="Contains">Contains</option>
          </select>
        </label>
        <label className="node-label">
          Value
          <input
            type="text"
            value={filterValue}
            onChange={handleValueChange}
            placeholder="e.g. 10"
            className="node-input"
          />
        </label>
      </div>
    </BaseNode>
  );
};
