import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  return (
    <div className="app-container">
      <PipelineToolbar />
      <div className="canvas-wrapper">
        <PipelineUI />
      </div>
      <SubmitButton />
    </div>
  );
}

export default App;
