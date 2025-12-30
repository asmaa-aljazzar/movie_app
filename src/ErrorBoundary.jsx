import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Removed unused 'error' parameter
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="mb-4">The app encountered an error. Please refresh.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}