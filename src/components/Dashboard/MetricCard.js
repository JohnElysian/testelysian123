import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CardContainer = styled(motion.div)`
  background: var(--card-bg);
  backdrop-filter: blur(15px);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), transparent);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow), 0 10px 25px rgba(139, 92, 246, 0.2);
  }
`;

const IconContainer = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(139, 92, 246, 0.15);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color || 'var(--accent)'};
  position: relative;
  
  /* Subtle glow effect */
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: ${props => props.color || 'var(--accent)'};
    opacity: 0.1;
    filter: blur(4px);
    border-radius: inherit;
    z-index: -1;
  }
`;

const MetricInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const MetricValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: 'spring', 
      stiffness: 300, 
      damping: 20
    }
  }
};

const MetricCard = ({ icon, value, label, color, delay = 0 }) => {
  return (
    <CardContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ 
        delay,
        type: 'spring', 
        stiffness: 300, 
        damping: 20
      }}
    >
      <IconContainer color={color}>
        {icon}
      </IconContainer>
      <MetricInfo>
        <MetricValue>{value}</MetricValue>
        <MetricLabel>{label}</MetricLabel>
      </MetricInfo>
    </CardContainer>
  );
};

export default MetricCard; 