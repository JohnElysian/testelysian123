import React, { useState, useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { ACTIONS } from "./gameReducer";
import DiamondIcon from "./DiamondIcon";

/* ---- animations ---- */
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const spotlight = keyframes`
  0% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
`;

const goldPulse = keyframes`
  0% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.8); }
  100% { box-shadow: 0 0 15px rgba(255, 215, 0, 0.5); }
`;

const shake = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(1deg); }
  50% { transform: rotate(0deg); }
  75% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;

const slideOut = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(150%); opacity: 0; }
`;

const slideOutReverse = keyframes`
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-150%); opacity: 0; }
`;

const revealSuspense = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  60% { transform: scale(1.03); }
  70% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const explosionAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; background: rgba(220, 38, 38, 0.3); }
  10% { transform: scale(1.1); opacity: 1; background: rgba(220, 38, 38, 0.5); }
  20% { transform: scale(0.9); opacity: 1; background: rgba(220, 38, 38, 0.6); }
  30% { transform: scale(1.2); opacity: 1; background: rgba(220, 38, 38, 0.7); }
  40% { transform: scale(0.95); opacity: 1; background: rgba(220, 38, 38, 0.8); }
  50% { transform: scale(1.1); opacity: 1; background: rgba(220, 38, 38, 0.9); }
  100% { transform: scale(1); opacity: 1; background: rgba(220, 38, 38, 0.3); }
`;

const rainbowSelectionEffect = keyframes`
  0% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.7); }
  14% { box-shadow: 0 0 30px rgba(255, 127, 0, 0.7); }
  28% { box-shadow: 0 0 30px rgba(255, 255, 0, 0.7); }
  42% { box-shadow: 0 0 30px rgba(0, 255, 0, 0.7); }
  56% { box-shadow: 0 0 30px rgba(0, 0, 255, 0.7); }
  70% { box-shadow: 0 0 30px rgba(75, 0, 130, 0.7); }
  84% { box-shadow: 0 0 30px rgba(148, 0, 211, 0.7); }
  100% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.7); }
`;

const selectionJitter = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-5px, -5px) rotate(-1deg); }
  20% { transform: translate(5px, -5px) rotate(1deg); }
  30% { transform: translate(5px, 5px) rotate(0deg); }
  40% { transform: translate(-5px, 5px) rotate(-1deg); }
  50% { transform: translate(0, -10px) rotate(1deg); }
  60% { transform: translate(10px, 0) rotate(0deg); }
  70% { transform: translate(-10px, 0) rotate(-1deg); }
  80% { transform: translate(0, 10px) rotate(1deg); }
  90% { transform: translate(-2px, -2px) rotate(0deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const thirdLastBoxReveal = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 255, 255, 0.3); }
  20% { transform: scale(1.1); box-shadow: 0 0 25px rgba(255, 255, 255, 0.5); }
  40% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 255, 255, 0.4); }
  60% { transform: scale(1.15); box-shadow: 0 0 30px rgba(255, 255, 255, 0.6); }
  80% { transform: scale(1.1); box-shadow: 0 0 25px rgba(255, 255, 255, 0.5); }
  100% { transform: scale(1.2); box-shadow: 0 0 35px rgba(255, 255, 255, 0.7); }
`;

const spotlightPulse = keyframes`
  0% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.4); }
  50% { box-shadow: 0 0 40px rgba(255, 255, 255, 0.7); }
  100% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.4); }
`;

/* Add enhanced box reveal animations */
const glowingPulse = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.5); }
  25% { box-shadow: 0 0 25px rgba(255, 255, 255, 0.8), 0 0 15px rgba(139, 92, 246, 0.8); }
  50% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
  75% { box-shadow: 0 0 30px rgba(255, 255, 255, 0.9), 0 0 20px rgba(139, 92, 246, 0.9); }
  100% { box-shadow: 0 0 50px rgba(255, 255, 255, 1.0), 0 0 30px rgba(139, 92, 246, 1.0); }
`;

const suspenseShake = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  10% { transform: rotate(-3deg) scale(1.03); }
  20% { transform: rotate(2deg) scale(1.05); }
  30% { transform: rotate(-2deg) scale(1.07); }
  40% { transform: rotate(2deg) scale(1.05); }
  50% { transform: rotate(-1deg) scale(1.07); }
  60% { transform: rotate(1deg) scale(1.09); }
  70% { transform: rotate(-1deg) scale(1.05); }
  80% { transform: rotate(1deg) scale(1.03); }
  90% { transform: rotate(0deg) scale(1.05); }
  100% { transform: rotate(0deg) scale(1.1); }
`;

const popOpen = keyframes`
  0% { transform: scale(1.1); }
  40% { transform: scale(0.9); }
  70% { transform: scale(1.1); }
  85% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

/* ---- styled components ---- */
const BoardWrapper = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  gap: 2rem;
  flex: 1;
  ${css`animation: ${fadeIn} 0.4s ease;`}
  min-height: 60vh;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
`;

const ValueItem = styled.li`
  padding: 0.5rem 0.6rem;
  text-align: center;
  border-radius: var(--radius-sm);
  font-weight: 600;
  background: ${({ side }) =>
    side === "left" ? "rgba(30,64,175,.15)" : "rgba(220,38,38,.15)"};
  text-decoration: ${({ opened }) => (opened ? "line-through" : "none")};
  opacity: ${({ opened }) => (opened ? 0.35 : 1)};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  ${({ opened, side }) =>
    opened &&
    css`
      animation: ${side === "left" ? slideOutReverse : slideOut} 0.8s forwards;
    `}
    
  .diamond-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
  }
`;

const ValuesCol = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  justify-content: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  align-content: center;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const BoxBtn = styled.button`
  background: ${({ opened, isPlayerBox, valueType, isSelectionPhase, isHighestValue }) =>
    opened
      ? isHighestValue 
        ? "rgba(220, 38, 38, 0.3)" // Red for highest value (lost)
        : valueType === "low"
          ? "rgba(16, 185, 129, 0.3)" // Green for low values (REVERSED)
          : "rgba(220, 38, 38, 0.3)" // Red for high values (REVERSED)
      : isPlayerBox
      ? "linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(218, 165, 32, 0.9))" // Gold gradient for player box
      : isSelectionPhase
      ? "linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(79, 70, 229, 0.7))"
      : "linear-gradient(135deg, rgba(139, 92, 246, 0.7), rgba(79, 70, 229, 0.7))"};
  border: none;
  border-radius: var(--radius);
  padding: 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${({ isPlayerBox }) => isPlayerBox ? '#000' : '#fff'};
  cursor: ${({ opened, disabled }) =>
    opened || disabled ? "default" : "pointer"};
  position: relative;
  transition: transform 0.15s, box-shadow 0.2s;
  box-shadow: ${({ opened, isPlayerBox, valueType, isSelectionPhase, isSpotlighted, isHighestValue }) =>
    opened
      ? isHighestValue 
        ? "0 0 20px rgba(220, 38, 38, 0.5)" // Red glow for highest value (lost)
        : valueType === "low"
          ? "0 0 15px rgba(16, 185, 129, 0.2)" // Green glow for low values (REVERSED)
          : "0 0 15px rgba(220, 38, 38, 0.2)" // Red glow for high values (REVERSED)
      : isPlayerBox
      ? "0 0 20px rgba(255, 215, 0, 0.6)" // Gold glow for player box
      : isSpotlighted
      ? "0 0 25px rgba(255, 255, 255, 0.5)" // Spotlight glow
      : "0 0 10px rgba(139, 92, 246, 0.3)"};
  
  &:hover:not(:disabled) {
    transform: ${({ opened }) => (opened ? "none" : "translateY(-2px)")};
    box-shadow: ${({ opened, isPlayerBox, valueType, isHighestValue }) =>
      opened
        ? isHighestValue 
          ? "0 0 20px rgba(220, 38, 38, 0.6)" // Red glow for highest value (lost)
          : valueType === "low"
            ? "0 0 15px rgba(16, 185, 129, 0.3)" // Green glow for low values (REVERSED)
            : "0 0 15px rgba(220, 38, 38, 0.3)" // Red glow for high values (REVERSED)
        : isPlayerBox
        ? "0 0 25px rgba(255, 215, 0, 0.7)" // Gold glow for player box
        : "0 0 15px rgba(139, 92, 246, 0.4)"};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.97);
  }
  
  ${({ isPlayerBox }) =>
    isPlayerBox &&
    css`
      animation: ${goldPulse} 2s infinite ease-in-out;
      text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
      font-weight: 800;
    `}
    
  ${({ isSpotlighted }) =>
    isSpotlighted &&
    css`
      animation: ${rainbowSelectionEffect} 3s infinite ease-in-out,
                 ${selectionJitter} 2s infinite ease-in-out;
      z-index: 5;
      transform: scale(1.1);
    `}
    
  ${({ isRevealing }) =>
    isRevealing &&
    css`
      animation: ${glowingPulse} 1s ease-in-out forwards, ${suspenseShake} 1.5s ease-in-out;
      z-index: 10;
    `}
    
  ${({ isHighestValue }) =>
    isHighestValue &&
    css`
      animation: ${explosionAnimation} 1s forwards;
    `}
    
  ${({ isPreSwapRevealing }) =>
    isPreSwapRevealing &&
    css`
      animation: ${thirdLastBoxReveal} 2.5s forwards;
      z-index: 10;
    `}
`;

const InfoText = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #ffffff;
  font-weight: 600;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.2);
  border-radius: var(--radius);
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.2);
  transform: translateZ(0);
  backface-visibility: hidden;
  position: relative;
  z-index: 5;
`;

const BoxContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .value-with-icon {
    display: flex;
    align-items: center;
    gap: 4px;
    animation: ${popOpen} 0.5s ease-out;
  }
  
  .box-label {
    display: block;
    font-size: 12px;
    opacity: 0.8;
    margin-top: 4px;
  }
`;

/* ---- component ---- */
const GameBoard = ({ state, dispatch }) => {
  const { boxes, openedCount, phase, playerBoxId } = state;
  const [spotlightIndex, setSpotlightIndex] = useState(null);
  const [revealingBox, setRevealingBox] = useState(null);
  const [highestValueBox, setHighestValueBox] = useState(null);
  const [lastOpenedBox, setLastOpenedBox] = useState(null);
  const [tauntMessage, setTauntMessage] = useState("");
  const [tauntTimer, setTauntTimer] = useState(0);
  const isSelectionPhase = phase === "playing" && playerBoxId === null;

  // Find the highest value box
  useEffect(() => {
    if (boxes.length === 0) return;
    const maxValue = Math.max(...boxes.map(b => b.value));
    const highestBox = boxes.find(b => b.value === maxValue);
    setHighestValueBox(highestBox?.id);
  }, [boxes]);

  // Generate taunting messages based on game state when banker offers are disabled
  useEffect(() => {
    if (!state.bankerOffersEnabled && phase === "playing" && playerBoxId !== null) {
      // Change the taunt message every 4-8 opened boxes
      if (tauntTimer !== openedCount && openedCount % Math.floor(3 + Math.random() * 5) === 0) {
        setTauntTimer(openedCount);
        
        // Analyze game state to generate appropriate taunt
        const remainingBoxes = boxes.filter(b => !b.opened && b.id !== playerBoxId);
        const openedBoxes = boxes.filter(b => b.opened);
        const remainingValues = remainingBoxes.map(b => b.value);
        const avgRemainingValue = remainingValues.length > 0 ? 
          remainingValues.reduce((sum, val) => sum + val, 0) / remainingValues.length : 0;
        
        // Check if player has lost high values
        const sortedValues = [...boxes.map(b => b.value)].sort((a, b) => b - a);
        const topThreeValues = sortedValues.slice(0, 3);
        const lostHighValues = openedBoxes.filter(b => topThreeValues.includes(b.value)).length;
        
        // Check if player is going fast or slow
        const timeBetweenOpens = state.lastOpenTime ? (Date.now() - state.lastOpenTime) / 1000 : 0;
        const isPlayingFast = timeBetweenOpens < 3;
        const isPlayingSlow = timeBetweenOpens > 10;
        
        // Different categories of taunts
        const lostHighValueTaunts = [
          "Ouch! That was an expensive mistake!",
          "Kiss that money goodbye!",
          "The diamond gods are not smiling on you today!",
          "That's one way to throw away a fortune!",
          "Now THAT'S how you lose a game!",
        ];
        
        const generalTaunts = [
          "Still trying to figure out how to play?",
          "My grandmother picks boxes better than you!",
          "Let me know when you start using strategy...",
          "I've seen better gameplay from random number generators!",
          "Are you deliberately trying to lose?",
          "Statistically speaking, you're making terrible choices!",
          "Do you want me to explain the rules again?",
          "This is painful to watch...",
          "Is this your first time playing any game?",
          "I'm actually impressed by how bad you're doing!",
        ];
        
        const endgameTaunts = [
          "Almost done! You've almost survived your bad decisions!",
          "The end is near! For your chances at a big prize...",
          "Final few boxes! Try not to mess it up now!",
          "So close to the final decision! I'm excited to see you fail!",
          "Just a few more mistakes to go!",
        ];
        
        const speedTaunts = [
          isPlayingFast ? "Whoa there! Rushing to lose?" : "",
          isPlayingFast ? "Slow down! Your luck can't keep up with that speed!" : "",
          isPlayingFast ? "Too fast! Are you even thinking about your choices?" : "",
          isPlayingSlow ? "Sometime this year would be nice..." : "",
          isPlayingSlow ? "Did you fall asleep? Make a choice!" : "",
          isPlayingSlow ? "The suspense is killing me... from boredom! Hurry up " : "",
        ].filter(Boolean);
        
        // Select a message category based on game state
        let messagePool;
        
        if (remainingBoxes.length <= 5) {
          messagePool = endgameTaunts;
        } else if (lostHighValues > 0 && Math.random() < 0.7) {
          messagePool = lostHighValueTaunts;
        } else if (speedTaunts.length > 0 && Math.random() < 0.5) {
          messagePool = speedTaunts;
        } else {
          messagePool = generalTaunts;
        }
        
        // Select a random message from the pool
        const randomMessage = messagePool[Math.floor(Math.random() * messagePool.length)];
        setTauntMessage(randomMessage);
      }
    }
  }, [state.bankerOffersEnabled, openedCount, phase, playerBoxId, boxes]);

  // Spotlight animation before player selects a box - much more exciting now!
  useEffect(() => {
    if (!isSelectionPhase || boxes.length === 0) return;
    
    // Don't stop the animation until player selects a box
    const animateSpotlight = () => {
      // Random box selection
      const randomBox = boxes[Math.floor(Math.random() * boxes.length)].id;
      setSpotlightIndex(randomBox);
      
      // Gradually changing speed to create more dynamic movement
      const speed = Math.floor(200 + Math.random() * 300); // Random speed between 200-500ms
      
      // Continue indefinitely until component unmounts or phase changes
      spotlightTimeout = setTimeout(animateSpotlight, speed);
    };
    
    // Start the animation
    let spotlightTimeout = setTimeout(animateSpotlight, 100);
    
    // Clear on unmount or when player selects a box
    return () => clearTimeout(spotlightTimeout);
  }, [boxes, isSelectionPhase]);

  // Create revealing effect when opening a box
  const handleOpen = (id) => {
    if (phase !== "playing" || id === playerBoxId) return;
    
    // Check if this is the crucial third-to-last box (which will trigger swap phase)
    const boxesLeft = boxes.filter(b => !b.opened && b.id !== playerBoxId).length;
    const isPreSwapBox = boxesLeft === 3; // This is the box that will lead to 2 remaining boxes
    
    // Set the box as revealing (for animation)
    setRevealingBox(id);
    setLastOpenedBox(id);
    
    // For the special pre-swap box, add extra suspense
    if (isPreSwapBox) {
      // Longer, more dramatic reveal for the crucial box
      setTimeout(() => {
        // Open the box but don't clear the revealing state yet for extended visual effect
        dispatch({ type: ACTIONS.OPEN_BOX, boxId: id, isPreSwapBox: true });
        
        // Extended reveal time to let the user see what was in this important box
        setTimeout(() => {
          setRevealingBox(null);
          
          // Add a slight delay before showing the swap modal to build suspense
          // The actual swap modal will be triggered by the reducer
        }, 2500); // Extended time to observe the opened box
      }, 1500); // Extended build-up time
    } else {
      // Enhanced box opening animation with suspense
      // First phase: Glowing/shaking animation
      // Second phase: Open the box
      // Third phase: Allow the open value to be visible for a moment

      // Phase 1: Glow and shake animation for suspense (1 second)
      setTimeout(() => {
        // Phase 2: Dispatch the action to open the box and show value
        dispatch({ type: ACTIONS.OPEN_BOX, boxId: id });
        
        // Phase 3: Keep the box in "revealing" state for a short time to emphasize the result
        setTimeout(() => {
          // Animation complete - stop revealing
          setRevealingBox(null);
        }, 700); // Show the opened value with highlight for 700ms
      }, 1000); // Wait 1 second for suspense animation
    }
  };

  // Correctly format the boxes remaining message with singular/plural
  const getBoxesRemainingText = () => {
    // Count boxes that can still be opened (excluding player's chosen box)
    const openableBoxes = boxes.filter(b => !b.opened && b.id !== playerBoxId);
    const boxesLeft = openableBoxes.length;
    
    // The swap phase happens when there are exactly 2 boxes left total (player's box + 1 more)
    // So we need to accurately calculate how many more boxes to open before reaching that point
    const boxesUntilSwapPhase = boxesLeft - 1;
    
    if (boxesUntilSwapPhase <= 3) {
      // Handle singular/plural correctly
      if (boxesUntilSwapPhase === 0) {
        return `Open this box to reach the Keep or Swap decision`;
      } else if (boxesUntilSwapPhase === 1) {
        return `Open 1 more box until Keep or Swap decision`;
      } else {
        return `Open ${boxesUntilSwapPhase} more boxes until Keep or Swap decision`;
      }
    } else if (!state.bankerOffersEnabled) {
      // When banker is disabled, show count with taunting message
      return tauntMessage ? 
        `${boxesLeft} boxes remaining. ${tauntMessage}` : 
        `${boxesLeft} boxes remaining`;
    } else {
      // Regular banker offer countdown message
      const offersUntil = state.roundsBetweenOffers - (openedCount % state.roundsBetweenOffers);
      // Check if this is the first offer or a subsequent offer
      const isFirstOffer = !state.offerHistory || state.offerHistory.length === 0;
      return `Open boxes to continue (${offersUntil} until ${isFirstOffer ? 'first' : 'next'} offer)`;
    }
  };

  if (boxes.length === 0) {
    return (
      <InfoText>
        <span style={{ display: "inline-block" }}>Configure game settings to start playing</span>
      </InfoText>
    );
  }

  /* value board */
  const sorted = [...boxes].sort((a, b) => a.value - b.value);
  const half = Math.ceil(sorted.length / 2);
  
  // Determine the median value to decide if a box is "low" or "high" value
  const allValues = boxes.map(box => box.value);
  const medianValue = [...allValues].sort((a, b) => a - b)[Math.floor(allValues.length / 2)];

  const renderValueList = (list, side) => (
    <ValuesCol side={side}>
      {list.map((box) => {
        // Find if this box has been opened
        const boxOpened = box.opened;
        
        return (
          <ValueItem key={box.value} opened={boxOpened} side={side}>
            <span className="diamond-wrapper">
              <DiamondIcon size={14} />
            </span>
            {box.value.toLocaleString()}
          </ValueItem>
        );
      })}
    </ValuesCol>
  );
  
  // Determine if a box has low or high value for color coding
  const getValueType = (value) => {
    return value < medianValue ? "low" : "high";
  };

  return (
    <>
      <InfoText>
        {phase === "playing" && playerBoxId === null
          ? "Select your box by clicking on it"
          : phase === "playing" && state.bankerWillCall
          ? "Banker is calling..."
          : phase === "playing"
          ? getBoxesRemainingText()
          : phase === "swap"
          ? "Final decision: Swap or Keep your box"
          : phase === "finished"
          ? "Game finished!"
          : ""}
      </InfoText>
      
      <BoardWrapper>
        {renderValueList(sorted.slice(0, half), "left")}
        
        <Grid>
          {/* Order boxes by ID to always display them in sequence from 1-24 */}
          {[...boxes].sort((a, b) => a.id - b.id).map((box) => (
            <BoxBtn
              key={box.id}
              opened={box.opened}
              isPlayerBox={box.id === playerBoxId}
              isSelectionPhase={isSelectionPhase}
              isSpotlighted={spotlightIndex === box.id && !playerBoxId}
              isRevealing={revealingBox === box.id && !state.isPreSwapReveal}
              isPreSwapRevealing={revealingBox === box.id && state.isPreSwapReveal}
              isHighestValue={box.opened && box.id === highestValueBox && lastOpenedBox === box.id}
              valueType={box.opened ? getValueType(box.value) : undefined}
              disabled={
                box.opened ||
                (playerBoxId === null ? false : box.id === playerBoxId) ||
                phase !== "playing" ||
                revealingBox !== null || // Disable all boxes while one is revealing
                state.bankerWillCall // Also disable when banker is about to call
              }
              onClick={() =>
                playerBoxId === null
                  ? dispatch({ type: ACTIONS.SET_PLAYER_BOX, boxId: box.id })
                  : handleOpen(box.id)
              }
            >
              <BoxContent>
                {box.opened ? (
                  <div className="value-with-icon">
                    <span className="diamond-wrapper">
                      <DiamondIcon size={16} />
                    </span>
                    {box.value.toLocaleString()}
                  </div>
                ) : (
                  box.id
                )}
                {box.id === playerBoxId && (
                  <small className="box-label">
                    Your Box
                  </small>
                )}
              </BoxContent>
            </BoxBtn>
          ))}
        </Grid>
        
        {renderValueList(sorted.slice(half), "right")}
      </BoardWrapper>
    </>
  );
};

export default GameBoard; 