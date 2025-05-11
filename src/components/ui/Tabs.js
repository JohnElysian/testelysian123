import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

const TabsContainer = styled(motion.div)`
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2px;
  width: 100%;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05));
  transform: translateZ(0);
  will-change: transform;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border-radius: calc(var(--radius) - 2px);
    background: rgba(17, 24, 39, 0.95);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 30%;
    height: 30%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
`;

const TabNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  position: relative;
  z-index: 5;
  padding: 1rem 1rem 0.5rem;
  border-radius: var(--radius) var(--radius) 0 0;
  background-color: rgba(17, 24, 39, 0.5);
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  border: none;
  background: rgba(31, 41, 55, 0.5);
  color: var(--text-secondary);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.1);
  
  &:hover {
    background: rgba(31, 41, 55, 0.8);
    color: var(--text);
    box-shadow: inset 0 0 0 1px rgba(139, 92, 246, 0.2);
  }
  
  &.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const TabContent = styled(motion.div)`
  padding: 0 1rem 1rem;
  position: relative;
  z-index: 2;
  border-top: 1px solid var(--border);
  min-height: 70vh;
`;

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const Tabs = ({ tabs, defaultTab, onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || (tabs[0] && tabs[0].id));
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  return (
    <TabsContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TabNav>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => handleTabChange(tab.id)}
            whileTap={{ scale: 0.97 }}
          >
            {tab.icon && tab.icon}
            <span>{tab.label}</span>
          </TabButton>
        ))}
      </TabNav>
      
      <AnimatePresence mode="wait">
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <TabContent
              key={tab.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ duration: 0.3 }}
            >
              {tab.content}
            </TabContent>
          )
        ))}
      </AnimatePresence>
    </TabsContainer>
  );
};

export default Tabs; 