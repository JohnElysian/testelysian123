import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { motion } from "framer-motion";
import { ACTIONS } from "./gameReducer";
import DiamondIcon from "./DiamondIcon";

const pulseAnim = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
`;

const goldGlow = keyframes`
  0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.6); }
  100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); }
`;

const flashingText = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const rotateValues = keyframes`
  0% { transform: translateY(0); }
  15% { transform: translateY(-100%); }
  35% { transform: translateY(0); }
  50% { transform: translateY(0); }
  65% { transform: translateY(-100%); }
  85% { transform: translateY(0); }
  100% { transform: translateY(0); }
`;

const shakeBox = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(2deg); }
  100% { transform: rotate(0deg); }
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  pointer-events: auto; // Ensure it blocks all clicks
`;

const Panel = styled(motion.div)`
  background: rgba(17, 24, 39, 0.95);
  padding: 2rem;
  border-radius: var(--radius);
  min-width: 340px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`;

const BoxesContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const BoxChoice = styled.div`
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${props => props.isPlayer ? goldGlow : pulseAnim} 2s infinite;
  background: ${props => props.isPlayer 
    ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(218, 165, 32, 0.9))' 
    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(79, 70, 229, 0.7))'};
  color: ${props => props.isPlayer ? 'black' : 'white'};
  position: relative;
  
  ${props => props.showing && css`
    animation: ${props.isPlayer ? goldGlow : pulseAnim} 2s infinite, ${shakeBox} 0.5s infinite;
  `}
  
  &:hover {
    transform: scale(1.05);
  }
  
  small {
    display: block;
    font-size: 0.8rem;
    opacity: 0.7;
    margin-top: 0.3rem;
  }
`;

const PrizeContainer = styled.div`
  position: absolute;
  top: -60px;
  left: 0;
  right: 0;
  height: 100px; // Tall enough for two prize amounts
  overflow: hidden;
`;

const PrizeValues = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 200%; // Double height for two values
  animation: ${rotateValues} 4s infinite ease-in-out;
`;

const PrizeAmount = styled.div`
  height: 50%; // Each value takes half the container
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--accent);
  gap: 4px;
`;

const StatsPanel = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  margin-top: 0.5rem;
  animation: ${flashingText} 2s infinite ease-in-out;
  
  p {
    margin: 0;
    font-size: 0.9rem;
    color: #f59e0b;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  background: ${(props) => (props.primary ? "var(--accent)" : "transparent")};
  border: ${(props) =>
    props.primary ? "none" : "1px solid rgba(255, 255, 255, 0.2)"};
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${(props) =>
      props.primary
        ? "var(--accent)"
        : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ThinkingText = styled.div`
  font-size: 1.1rem;
  color: #f59e0b;
  font-style: italic;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const SwapOrKeepModal = ({ state, dispatch }) => {
  const remainingBoxes = state.boxes.filter(b => !b.opened);
  const playerBox = state.boxes.find(b => b.id === state.playerBoxId);
  const otherBox = remainingBoxes.find(b => b.id !== state.playerBoxId);
  const [thinking, setThinking] = useState(false);
  
  // Get the actual values of the two remaining boxes for the animation
  const playerBoxValue = Math.round(playerBox.value);
  const otherBoxValue = Math.round(otherBox.value);
  
  // Animation state for showing the prize range
  const [showPrizes, setShowPrizes] = useState(false);
  
  // Show the prize animation after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPrizes(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleDecision = (keep) => {
    setThinking(true);
    
    // Add delay for suspense
    setTimeout(() => {
      dispatch({ type: ACTIONS.SWAP_OR_KEEP, keep });
    }, 3000);
  };
  
  return (
    <Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Panel initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <h2 style={{ margin: 0 }}>Final Decision</h2>
        
        <p style={{ fontSize: "1.1rem", lineHeight: 1.5 }}>
          You've reached the final stage! Choose between your box or the remaining box.
        </p>
        
        <BoxesContainer>
          <BoxChoice 
            isPlayer 
            showing={showPrizes}
            onClick={() => !thinking && handleDecision(true)}
          >
            {playerBox.id}
            <small>Your Box</small>
            
            {showPrizes && (
              <PrizeContainer>
                <PrizeValues>
                  <PrizeAmount>
                    <DiamondIcon size={16} />
                    {playerBoxValue.toLocaleString()}
                  </PrizeAmount>
                  <PrizeAmount>
                    <DiamondIcon size={16} />
                    {otherBoxValue.toLocaleString()}
                  </PrizeAmount>
                </PrizeValues>
              </PrizeContainer>
            )}
          </BoxChoice>
          
          <BoxChoice 
            showing={showPrizes}
            onClick={() => !thinking && handleDecision(false)}
          >
            {otherBox.id}
            <small>Mystery Box</small>
            
            {showPrizes && (
              <PrizeContainer>
                <PrizeValues>
                  <PrizeAmount>
                    <DiamondIcon size={16} />
                    {playerBoxValue.toLocaleString()}
                  </PrizeAmount>
                  <PrizeAmount>
                    <DiamondIcon size={16} />
                    {otherBoxValue.toLocaleString()}
                  </PrizeAmount>
                </PrizeValues>
              </PrizeContainer>
            )}
          </BoxChoice>
        </BoxesContainer>
        
        {showPrizes && (
          <StatsPanel>
            <p>Either {Math.min(playerBoxValue, otherBoxValue).toLocaleString()} or {Math.max(playerBoxValue, otherBoxValue).toLocaleString()} diamonds await!</p>
          </StatsPanel>
        )}
        
        <p style={{ opacity: 0.8 }}>
          Would you like to keep your original box, or swap to the remaining box to win diamonds?
        </p>
        
        {thinking && (
          <ThinkingText>
            Revealing your prize...
          </ThinkingText>
        )}
        
        {!thinking && (
          <ButtonsContainer>
            <Button
              primary
              onClick={() => handleDecision(true)}
            >
              KEEP BOX #{playerBox.id}
            </Button>
            <Button
              onClick={() => handleDecision(false)}
            >
              SWAP TO BOX #{otherBox.id}
            </Button>
          </ButtonsContainer>
        )}
      </Panel>
    </Backdrop>
  );
};

export default SwapOrKeepModal; 