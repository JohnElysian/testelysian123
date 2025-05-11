import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TikTokConnection from '../../utils/TikTokConnection';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusDot = styled.span`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: var(--text-secondary);
  
  ${({ status }) => status === 'connected' && `
    background: #10b981;
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
  `}
  
  ${({ status }) => status === 'connecting' && `
    background: #f59e0b;
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    animation: pulse 1.5s infinite;
  `}
  
  ${({ status }) => status === 'disconnected' && `
    background: #ef4444;
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
  `}
  
  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;

const StatusText = styled.span`
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ConnectionStatus = ({ isConnecting }) => {
  const [status, setStatus] = useState('disconnected');
  const [dataFlowing, setDataFlowing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  useEffect(() => {
    // Update status based on connection state
    const updateStatus = (state) => {
      // After the first state change, we're no longer in initial load
      if (initialLoad) {
        setInitialLoad(false);
      }
      
      if (state.connected) {
        setStatus('connected');
      } else if (state.connecting) {
        setStatus('connecting');
      } else {
        setStatus('disconnected');
      }
    };
    
    // Track actual data flow from TikTok
    const handleDataFlow = () => {
      setDataFlowing(true);
    };
    
    // Get initial status
    const initialState = TikTokConnection.getConnectionState();
    
    // Only set to connected if actually connected on initial load
    // Don't show connecting state on initial page load
    if (initialState.connected) {
      setStatus('connected');
    }
    
    // Listen for state changes
    TikTokConnection.on('connectionStateChanged', updateStatus);
    
    // Listen for data events that indicate active connection regardless of socket state
    ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
      TikTokConnection.on(event, handleDataFlow);
    });
    
    // Set initial load to false after a brief delay
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      TikTokConnection.off('connectionStateChanged', updateStatus);
      ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
        TikTokConnection.off(event, handleDataFlow);
      });
    };
  }, [initialLoad]);
  
  // Override displayed status based on props and data flow
  let displayStatus = status;
  
  // If isConnecting prop is true, always show connecting status
  if (isConnecting) {
    displayStatus = 'connecting';
  } 
  // If socket is connecting but not on initial page load, show connecting status
  else if (status === 'connecting' && !initialLoad) {
    displayStatus = 'connecting';
  }
  // Otherwise if data is flowing but we're supposedly disconnected, show connected
  else if (dataFlowing && status === 'disconnected') {
    displayStatus = 'connected';
  }
  
  const statusTexts = {
    connected: 'Connected',
    connecting: 'Connecting...',
    disconnected: 'Disconnected'
  };
  
  return (
    <StatusContainer id="connectionStatus" className={`status ${displayStatus}`}>
      <StatusDot status={displayStatus} className="status-dot" />
      <StatusText className="status-text">{statusTexts[displayStatus]}</StatusText>
    </StatusContainer>
  );
};

export default ConnectionStatus; 