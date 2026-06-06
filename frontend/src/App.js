import { useEffect } from 'react';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

function App() {
  useEffect(() => {
    // Send a wake-up request to the backend base URL on mount (e.g. to wake Render's free tier)
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://vectorshift-7itg.onrender.com';
    fetch(BACKEND_URL).catch((err) => {
      console.log('Background wake-up request failed:', err);
    });
  }, []);

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
