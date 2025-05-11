import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Card from '../ui/Card';
import TikTokConnection from '../../utils/TikTokConnection';

const StateText = styled.pre`
  color: var(--text-secondary);
  white-space: pre-wrap;
  font-family: monospace;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  max-height: 400px;
  overflow-y: auto;
`;

const ConnectionStateTab = () => {
  const [stateInfo, setStateInfo] = useState('Disconnected');
  const [dataFlowing, setDataFlowing] = useState(false);
  const [lastDataTime, setLastDataTime] = useState(null);
  
  useEffect(() => {
    // Listen for state changes
    const handleStateChange = (state) => {
      let stateText = 'Disconnected';
      
      if (state.connected) {
        stateText = `Connected to roomId: ${TikTokConnection.uniqueId || 'unknown'}`;
      } else if (state.connecting && TikTokConnection.uniqueId) {
        stateText = 'Connecting...';
      }
      
      setStateInfo(stateText);
    };
    
    // Listen for connection established
    const handleConnected = (data) => {
      setStateInfo(`Connected to roomId ${data.roomId || 'unknown'}`);
    };
    
    // Listen for stream end
    const handleStreamEnd = () => {
      setStateInfo('Stream ended.');
    };
    
    // Listen for disconnection
    const handleDisconnected = (msg) => {
      if (dataFlowing) {
        // If data is still flowing, indicate socket reconnecting but data still coming
        setStateInfo(`Socket disconnected but data still flowing. Last data received: ${new Date(lastDataTime).toLocaleTimeString()}\nOriginal message: ${msg || 'Unknown error'}`);
      } else {
        setStateInfo(`Disconnected: ${msg || 'Unknown error'}`);
      }
    };
    
    // Track actual data flow from TikTok
    const handleDataFlow = () => {
      const now = Date.now();
      setLastDataTime(now);
      setDataFlowing(true);
      
      // If we're supposedly disconnected but getting data, update the status
      if (!TikTokConnection.getConnectionState().connected) {
        setStateInfo(`Socket appears disconnected, but data is flowing. Last data received: ${new Date(now).toLocaleTimeString()}`);
      }
    };
    
    TikTokConnection.on('connectionStateChanged', handleStateChange);
    TikTokConnection.on('tiktokConnected', handleConnected);
    TikTokConnection.on('streamEnd', handleStreamEnd);
    TikTokConnection.on('tiktokDisconnected', handleDisconnected);
    
    // Listen for data events that indicate active connection
    ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
      TikTokConnection.on(event, handleDataFlow);
    });
    
    // Get initial state
    const initialState = TikTokConnection.getConnectionState();
    if (initialState.connecting && TikTokConnection.uniqueId) {
      setStateInfo('Connecting...');
    } else if (initialState.connected) {
      setStateInfo(`Connected to roomId: ${TikTokConnection.uniqueId || 'unknown'}`);
    }
    
    return () => {
      TikTokConnection.off('connectionStateChanged', handleStateChange);
      TikTokConnection.off('tiktokConnected', handleConnected);
      TikTokConnection.off('streamEnd', handleStreamEnd);
      TikTokConnection.off('tiktokDisconnected', handleDisconnected);
      ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
        TikTokConnection.off(event, handleDataFlow);
      });
    };
  }, [dataFlowing, lastDataTime]);
  
  return (
    <Card title="Connection State">
      <StateText id="stateText">{stateInfo}</StateText>
    </Card>
  );
};

export default ConnectionStateTab; 