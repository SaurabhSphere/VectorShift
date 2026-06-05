// submit.js
import React, { useEffect } from 'react';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { useToast } from './utils/ToastContext';
import { PlayIcon } from './utils/Icons';

const selector = (state) => ({
  submitLoading: state.submitLoading,
  submitResult: state.submitResult,
  showSubmitModal: state.showSubmitModal,
  setShowSubmitModal: state.setShowSubmitModal,
  submitPipeline: state.submitPipeline,
});

export const SubmitButton = () => {
  const {
    submitLoading,
    submitResult,
    showSubmitModal,
    setShowSubmitModal,
    submitPipeline,
  } = useStore(selector, shallow);

  const toast = useToast();

  useEffect(() => {
    if (submitResult) {
      if (submitResult.error) {
        toast.warning(submitResult.error);
      } else if (submitResult.is_dag) {
        toast.success(`Pipeline validated! Total Nodes: ${submitResult.num_nodes}, Edges: ${submitResult.num_edges}. Valid DAG.`);
      } else {
        toast.error(`Validation failed: Pipeline contains cycles. Total Nodes: ${submitResult.num_nodes}, Edges: ${submitResult.num_edges}.`);
      }
    }
  }, [submitResult, toast]);

  return (
    <>
      <div className="submit-container">
        <button
          type="button"
          className="submit-btn"
          onClick={submitPipeline}
          disabled={submitLoading}
        >
          {submitLoading ? (
            <>
              <div className="spinner"></div>
              Analyzing Pipeline...
            </>
          ) : (
            <>
              <PlayIcon size={14} />
              Submit Pipeline
            </>
          )}
        </button>
      </div>

      {showSubmitModal && submitResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 7, 12, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '28px',
              width: '90%',
              maxWidth: '400px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              textAlign: 'center',
              fontFamily: 'Inter, system-ui, sans-serif',
              color: '#f8fafc',
            }}
          >
            {submitResult.error ? (
              <div>
                <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#f1f5f9' }}>
                  Validation Error
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', margin: '0 0 24px 0', whiteSpace: 'pre-wrap' }}>
                  {submitResult.error}
                </p>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>
                  {submitResult.is_dag ? '✅' : '❌'}
                </div>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700', color: '#f8fafc' }}>
                  {submitResult.is_dag ? 'Valid DAG Structure' : 'Pipeline Cycles Detected'}
                </h3>
                
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginBottom: '24px',
                    textAlign: 'left',
                    fontSize: '14px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Total Nodes</span>
                    <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{submitResult.num_nodes}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8' }}>Total Edges</span>
                    <strong style={{ color: '#f8fafc', fontSize: '15px' }}>{submitResult.num_edges}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ color: '#94a3b8' }}>Acyclic Status</span>
                    <strong style={{ color: submitResult.is_dag ? '#10b981' : '#ef4444', fontSize: '14px', fontWeight: '700' }}>
                      {submitResult.is_dag ? 'Directed Acyclic' : 'Contains Cycles'}
                    </strong>
                  </div>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              style={{
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                fontSize: '14px',
                transition: 'background-color 0.2s, transform 0.1s',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};
