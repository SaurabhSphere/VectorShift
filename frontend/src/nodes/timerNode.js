// timerNode.js
import { useEffect } from 'react';
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const TimerNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const onNodesChange = useStore((state) => state.onNodesChange);

  const delay = data?.delay || 5;
  const repeat = data?.repeat || 'Once';

  // Sync default state to store on mount
  useEffect(() => {
    if (data?.delay === undefined) {
      updateNodeField(id, 'delay', delay);
    }
    if (data?.repeat === undefined) {
      updateNodeField(id, 'repeat', repeat);
    }
  }, [id, data, delay, repeat, updateNodeField]);

  const handleDelayChange = (e) => {
    updateNodeField(id, 'delay', Number(e.target.value));
  };

  const handleRepeatChange = (e) => {
    updateNodeField(id, 'repeat', e.target.value);
  };

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="Timer"
      icon="⏳"
      inputs={[{ id: `${id}-trigger-any`, label: 'Trigger' }]}
      outputs={[{ id: `${id}-output-any`, label: 'Output' }]}
      onDelete={handleDelete}
      className="node-timer"
    >
      <div className="node-field-group">
        <label className="node-label">
          Delay (sec)
          <input
            type="number"
            value={delay}
            onChange={handleDelayChange}
            min="1"
            className="node-input"
          />
        </label>
        <label className="node-label">
          Mode
          <select
            value={repeat}
            onChange={handleRepeatChange}
            className="node-select"
          >
            <option value="Once">Run Once</option>
            <option value="Repeat">Repeat</option>
          </select>
        </label>
      </div>
    </BaseNode>
  );
};
