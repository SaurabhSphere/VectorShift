// apiCallNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const APICallNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const method = data?.method || 'GET';
  const url = data?.url || '';

  // Sync default state to store on mount
  useEffect(() => {
    if (data?.method === undefined) {
      updateNodeField(id, 'method', method);
    }
    if (data?.url === undefined) {
      updateNodeField(id, 'url', url);
    }
  }, [id, data, method, url, updateNodeField]);

  const handleMethodChange = (e) => {
    updateNodeField(id, 'method', e.target.value);
  };

  const handleUrlChange = (e) => {
    updateNodeField(id, 'url', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="API Call"
      icon="🌐"
      inputs={[
        { id: `${id}-url-text`, label: 'URL' },
        { id: `${id}-headers-text`, label: 'Headers' },
        { id: `${id}-body-text`, label: 'Body' },
      ]}
      outputs={[{ id: `${id}-response-any`, label: 'Response' }]}
      onDelete={handleDelete}
      className="node-apiCall"
    >
      <div className="node-field-group">
        <label className="node-label">
          Method
          <select
            value={method}
            onChange={handleMethodChange}
            className="node-select"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </label>
        <label className="node-label">
          Endpoint
          <input
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://api.example.com"
            className="node-input"
          />
        </label>
      </div>
    </BaseNode>
  );
};
