import React from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 1rem auto;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius);
  color: #f87171;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  
  h3 {
    color: #ef4444;
    margin-top: 0;
    font-size: 1.5rem;
  }
  
  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
    font-size: 1rem;
    line-height: 1.6;
  }
  
  .error-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }
  
  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ef4444;
  }
  
  .error-details {
    margin-top: 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    padding: 1rem;
    border-radius: var(--radius-sm);
    text-align: left;
    overflow: auto;
    max-height: 150px;
    font-family: monospace;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .error-message {
    background: rgba(239, 68, 68, 0.1);
    padding: 0.75rem;
    border-radius: var(--radius-sm);
    margin-bottom: 1rem;
    color: #fca5a5;
    font-weight: 500;
  }
`;

const WheelErrorFallback = ({ error, resetError }) => {
  const handleResetWheel = () => {
    // Call parent reset function to clear the error state
    resetError();
    
    // Attempt to reset wheel state if possible
    try {
      // Check if we can access the wheel reducer dispatch
      const wheelElement = document.querySelector('[data-wheel-container]');
      if (wheelElement && wheelElement.__WHEEL_DISPATCH) {
        wheelElement.__WHEEL_DISPATCH({ type: 'RESET_WHEEL' });
      }
    } catch (e) {
      console.error('Failed to reset wheel state:', e);
    }
  };
  
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <ErrorContainer>
      <div className="error-icon">⚠️</div>
      <h3>Wheel Error</h3>
      <div className="error-message">
        {error?.message || 'An unexpected error occurred in the wheel component'}
      </div>
      <p>
        The prize wheel encountered a problem. You can try resetting the wheel
        or refresh the page to resolve the issue.
      </p>
      <div className="error-actions">
        <Button onClick={handleResetWheel} variant="collecting">
          Reset Wheel
        </Button>
        <Button onClick={handleReload} variant="reset">
          Reload Page
        </Button>
      </div>
      {error && (
        <div className="error-details">
          {error.stack || error.toString()}
        </div>
      )}
    </ErrorContainer>
  );
};

export default WheelErrorFallback; 