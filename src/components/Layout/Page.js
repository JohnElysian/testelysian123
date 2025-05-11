import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';

const PageContainer = styled(motion.div)`
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 2.5rem 4rem;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
`;

const Page = ({ children }) => {
  return (
    <PageContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
    </PageContainer>
  );
};

export default Page; 