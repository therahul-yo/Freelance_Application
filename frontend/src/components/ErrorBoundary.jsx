import { Component } from 'react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: 'var(--space-4xl) 0', textAlign: 'center' }}>
          <div className="card-static" style={{ maxWidth: 500, margin: '0 auto', background: 'var(--nb-pink)', color: 'var(--nb-black)' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Oops! Something broke.</h1>
            <p style={{ marginBottom: 24, fontSize: 16, fontWeight: 500 }}>
              {this.state.error?.message || "An unexpected error occurred in our application mechanics."}
            </p>
            <Button 
              variant="dark"
              onClick={() => window.location.reload()}
            >
              🔄 Reload the Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
