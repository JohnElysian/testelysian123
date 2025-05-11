import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 500;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  position: relative;
  overflow: hidden;
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-sm);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.15);
    z-index: 1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow), 0 0 15px rgba(139, 92, 246, 0.4);
    
    &::before {
      opacity: 1;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  ${({ variant }) => variant === 'primary' && css`
    background: linear-gradient(135deg, var(--accent), var(--accent-dark));
    font-weight: 600;
    padding: 1rem 2rem;
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.25);
  `}
  
  ${({ variant }) => variant === 'secondary' && css`
    background: rgba(255, 255, 255, 0.05);
    color: var(--text);
    border: 1px solid var(--border);
    box-shadow: none;
    
    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: var(--accent-light);
      transform: translateY(-2px);
    }
  `}
  
  ${({ variant }) => variant === 'spin' && css`
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    font-size: 1.1rem;
    font-weight: 600;
    padding: 0.8rem 2rem;
    box-shadow: 0 8px 25px rgba(231, 76, 60, 0.25);
    
    &::before {
      background: rgba(0, 0, 0, 0.1);
    }
    
    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(231, 76, 60, 0.4);
    }
  `}
  
  ${({ variant }) => variant === 'collecting' && css`
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    box-shadow: 0 8px 25px rgba(46, 204, 113, 0.25);
    
    &:hover:not(:disabled) {
      box-shadow: 0 10px 30px rgba(46, 204, 113, 0.4);
    }
  `}
  
  ${({ variant }) => variant === 'reset' && css`
    background: linear-gradient(135deg, #f39c12, #e67e22);
    box-shadow: 0 8px 25px rgba(243, 156, 18, 0.25);
    
    &:hover:not(:disabled) {
      box-shadow: 0 10px 30px rgba(243, 156, 18, 0.4);
    }
  `}
  
  ${({ variant }) => variant === 'link' && css`
    background: none;
    color: var(--accent);
    padding: 0.5rem;
    box-shadow: none;
    
    &:hover:not(:disabled) {
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent-light);
      transform: none;
      box-shadow: none;
    }
    
    &::before {
      display: none;
    }
  `}
  
  .icon {
    position: relative;
    z-index: 2;
  }
  
  span {
    position: relative;
    z-index: 2;
  }
`;

const Button = ({ 
  children, 
  icon, 
  variant = 'default', 
  disabled = false, 
  onClick, 
  type = 'button',
  ...props 
}) => {
  return (
    <StyledButton
      type={type}
      variant={variant}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {icon && <span className="icon">{icon}</span>}
      {children && <span>{children}</span>}
    </StyledButton>
  );
};

export default Button; 