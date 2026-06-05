// llmNode.js
import { useStore } from '../store';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  const onNodesChange = useStore((state) => state.onNodesChange);

  const handleDelete = () => {
    onNodesChange([{ id, type: 'remove' }]);
  };

  return (
    <BaseNode
      id={id}
      title="LLM"
      icon="🤖"
      inputs={[
        { id: `${id}-system-text`, label: 'System' },
        { id: `${id}-prompt-text`, label: 'Prompt' },
      ]}
      outputs={[
        { id: `${id}-response-text`, label: 'Response' }
      ]}
      onDelete={handleDelete}
      className="node-llm"
    >
      <div style={{ padding: '6px 0', fontSize: '12px', lineHeight: '1.4' }}>
        This node executes a system prompt and prompts a Large Language Model.
      </div>
    </BaseNode>
  );
};
