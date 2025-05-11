import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const FooterContainer = styled(motion.footer)`
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: auto;
  padding-top: 2rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 30%;
    right: 30%;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--border), transparent);
  }
`;

const FooterText = styled.p`
  position: relative;
  display: inline-block;
  padding: 0 0.5rem;
  
  &::before {
    content: '•';
    position: absolute;
    left: -0.5rem;
    color: var(--accent-light);
    opacity: 0.7;
  }
  
  &::after {
    content: '•';
    position: absolute;
    right: -0.5rem;
    color: var(--accent-light);
    opacity: 0.7;
  }
`;

const Footer = () => {
  return (
    <FooterContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <FooterText>Live tools • Made by Team Elysian</FooterText>
    </FooterContainer>
  );
};

export default Footer; 