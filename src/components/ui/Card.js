import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledCard = styled(motion.div)`
  background: var(--card-bg);
  backdrop-filter: blur(15px);
  border-radius: var(--radius);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 0 0 1px rgba(139, 92, 246, 0.1);
  overflow: hidden;
  position: relative;
  transform: translateZ(0);
  will-change: transform;
  transition: var(--transition);
  
  background: linear-gradient(
    to bottom right,
    rgba(23, 31, 50, 0.8),
    rgba(15, 23, 42, 0.8)
  );
  
  /* Beautiful glass border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: calc(var(--radius) - 0.5px);
    padding: 1px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.05));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    animation: cornerPulse 4s ease-in-out infinite;
  }
  
  /* Corner highlight */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40%;
    height: 40%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1), transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
  
  &:hover {
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(139, 92, 246, 0.15);
    transform: translateY(-5px) translateZ(0);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: rgba(31, 41, 55, 0.4);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent);
    z-index: 3;
  }
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    color: var(--accent);
  }
`;

const CardBody = styled.div`
  padding: 1.5rem;
`;

const Card = ({ 
  children, 
  title, 
  icon,
  action,
  ...props 
}) => {
  return (
    <StyledCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {title && (
        <CardHeader>
          <CardTitle>
            {icon && icon}
            {title}
          </CardTitle>
          {action && action}
        </CardHeader>
      )}
      <CardBody>
        {children}
      </CardBody>
    </StyledCard>
  );
};

export default Card; 