import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#F2F2F2', backgroundColor: '#080808', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontFamily: 'VT323, monospace', fontSize: '2rem', color: '#FF6A00' }}>NNS</h1>
          <h2 style={{ fontFamily: 'VT323, monospace', fontSize: '1.5rem', marginBottom: '1rem' }}>APPLICATION ERROR</h2>
          <p style={{ color: '#999', marginBottom: '2rem' }}>Something went wrong while loading NNS.</p>
          <div style={{ background: '#111', padding: '1rem', border: '1px solid #333', textAlign: 'left', overflow: 'auto', maxWidth: '80vw', marginBottom: '2rem', fontSize: '12px', fontFamily: 'monospace' }}>
            <p style={{ color: '#ff4444' }}>{this.state.error && this.state.error.toString()}</p>
            <pre style={{ color: '#888', whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.stack}</pre>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{ padding: '8px 16px', background: '#FF6A00', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              [ RELOAD APP ]
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
