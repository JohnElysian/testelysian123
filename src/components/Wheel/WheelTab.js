import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Gauge } from 'lucide-react';
import WheelControls from './WheelControls';
import ErrorBoundary from '../ErrorBoundary';
import WheelErrorFallback from './WheelErrorFallback';

const WheelContainer = styled.div`
  padding: 2rem;
  border-radius: calc(var(--radius) - 2px);
  background: var(--card-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--border);
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.05);
  position: relative;
  overflow: hidden;
  min-height: 750px;
  margin: 0;
  width: 100%;
  background-image: 
    radial-gradient(circle at 0% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    repeating-linear-gradient(45deg, rgba(139, 92, 246, 0.01) 0px, rgba(139, 92, 246, 0.01) 1px, transparent 1px, transparent 11px),
    repeating-linear-gradient(135deg, rgba(139, 92, 246, 0.01) 0px, rgba(139, 92, 246, 0.01) 1px, transparent 1px, transparent 11px);
    
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(139, 92, 246, 0.5), 
      rgba(168, 85, 247, 0.5), 
      rgba(139, 92, 246, 0.5), 
      transparent);
    opacity: 0.6;
  }
`;

const WheelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border);
`;

const WheelTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  
  svg {
    background: rgba(139, 92, 246, 0.1);
    color: var(--accent);
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }
`;

const WheelTab = () => {
  return (
    <WheelContainer>
      <WheelHeader>
        <WheelTitle>
          <Gauge size={24} />
          Team Elysian Prize Wheel
        </WheelTitle>
      </WheelHeader>
      
      <ErrorBoundary fallback={WheelErrorFallback}>
        <WheelControls />
      </ErrorBoundary>
    </WheelContainer>
  );
};

export default WheelTab; 