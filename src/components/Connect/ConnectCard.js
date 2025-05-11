import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RefreshCw, Download, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import ConnectionStatus from './ConnectionStatus';
import TikTokConnection from '../../utils/TikTokConnection';
import { useTheme } from '../../context/ThemeContext';

const CardContainer = styled(motion.div)`
  position: relative;
  margin-bottom: 2.5rem;
  width: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    z-index: -1;
    background: linear-gradient(135deg, rgba(30, 64, 175, 0.3), rgba(30, 58, 138, 0.1));
    border-radius: var(--radius);
    filter: blur(10px);
    opacity: 0.5;
    pointer-events: none;
  }
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
  position: relative;
  margin-bottom: 1.25rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: rgba(255,255,255,0.05);
  color: var(--text);
  transition: var(--transition);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }
  
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
  
  [data-theme="light"] & {
    background: rgba(255,255,255,0.8);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: rgba(0, 0, 0, 0.05);
  }
`;

const ActionRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ConnectCard = () => {
  const [uniqueId, setUniqueId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { theme } = useTheme();
  const chatContainerRef = useRef(null);
  const giftContainerRef = useRef(null);
  
  const handleConnect = async () => {
    if (!uniqueId.trim()) {
      alert('Please enter a TikTok username');
      return;
    }
    
    setIsConnecting(true);
    
    try {
      await TikTokConnection.connect(uniqueId, {
        enableExtendedGiftInfo: true
      });
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleReconnect = () => {
    handleConnect();
  };
  
  const handleClearChat = () => {
    if (chatContainerRef.current) chatContainerRef.current.innerHTML = '';
    if (giftContainerRef.current) giftContainerRef.current.innerHTML = '';
    
    // Reset chat counters
    document.getElementById('chat-count').textContent = '0';
    document.getElementById('gift-count').textContent = '0';
  };
  
  const handleExportLogs = () => {
    const viewers = document.getElementById('viewer-count')?.textContent || '0';
    const likes = document.getElementById('like-count')?.textContent || '0';
    const diamonds = document.getElementById('diamond-count')?.textContent || '0';
    
    const chatContent = chatContainerRef.current?.textContent.trim() || '';
    const giftContent = giftContainerRef.current?.textContent.trim() || '';
    
    const log = `Viewers: ${viewers}
Likes: ${likes}
Diamonds: ${diamonds}

Chats:
${chatContent}

Gifts:
${giftContent}`;

    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tiktok_live_log.txt';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleKeyUp = (e) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <Card
        title="Connect to TikTok Live"
        action={<ConnectionStatus isConnecting={isConnecting} />}
      >
        <InputGroup>
          <Input 
            type="text"
            placeholder="Enter TikTok username (without @)"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            onKeyUp={handleKeyUp}
            disabled={isConnecting}
          />
          <Button 
            variant="primary"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </Button>
        </InputGroup>
        
        <ActionRow>
          <ButtonGroup>
            <Button 
              variant="link" 
              icon={<RefreshCw size={18} />}
              onClick={handleReconnect}
              disabled={isConnecting}
            >
              Reconnect
            </Button>
            <Button 
              variant="link" 
              icon={<Download size={18} />}
              onClick={handleExportLogs}
            >
              Export
            </Button>
          </ButtonGroup>
          
          <ButtonGroup>
            <Button 
              variant="link" 
              icon={<Trash2 size={18} />}
              onClick={handleClearChat}
              title="Clear chat & gifts"
            >
              Clear
            </Button>
          </ButtonGroup>
        </ActionRow>
      </Card>
    </CardContainer>
  );
};

export default ConnectCard; 