import React, { useState, useEffect } from 'react';
import { MessageSquare, Activity, Gauge, Briefcase } from 'lucide-react';
import GlobalStyles from './styles/GlobalStyles';
import Page from './components/Layout/Page';
import Dashboard from './components/Dashboard/Dashboard';
import ConnectCard from './components/Connect/ConnectCard';
import LiveInfoTab from './components/LiveInfo/LiveInfoTab';
import WheelTab from './components/Wheel/WheelTab';
import ConnectionStateTab from './components/Connect/ConnectionStateTab';
import DealOrNoDealTab from './components/DealOrNoDeal/DealOrNoDealTab';
import Tabs from './components/ui/Tabs';
import TikTokConnection from './utils/TikTokConnection';

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [dataFlowing, setDataFlowing] = useState(false);
  
  useEffect(() => {
    // Listen for connection state changes
    const handleConnectionState = (state) => {
      setIsConnected(state.connected);
    };
    
    // Track actual data flow from TikTok
    const handleDataFlow = () => {
      setDataFlowing(true);
    };
    
    TikTokConnection.on('connectionStateChanged', handleConnectionState);
    
    // Listen for data events that indicate active connection
    ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
      TikTokConnection.on(event, handleDataFlow);
    });
    
    return () => {
      TikTokConnection.off('connectionStateChanged', handleConnectionState);
      ['chat', 'gift', 'like', 'roomUser'].forEach(event => {
        TikTokConnection.off(event, handleDataFlow);
      });
    };
  }, []);
  
  // Consider connected if either socket is connected or we're receiving data
  const effectivelyConnected = isConnected || dataFlowing;
  
  const tabs = [
    {
      id: 'live-info',
      label: 'Live Info',
      icon: <MessageSquare size={20} />,
      content: <LiveInfoTab />
    },
    {
      id: 'wheel',
      label: 'Prize Wheel',
      icon: <Gauge size={20} />,
      content: <WheelTab />,
      hidden: !effectivelyConnected
    },
    {
      id: 'deal-or-no-deal',
      label: 'Deal or No Deal',
      icon: <Briefcase size={20} />,
      content: <DealOrNoDealTab />
    },
    {
      id: 'connection',
      label: 'Connection State',
      icon: <Activity size={20} />,
      content: <ConnectionStateTab />
    }
  ].filter(tab => !tab.hidden);

  return (
    <>
      <GlobalStyles />
      <Page>
        <Dashboard />
        <ConnectCard />
        <Tabs tabs={tabs} defaultTab="live-info" />
      </Page>
    </>
  );
};

export default App; 