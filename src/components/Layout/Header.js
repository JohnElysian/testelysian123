import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const HeaderContainer = styled(motion.header)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 1px;
    background: linear-gradient(to right, 
      transparent, 
      rgba(139, 92, 246, 0.3), 
      rgba(139, 92, 246, 0.3),
      transparent);
    opacity: 0.5;
  }
`;

const Logo = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: -20px;
    bottom: 0;
    width: 20px;
    background: linear-gradient(to right, var(--accent-light), transparent);
    filter: blur(8px);
    opacity: 0.5;
  }
`;

const Subtitle = styled.div`
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ThemeToggle = styled(motion.button)`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: var(--accent);
    background: rgba(139, 92, 246, 0.1);
  }
  
  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <HeaderContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <Logo>Team Elysian</Logo>
        <Subtitle>Team Elysian Live Tools</Subtitle>
      </div>
      
      <HeaderActions>
        <ThemeToggle 
          onClick={toggleTheme}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? <Sun /> : <Moon />}
        </ThemeToggle>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header; 