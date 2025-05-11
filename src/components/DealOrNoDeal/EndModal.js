import React, { useState, useEffect, useMemo } from "react";
import styled, { css, keyframes } from "styled-components";
import { motion } from "framer-motion";
import { ACTIONS } from "./gameReducer";
import DiamondIcon from "./DiamondIcon";

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  
  // This is important - capture ALL pointer events on the backdrop
  pointer-events: auto;
`;

const Panel = styled(motion.div)`
  background: rgba(17, 24, 39, 0.95);
  padding: 2rem;
  border-radius: var(--radius);
  width: 380px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  // This is important - restore pointer events on the panel only
  pointer-events: auto;
`;

const countUp = keyframes`
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
`;

const drumroll = keyframes`
  0% { transform: scale(1); }
  10% { transform: scale(1.02); }
  20% { transform: scale(1); }
  30% { transform: scale(1.02); }
  40% { transform: scale(1); }
  50% { transform: scale(1.02); }
  60% { transform: scale(1); }
  70% { transform: scale(1.02); }
  80% { transform: scale(1); }
  90% { transform: scale(1.02); }
  100% { transform: scale(1.1); }
`;

// New intense celebration animation
const explosionAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1.2); }
`;

const rotateAnimation = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-15deg); }
  100% { transform: rotate(0deg); }
`;

// Rainbow text effect for big wins
const rainbowText = keyframes`
  0% { color: #ff0000; }
  14% { color: #ff7f00; }
  28% { color: #ffff00; }
  42% { color: #00ff00; }
  56% { color: #0000ff; }
  70% { color: #4b0082; }
  84% { color: #9400d3; }
  100% { color: #ff0000; }
`;

const AmountDisplay = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  margin: 1rem 0;
  text-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  opacity: ${props => props.revealed ? 1 : 0};
  transform: scale(${props => props.revealed ? 1.1 : 0.8});
  transition: all 0.5s ease;
  
  ${props => props.revealed 
    ? props.isBigWin 
      ? css`animation: ${countUp} 0.8s forwards, ${explosionAnimation} 1s 0.8s infinite, ${rotateAnimation} 3s 0.8s infinite;`
      : css`animation: ${countUp} 0.8s forwards;`
    : 'animation: none;'
  }
  
  ${props => props.isBigWin && css`
    text-shadow: 0 0 25px rgba(255, 215, 0, 0.8);
    animation: ${rainbowText} 4s infinite, ${explosionAnimation} 2s infinite;
  `}
`;

const CountingValue = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  margin: 1rem 0;
  text-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  animation: ${drumroll} 2.5s forwards;
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Define the fall animation properly
const fallAnimation = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg);
  }
  100% {
    transform: translateY(calc(100vh + 100px)) rotate(360deg);
  }
`;

// Animated confetti elements
const Confetti = styled.div`
  position: absolute;
  top: -10%;
  left: 0;
  width: 100%;
  height: 120%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

const ConfettiPiece = styled.span`
  position: absolute;
  width: ${props => props.size || '10px'};
  height: ${props => props.size || '10px'};
  background: ${props => props.color || 'var(--accent)'};
  opacity: 0.6;
  border-radius: 50%;
  ${props => css`
    animation: ${fallAnimation} ${props.duration || '3s'} linear infinite;
    animation-delay: ${props.delay || '0s'};
  `}
  left: ${props => props.left || '50%'};
`;

// Add more intensive confetti for big wins
const massiveConfetti = keyframes`
  0% {
    transform: translateY(-100px) rotate(0deg) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(calc(100vh + 100px)) rotate(720deg) scale(0.5);
    opacity: 0.7;
  }
`;

const GiantConfettiPiece = styled.span`
  position: absolute;
  width: ${props => props.size || '30px'};
  height: ${props => props.size || '30px'};
  background: ${props => props.color || 'gold'};
  opacity: 0.8;
  border-radius: ${props => props.shape === 'circle' ? '50%' : '0'};
  clip-path: ${props => props.shape === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none'};
  ${props => css`
    animation: ${massiveConfetti} ${props.duration || '3s'} linear infinite;
    animation-delay: ${props.delay || '0s'};
  `}
  left: ${props => props.left || '50%'};
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
`;

const CelebrationText = styled.div`
  position: relative;
  font-size: 2rem;
  font-weight: 700;
  z-index: 1;
  margin: 1rem 0;
  ${props => css`
    animation: ${rainbowText} 4s infinite, ${explosionAnimation} 2s infinite;
  `}
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.7);
`;

const BoxComparisonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 1.5rem 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const BoxInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  
  .box-number {
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }
  
  .box-label {
    font-size: 0.9rem;
    opacity: 0.7;
    margin-bottom: 0.5rem;
  }
  
  .box-value {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: ${props => props.isChosen ? '1.3rem' : '1.1rem'};
    font-weight: ${props => props.isChosen ? '700' : '500'};
    color: ${props => props.isChosen ? 'var(--accent)' : 'rgba(255, 255, 255, 0.7)'};
    transition: all 0.3s ease;
    padding: 0.5rem 0.8rem;
    border-radius: var(--radius-sm);
    background: ${props => props.isChosen ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
    
    ${props => props.isHidden && css`
      opacity: 0;
      transform: scale(0.9);
    `}
    
    ${props => props.isRevealing && css`
      animation: ${countUp} 0.5s forwards;
    `}
  }
`;

const ChoiceInfo = styled.div`
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--accent);
  font-weight: 500;
  
  strong {
    font-weight: 700;
  }
`;

const ComparisonArrow = styled.div`
  font-size: 1.5rem;
  color: ${props => props.direction === 'better' ? '#10B981' : // green
          props.direction === 'worse' ? '#EF4444' : // red
          'rgba(255, 255, 255, 0.5)'}; // neutral
  margin: 0 0.5rem;
`;

// Add a styled component for the title
const GameTitle = styled.h2`
  margin: 0;
  position: relative;
  z-index: 1;
  ${props => props.isWinning && css`
    animation: ${rainbowText} 4s infinite;
  `}
`;

// Separate component for value lists that won't capture clicks
const ValueListsWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  padding: 1.5rem;
  pointer-events: none;
  z-index: -1;
  
  @media (max-width: 1000px) {
    display: none; // Hide on small screens where they'd overlap
  }
`;

const ValuesColEnd = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  justify-content: center;
  pointer-events: none;
  opacity: 0.9;
`;

const ValueItemEnd = styled.li`
  padding: 0.5rem 0.6rem;
  text-align: center;
  border-radius: var(--radius-sm);
  font-weight: 600;
  background: ${({ side }) =>
    side === "left" ? "rgba(30,64,175,.25)" : "rgba(220,38,38,.25)"};
  text-decoration: ${({ opened }) => (opened ? "line-through" : "none")};
  opacity: ${({ opened }) => (opened ? 0.35 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  .diamond-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
  }
`;

const EndModal = ({ state, dispatch }) => {
  const [revealState, setRevealState] = useState('counting'); // counting, revealed
  const [countValue, setCountValue] = useState(0);
  const [showBoxesPhase, setShowBoxesPhase] = useState('hidden'); // hidden, showingChosen, showingBoth
  
  // Prepare the value lists for display
  const sorted = [...state.boxes].sort((a, b) => a.value - b.value);
  const half = Math.ceil(sorted.length / 2);
  
  // Function to render value list similar to GameBoard
  const renderValueList = (list, side) => (
    <ValuesColEnd side={side}>
      {list.map((box) => (
        <ValueItemEnd key={box.value} opened={box.opened} side={side}>
          <span className="diamond-wrapper">
            <DiamondIcon size={14} />
          </span>
          {Math.round(box.value).toLocaleString()}
        </ValueItemEnd>
      ))}
    </ValuesColEnd>
  );
  
  // Create a staged reveal for box values after counting completes
  useEffect(() => {
    if (revealState === 'revealed') {
      // First show the chosen box value
      const timerChosen = setTimeout(() => {
        setShowBoxesPhase('showingChosen');
        
        // Then show the other box value with another delay for suspense
        const timerBoth = setTimeout(() => {
          setShowBoxesPhase('showingBoth');
        }, 2000); // 2 seconds of suspense before revealing other box
        
        return () => clearTimeout(timerBoth);
      }, 1000); // 1 second after counting before showing chosen box
      
      return () => clearTimeout(timerChosen);
    }
  }, [revealState]);
  
  // Determine if this is a big win (>50% of max prize)
  const isBigWin = state.acceptedValue > (state.maxPrizePreset * 0.5);
  
  // Determine if player made the best choice in the swap decision
  const madeOptimalChoice = state.phase === 'finished' && state.swapDecision !== undefined && 
    ((state.swapDecision && state.swappedBoxValue > state.playerBoxValue) || 
    (!state.swapDecision && state.playerBoxValue > state.swappedBoxValue));
  
  // Combined celebration trigger
  const shouldCelebrate = isBigWin || madeOptimalChoice;
  
  // Extract swap decision info
  const didSwap = state.swapDecision;
  const chosenBoxId = didSwap ? state.swappedBoxId : state.playerBoxId;
  const otherBoxId = didSwap ? state.playerBoxId : state.swappedBoxId;
  const chosenBoxValue = state.acceptedValue;
  const otherBoxValue = didSwap ? state.playerBoxValue : state.swappedBoxValue;
  
  // Determine if player made a good choice
  const choiceDifference = chosenBoxValue - otherBoxValue;
  const choiceDirection = choiceDifference > 0 ? 'better' : 
                          choiceDifference < 0 ? 'worse' : 'same';

  // Generate confetti elements once with memoization to prevent redrawing
  const { confettiElements, giantConfetti } = useMemo(() => {
    // Generate regular confetti elements
    const confetti = [...Array(shouldCelebrate ? 80 : 50)].map((_, i) => {
      const size = `${5 + Math.random() * 10}px`;
      const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
      const duration = `${2 + Math.random() * 6}s`;
      const delay = `${Math.random() * 5}s`;
      const left = `${Math.random() * 100}%`;
      
      return (
        <ConfettiPiece 
          key={i}
          size={size}
          color={color}
          duration={duration}
          delay={delay}
          left={left}
        />
      );
    });
    
    // Generate special giant confetti for big wins
    const giant = shouldCelebrate ? [...Array(15)].map((_, i) => {
      const shapes = ['circle', 'square', 'star'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const size = `${20 + Math.random() * 20}px`;
      const colors = ['gold', '#ff0000', '#00ff00', '#0000ff', '#ff00ff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = `${3 + Math.random() * 8}s`;
      const delay = `${Math.random() * 3}s`;
      const left = `${Math.random() * 100}%`;
      
      return (
        <GiantConfettiPiece 
          key={`giant-${i}`}
          size={size}
          color={color}
          duration={duration}
          delay={delay}
          left={left}
          shape={shape}
        />
      );
    }) : [];
    
    return { confettiElements: confetti, giantConfetti: giant };
  }, [shouldCelebrate]);
  
  // Create dramatic count-up animation for the final prize
  useEffect(() => {
    if (revealState !== 'counting') return;
    
    // Create dramatic counting effect before showing final value
    const finalValue = Math.round(state.acceptedValue);
    
    // For small values (below 500), use a faster animation
    const isSmallPrize = finalValue < 500;
    // For large prizes (above 10,000), use special handling
    const isLargePrize = finalValue > 10000;
    
    // Determine timing based on prize size
    let baseInterval = isSmallPrize ? 20 : 40; // Speed up base intervals
    let pauseDuration = isSmallPrize ? 150 : 300; // Shorter pauses
    let finalDuration = isSmallPrize ? 300 : 800;
    
    // For very small prizes (<100), make it even faster
    if (finalValue < 100) {
      baseInterval = 10;
      pauseDuration = 80;
      finalDuration = 150;
    }
    
    // Faster total duration for all prizes
    const totalDuration = isSmallPrize ? 1200 : (shouldCelebrate ? 3500 : 2500);
    
    let currentValue = 0;
    let timerId;
    
    // For large prizes, start at a higher percentage to avoid too much counting
    const startPercentage = isLargePrize ? 0.35 : 0.05; // Start at 35% for large prizes
    setCountValue(Math.max(Math.floor(finalValue * startPercentage), 1));
    currentValue = Math.floor(finalValue * startPercentage);
    
    // For very small amounts (<100), just count by 1s at a rapid pace
    if (finalValue < 100) {
      const interval = Math.max(totalDuration / finalValue, 15);
      let count = 0;
      
      timerId = setInterval(() => {
        count++;
        setCountValue(count);
        
        if (count >= finalValue) {
          clearInterval(timerId);
          setTimeout(() => {
            setRevealState('revealed');
          }, finalDuration);
        }
      }, interval);
      
      return () => clearInterval(timerId);
    }
    
    // For large values, define specific stopping points for more drama
    // But keep fewer stops and make them quicker for large prizes
    const largeValueStops = isLargePrize ? [
      { percent: 0.5, pause: 300 },
      { percent: 0.75, pause: 400 },
      { percent: 0.9, pause: 300 },
      { percent: 0.98, pause: 400 } // Don't waste too much time at 95%
    ] : [];
    
    // Function to create dramatic counting with pauses and varying speeds
    const dramaticCounting = () => {
      // Determine how much to increment based on progress
      const percentComplete = currentValue / finalValue;
      
      // Different phases of counting animation with value-adjusted increments
      let increment;
      
      if (isLargePrize) {
        // For large prizes, use percentage-based increments for smoother counting
        if (percentComplete < 0.5) {
          // First half: Faster speed (2-5% jumps)
          increment = Math.max(Math.floor(finalValue * 0.03), 100);
        } else if (percentComplete < 0.75) {
          // 50-75%: Moderate speed (1-2% jumps)
          increment = Math.max(Math.floor(finalValue * 0.015), 50);
        } else if (percentComplete < 0.9) {
          // 75-90%: Slower (0.5-1% jumps)
          increment = Math.max(Math.floor(finalValue * 0.008), 25);
        } else if (percentComplete < 0.95) {
          // 90-95%: Slow (0.3% jumps)
          increment = Math.max(Math.floor(finalValue * 0.003), 15);
        } else if (percentComplete < 0.98) {
          // 95-98%: Very slow (0.2% jumps)
          increment = Math.max(Math.floor(finalValue * 0.002), 10);
        } else if (percentComplete < 0.995) {
          // 98-99.5%: Super slow (0.1% jumps)
          increment = Math.max(Math.floor(finalValue * 0.001), 5);
        } else {
          // Final 0.5%: Small increments for final suspense
          increment = 5; // But never go as slow as 1 by 1
        }
      } else if (percentComplete < 0.3) {
        // Phase 1: Start moderate (small increments)
        increment = Math.max(Math.floor(finalValue * 0.03), 2);
        // For smaller prizes, use larger percentage increments
        if (isSmallPrize) increment = Math.max(Math.floor(finalValue * 0.08), 3);
      } else if (percentComplete < 0.6) {
        // Phase 2: Speed up (medium increments)
        increment = Math.max(Math.floor(finalValue * 0.07), 3);
        if (isSmallPrize) increment = Math.max(Math.floor(finalValue * 0.12), 6);
      } else if (percentComplete < 0.85) {
        // Phase 3: Fast (large increments)
        increment = Math.max(Math.floor(finalValue * 0.1), 5);
        if (isSmallPrize) increment = Math.max(Math.floor(finalValue * 0.15), 10);
      } else if (percentComplete < 0.95) {
        // Phase 4: Slow down (smaller increments)
        increment = Math.max(Math.floor(finalValue * 0.02), 2);
        if (isSmallPrize) increment = Math.max(Math.floor(finalValue * 0.05), 3);
      } else {
        // Final phase: Slower for suspense but still moving steadily
        increment = Math.max(Math.floor(finalValue * 0.01), 2);
        if (isSmallPrize) increment = Math.max(Math.floor(finalValue * 0.02), 2);
      }
      
      // For large prizes, ensure we don't increment too slowly in the last stretch
      if (isLargePrize && finalValue - currentValue > 1000 && increment < 15) {
        increment = 15;
      } else if (isLargePrize && finalValue - currentValue > 500 && increment < 10) {
        increment = 10;
      } else if (isLargePrize && finalValue - currentValue > 100 && increment < 5) {
        increment = 5;
      }
      
      // Special handling for the very end of large prizes - go faster for last bit
      if (isLargePrize && finalValue - currentValue < 100) {
        if (finalValue - currentValue < 50) {
          increment = 10; // Faster increment for last 50
        } else {
          increment = 5; // Slightly faster increment for last 100
        }
      }
      
      // Ensure we don't exceed the final value
      currentValue = Math.min(currentValue + increment, finalValue);
      setCountValue(Math.round(currentValue));
      
      // If we've reached the final value, reveal it
      if (currentValue >= finalValue) {
        setTimeout(() => {
          setRevealState('revealed');
        }, finalDuration);
        return;
      }
      
      // Check for predefined stops for large values
      if (isLargePrize) {
        for (const stop of largeValueStops) {
          // If we just passed a stopping point, pause for dramatic effect
          if (percentComplete < stop.percent && currentValue / finalValue >= stop.percent) {
            clearTimeout(timerId);
            setTimeout(() => {
              if (currentValue < finalValue) {
                timerId = setTimeout(dramaticCounting, Math.floor(baseInterval * 0.8));
              }
            }, stop.pause);
            return;
          }
        }
      } else {
        // For smaller prizes, only pause at 50% - no need for multiple pauses
        const shouldPause = isSmallPrize 
          ? (percentComplete < 0.5 && currentValue / finalValue >= 0.5)
          : ((percentComplete < 0.5 && currentValue / finalValue >= 0.5) ||
             (percentComplete < 0.75 && currentValue / finalValue >= 0.75) ||
             (percentComplete < 0.9 && currentValue / finalValue >= 0.9) ||
             (shouldCelebrate && percentComplete < 0.95 && currentValue / finalValue >= 0.95));
             
        // Add dramatic pauses at threshold points
        if (shouldPause) {
          clearTimeout(timerId);
          // Adjust pause length based on prize size
          setTimeout(() => {
            if (currentValue < finalValue) {
              timerId = setTimeout(dramaticCounting, baseInterval / 2);
            }
          }, pauseDuration);
          return;
        }
      }
      
      // Calculate next interval based on progress and prize size
      let nextInterval;
      
      if (isLargePrize) {
        // For large prizes, adjust interval based on proximity to completion
        if (percentComplete < 0.5) {
          nextInterval = 30; // Fast at the beginning
        } else if (percentComplete < 0.75) {
          nextInterval = 40; // Medium in the middle
        } else if (percentComplete < 0.9) {
          nextInterval = 50; // Slower approaching the end
        } else if (percentComplete < 0.95) {
          nextInterval = 60; // Very slow near the end
        } else if (percentComplete < 0.99) {
          nextInterval = 70; // Super slow for the final stretch
        } else {
          nextInterval = 80; // Extremely slow for the last bits
        }
      } else if (!isSmallPrize) {
        if (percentComplete < 0.7) {
          nextInterval = shouldCelebrate ? 40 : 30;
        } else if (percentComplete < 0.9) {
          nextInterval = shouldCelebrate ? 60 : 40;
        } else {
          nextInterval = shouldCelebrate ? 70 : 50;
        }
      } else {
        nextInterval = baseInterval;
      }
      
      // Schedule next count
      timerId = setTimeout(dramaticCounting, nextInterval);
    };
    
    // Initial delay based on prize size - shorter for small prizes
    const initialDelay = isSmallPrize ? 200 : isLargePrize ? 800 : 500;
    
    // Start the dramatic counting
    timerId = setTimeout(dramaticCounting, initialDelay);
    
    return () => clearTimeout(timerId);
  }, [state.acceptedValue, revealState, shouldCelebrate]);

  return (
    <Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Value lists container */}
      <ValueListsWrapper>
        {renderValueList(sorted.slice(0, half), "left")}
        <div /> {/* Empty center column */}
        {renderValueList(sorted.slice(half), "right")}
      </ValueListsWrapper>
      
      <Panel 
        initial={{ scale: 0.95 }} 
        animate={{ scale: shouldCelebrate && revealState === 'revealed' ? 1.05 : 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Confetti>
          {confettiElements}
          {giantConfetti}
        </Confetti>
        
        <GameTitle isWinning={shouldCelebrate && revealState === 'revealed'}>
          {shouldCelebrate && revealState === 'revealed' ? 'AMAZING WIN!' : 'Game Over!'}
        </GameTitle>
        
        {shouldCelebrate && revealState === 'revealed' && (
          <CelebrationText>
            {isBigWin ? 'JACKPOT!!!' : 'Perfect Choice!'}
          </CelebrationText>
        )}
        
        {/* Show decision info only after counting is done */}
        {revealState === 'revealed' && didSwap !== undefined && (
          <ChoiceInfo>
            You <strong>{didSwap ? 'SWAPPED' : 'KEPT'}</strong> your box!
          </ChoiceInfo>
        )}
        
        {/* Box comparison display - show only after counting animation finishes */}
        {revealState === 'revealed' && didSwap !== undefined && (
          <BoxComparisonContainer>
            <BoxInfo isChosen={true} isHidden={showBoxesPhase === 'hidden'} isRevealing={showBoxesPhase === 'showingChosen' || showBoxesPhase === 'showingBoth'}>
              <div className="box-number">Box #{chosenBoxId}</div>
              <div className="box-label">{didSwap ? 'Swapped To' : 'Your Box'}</div>
              <div className="box-value">
                <DiamondIcon size={16} />
                {Math.round(chosenBoxValue).toLocaleString()}
              </div>
            </BoxInfo>
            
            {choiceDirection !== 'same' && showBoxesPhase === 'showingBoth' && (
              <ComparisonArrow direction={choiceDirection}>
                {choiceDirection === 'better' ? '✓' : '✗'}
              </ComparisonArrow>
            )}
            
            <BoxInfo 
              isChosen={false} 
              isHidden={showBoxesPhase === 'hidden' || showBoxesPhase === 'showingChosen'} 
              isRevealing={showBoxesPhase === 'showingBoth'}
            >
              <div className="box-number">Box #{otherBoxId}</div>
              <div className="box-label">{didSwap ? 'Original Box' : 'Other Box'}</div>
              <div className="box-value">
                <DiamondIcon size={16} />
                {Math.round(otherBoxValue).toLocaleString()}
              </div>
            </BoxInfo>
          </BoxComparisonContainer>
        )}
        
        <p style={{ fontSize: "1.1rem", lineHeight: 1.5, position: "relative", zIndex: 1 }}>
          {revealState === 'counting' ? 'Counting your diamonds...' : 
           showBoxesPhase === 'hidden' ? 'What did you win?' :
           showBoxesPhase === 'showingChosen' ? 'Your final prize...' :
           'You\'ve won:'}
        </p>
        
        {revealState === 'counting' ? (
          <CountingValue style={{ position: "relative", zIndex: 1 }}>
            <DiamondIcon size={36} />
            {Math.round(countValue).toLocaleString()}
          </CountingValue>
        ) : (
          <AmountDisplay 
            revealed={true} 
            isBigWin={shouldCelebrate}
            style={{ position: "relative", zIndex: 1 }}
          >
            <DiamondIcon size={36} />
            {Math.round(state.acceptedValue).toLocaleString()}
          </AmountDisplay>
        )}
        
        {/* Only show the play again button after full reveal */}
        {showBoxesPhase === 'showingBoth' && (
          <Button 
            onClick={() => dispatch({ type: ACTIONS.RESET_GAME })}
            style={{ position: "relative", zIndex: 1 }}
          >
            Play Again
          </Button>
        )}
      </Panel>
    </Backdrop>
  );
};

export default EndModal; 