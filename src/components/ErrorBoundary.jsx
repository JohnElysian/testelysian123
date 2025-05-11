import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: #f87171;
  
  h3 {
    color: #ef4444;
    margin-top: 0;
    font-size: 1.2rem;
  }
  
  pre {
    background: rgba(0, 0, 0, 0.1);
    padding: 1rem;
    border-radius: var(--radius-sm);
    overflow: auto;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.9);
    max-height: 200px;
  }
  
  button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 500;
    margin-top: 1rem;
    
    &:hover {
      background: #dc2626;
    }
  }
`;

/**
 * Error boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole application.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
    
    // If you have an error logging service, you can send the error there
    // Example: logErrorToService(error, errorInfo);
  }
  
  resetError = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback({ error: this.state.error, resetError: this.resetError })
          : fallback;
      }
      
      // Default error UI
      return (
        <ErrorContainer>
          <h3>Something went wrong</h3>
          <p>The application encountered an error. You can try reloading the page or resetting the component.</p>
          {this.state.error && (
            <pre>{this.state.error.toString()}</pre>
          )}
          <button onClick={this.resetError}>
            Reset
          </button>
        </ErrorContainer>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary; 