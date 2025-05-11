import React, { useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';

// Reducer and Initial State
import { wheelReducer, initialState, WHEEL_ACTIONS } from './wheelReducer';

// Custom Hooks
import useWheelEvents from '../../hooks/useWheelEvents';
import useDrawWheel from '../../hooks/useDrawWheel';
import useAutoSpinTimer from '../../hooks/useAutoSpinTimer';

// Child Components
import Button from '../ui/Button';
import SettingsPanel from './SettingsPanel';
import EntryListDisplay from './EntryListDisplay';
import TestEntriesButton from './TestEntriesButton';

// Utilities
import { DEBUG } from '../../utils/debug';
import { startPerformanceMonitoring } from '../../utils/performanceMonitor';

// --- utilities -------------------------------------------------------------
/**  Figure-out the best readable name that TikTok gives us.                    */
const getDisplayName = (d) =>
  (d.uniqueId  && /\D/.test(d.uniqueId) && d.uniqueId.trim()) // @handle first (if not all digits)
  || (d.user?.uniqueId && /\D/.test(d.user.uniqueId) && d.user.uniqueId.trim()) // nested @handle (if not all digits)
  || (d.nickname && d.nickname.trim())               // display name 
  || (d.user?.nickname && d.user.nickname.trim()) // nested display name
  || (d.uniqueId || d.user?.uniqueId || d.userId) // Fallback: any ID (uniqueId, user.uniqueId, or userId)
  || 'Unknown User';

// --- Styled Components (Keep only those directly used by WheelControls) ---

const StatusText = styled.div`
  text-align: center;
  margin: 1rem 0 2rem;
  color: var(--text);
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.07);
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
`;

const WheelDisplayContainer = styled.div`
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 0 0 0.5rem 0;
  overflow: visible;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
  width: auto;

  @media (max-width: 768px) {
    margin-top: 3rem;
    min-height: 450px;
    padding: 1rem;
  }
`;

const WheelWrapper = styled.div`
  position: relative;
  width: ${props => props.size || 400}px;
  height: ${props => props.size || 400}px;
  margin: 0 auto;
  background-color: transparent;
  aspect-ratio: 1/1 !important;
  box-sizing: border-box;
  max-width: min(95vw, 85vh);
  max-height: min(95vw, 85vh);
  flex-shrink: 0;
  flex-grow: 0;

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: center;
    aspect-ratio: 1/1;
    will-change: transform;
    background-color: transparent;
  }
`;

const pointerTickAnimation = keyframes`
  0% { transform: translateX(-50%) rotate(0deg); } 
  50% { transform: translateX(-50%) rotate(-15deg); } 
  100% { transform: translateX(-50%) rotate(0deg); }
`;

const WheelCanvasElement = styled.canvas`
  // The entire block referencing slowSpinAnimation needs to be removed
`;

const WheelPointer = styled.div`
  position: absolute;
  top: -40px; 
  left: 50%;
  transform: translateX(-50%); 
  width: 40px;
  height: 40px; 
  z-index: 4;

  &::before { 
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%); 
    border-left: 15px solid transparent; 
    border-right: 15px solid transparent;
    border-top: 30px solid #e74c3c; 
    filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3)); 
    transform-origin: center top; 
  }
  
  &.tick::before {
     animation: ${pointerTickAnimation} 0.15s ease-out;
  }
`;

const WheelCenter = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  background: #2c3e50;
  border-radius: 50%;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  width: ${props => Math.max(props.entryCount > 300 ? 90 : 60, Math.round(60 * (props.centerSizePercent / 100)))}px;
  height: ${props => Math.max(props.entryCount > 300 ? 90 : 60, Math.round(60 * (props.centerSizePercent / 100)))}px;
  
  &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    background: #ecf0f1;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
    width: ${props => Math.round(30 * (props.centerSizePercent / 100))}px;
    height: ${props => Math.round(30 * (props.centerSizePercent / 100))}px;
  }
`;

const WinnerDisplay = styled.div`
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0 1.5rem 1.5rem;
  padding: 1.5rem;
  background: rgba(30, 64, 175, 0.15);
  border-radius: var(--radius);
  border: 1px solid rgba(59, 130, 246, 0.2);
  position: relative;
  overflow: hidden;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: ${props => props.isVisible ? 'block' : 'none'};
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(30, 64, 175, 0.1) 0%,
      rgba(59, 130, 246, 0.2) 50%,
      rgba(30, 64, 175, 0.1) 100%
    );
    transform: rotate(45deg);
    animation: shimmer 3s ease-in-out infinite;
    z-index: -1;
  }
  @keyframes shimmer { /* Define shimmer if not globally available */
     0% { transform: rotate(45deg) translateX(-100%); }
     100% { transform: rotate(45deg) translateX(100%); }
  }
`;

const WinnerActions = styled.div`
  display: flex;
  gap: 1rem;
  margin: 0 1.5rem 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  display: ${props => props.isVisible ? 'flex' : 'none'};
  
  button {
    flex: 1;
    min-width: 200px;
    max-width: 350px;
  }
`;

const SubscriberToggle = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto; // Pushes to the right in the Controls flex container
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
  }
  
  label {
    cursor: pointer;
    font-weight: 500;
  }
`;

const SettingsButtonContainer = styled.div` // Changed from SettingsButton to avoid name clash
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text);
  cursor: pointer;
  margin-left: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    color: var(--accent);
  }
`;

const ModeButton = styled(Button)`
  &.active {
    background: var(--accent);
    color: white;
    box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3), 0 0 15px rgba(139, 92, 246, 0.2);
    transform: translateY(-3px);
    border-color: rgba(139, 92, 246, 0.5);
    position: relative;
    font-weight: bold;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: var(--accent);
      z-index: -1;
      opacity: 0.3;
      border-radius: var(--radius-sm);
      filter: blur(8px);
      animation: glow 2s ease-in-out infinite;
    }

    @keyframes glow {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.5; }
    }
  }
`;

// New Info Panel Components
const WheelInfoPanel = styled.div`
  position: absolute;
  left: 20px; 
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: rgba(15, 23, 42, 0.85);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(139, 92, 246, 0.2);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  z-index: 15; 
  min-width: 220px;

  @media (max-width: 1200px) {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    margin-bottom: 1.5rem;
    width: 100%;
    align-items: center;
  }
`;

const WheelStatusDisplay = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--accent);
  text-align: center;
`;

const WheelEntryTypeDisplay = styled.div`
  font-size: 1.1rem;
  color: var(--text-light);
  text-align: center;
  margin-top: -0.5rem;
`;

const CountdownDisplay = styled.div`
  font-size: 1.75rem;
  font-weight: bold;
  color: white;
  text-align: center;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-sm);
`;

// Helper function (can be moved to utils if used elsewhere)
const formatTime = (totalSeconds) => {
  if (totalSeconds === null || totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// --- Main Component ---
const WheelControls = () => {
  if (DEBUG) console.log("[WheelControls] Component starting render");
  
  const [state, dispatch] = useReducer(wheelReducer, initialState);
  const { 
    currentMode, isCollecting, isSpinning, isConnected, isVisible,
    wheelEntries, winnerIndex,
    statusText, wheelUiStatus, wheelEntryCostText,
    settingsPanelVisible, subscriberOnly,
    wheelSize, textSize, centerSize, showTextShadows,
    showEntryList, shuffleEntriesOnSpin,
    likesPerEntry, coinsPerEntry, spinDuration,
    isAutoSpinActive, currentCountdown, autoSpinMinutes, autoSpinSeconds,
    // Retrieve new flags from state
    triggerSpinAfterAuto, triggerResetAfterAuto
  } = state;

  // Refs
  const canvasRef = useRef(null);
  const pointerRef = useRef(null);
  const wheelContainerRef = useRef(null); 
  const countdownIntervalRef = useRef(null);
  const fastSpinFrameRef = useRef(null);
  const rotationRef = useRef(0); // Stores current angle in degrees
  const velocityRef = useRef(0); // Stores current angular velocity (deg/sec)
  const lastFrameTimeRef = useRef(performance.now());
  const frictionRef = useRef(0.985); // Default friction
  const prevAngleAtPointerRef = useRef(0);
  const lockedEntriesRef = useRef(null); // Store entries at spin start

  // Ref to hold the latest isSpinning state for use in RAF callbacks
  const isSpinningRef = useRef(state.isSpinning);
  useEffect(() => {
    isSpinningRef.current = state.isSpinning;
  }, [state.isSpinning]);

  // Accumulators / Session Trackers
  const giftSessionsRef = useRef(new Map());
  const giftCoinAccumulatorRef = useRef(new Map());
  const likeSessionsRef = useRef(new Map());
  const likeAccumulatorRef = useRef(new Map());

  // --- Spin Logic Callbacks (defined early due to dependency chain) ---
  const applyRotation = useCallback((degrees) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `rotate(${degrees}deg)`;
    }
  }, []); // canvasRef is stable

  const fastSpinLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!isSpinningRef.current || !canvas) { 
      fastSpinFrameRef.current = null;
      return;
    }

    const frameStartTime = performance.now();
    const elapsed = timestamp - lastFrameTimeRef.current;
    if (elapsed < 16) { // ~60fps
      fastSpinFrameRef.current = requestAnimationFrame(fastSpinLoop);
      return;
    }

    const deltaTime = elapsed / 1000;
    lastFrameTimeRef.current = timestamp;
    
    const minVelocityThreshold = 2;
    const friction = frictionRef.current;
    velocityRef.current *= Math.pow(friction, deltaTime * 60);

    const currentRotation = rotationRef.current + velocityRef.current * deltaTime;
    rotationRef.current = currentRotation;
    applyRotation(currentRotation);

    const pointerEl = pointerRef.current;
    const segments = lockedEntriesRef.current?.length || 0;
    if (pointerEl && segments > 0 && velocityRef.current > 1) {
      const anglePerSegment = 360 / segments;
      const currentAngleAtPointer = (360 - (currentRotation % 360)) % 360;
      const prevAngleAtPointer = prevAngleAtPointerRef.current;
      const currentSegmentIndex = Math.floor(currentAngleAtPointer / anglePerSegment);
      const prevSegmentIndex = Math.floor(prevAngleAtPointer / anglePerSegment);

      if (currentSegmentIndex !== prevSegmentIndex) {
        pointerEl.classList.remove('tick');
        void pointerEl.offsetWidth; 
        pointerEl.classList.add('tick');
      }
      prevAngleAtPointerRef.current = currentAngleAtPointer;
    } else if (pointerEl) {
      if (pointerEl.classList.contains('tick')) pointerEl.classList.remove('tick');
      prevAngleAtPointerRef.current = (360 - (rotationRef.current % 360)) % 360; 
    }

    if (velocityRef.current < minVelocityThreshold) {
      velocityRef.current = 0;
      fastSpinFrameRef.current = null;
      if (pointerEl) pointerEl.classList.remove('tick');
      
      let winningSegmentIndex = -1;
      if (segments > 0) {
        const anglePerSegment = 360 / segments;
        const finalAngleAtPointer = (360 - (rotationRef.current % 360)) % 360;
        winningSegmentIndex = Math.floor(finalAngleAtPointer / anglePerSegment);
        if (winningSegmentIndex < 0 || winningSegmentIndex >= segments) winningSegmentIndex = -1;
      }
      
      dispatch({ type: WHEEL_ACTIONS.STOP_SPINNING });
      dispatch({ type: WHEEL_ACTIONS.SET_WINNER, payload: winningSegmentIndex });
      lockedEntriesRef.current = null;
    } else {
      fastSpinFrameRef.current = requestAnimationFrame(fastSpinLoop);
    }
    
    const frameTime = performance.now() - frameStartTime;
    if (frameTime > 16 && DEBUG) {
      console.warn(`[Wheel Animation] Slow frame: ${frameTime.toFixed(2)}ms (target: 16ms)`);
    }
  }, [applyRotation, dispatch]); // isSpinningRef, refs used inside are stable

  const startSpinningProcess = useCallback(() => {
    if (state.wheelEntries.length === 0) {
      dispatch({ 
        type: WHEEL_ACTIONS.ERROR_OCCURRED, 
        payload: { 
          error: 'No entries', 
          message: 'No entries to spin! Add some entries first.' 
        } 
      });
      return;
    }
    
    lockedEntriesRef.current = [...state.wheelEntries];
    
    if (state.shuffleEntriesOnSpin) {
        let entriesToShuffle = [...state.wheelEntries];
        for (let i = entriesToShuffle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [entriesToShuffle[i], entriesToShuffle[j]] = [entriesToShuffle[j], entriesToShuffle[i]];
        }
        dispatch({ type: 'SET_ENTRIES', payload: entriesToShuffle });
    }

    applyRotation(rotationRef.current);
    if(canvasRef.current) void canvasRef.current.offsetWidth;
    
    const targetDuration = state.spinDuration;
    const initialVelocity = 1500;
    const minVelocity = 2;
    let calculatedFriction = 0.985;
    if (targetDuration > 0 && initialVelocity > minVelocity) {
        const base = minVelocity / initialVelocity;
        const exponent = 1 / (targetDuration * 60);
        const potentialFriction = Math.pow(base, exponent);
        if (!isNaN(potentialFriction) && potentialFriction > 0.9 && potentialFriction < 1) {
            calculatedFriction = potentialFriction;
        }
    }
    frictionRef.current = calculatedFriction;
    if (DEBUG) console.log(`[Spin Start] Duration: ${targetDuration}s, Friction: ${frictionRef.current.toFixed(5)}`);

    dispatch({ type: 'START_SPINNING' });
    isSpinningRef.current = true; 

    velocityRef.current = initialVelocity;
    lastFrameTimeRef.current = performance.now();
    
    if (fastSpinFrameRef.current) cancelAnimationFrame(fastSpinFrameRef.current);
    fastSpinFrameRef.current = requestAnimationFrame(fastSpinLoop);
  }, [state.wheelEntries, state.shuffleEntriesOnSpin, state.spinDuration, applyRotation, fastSpinLoop, dispatch]); // canvasRef, rotationRef, etc. refs are stable

  // Ref to hold the latest version of startSpinningProcess callback (MUST be AFTER startSpinningProcess is defined)
  const startSpinningProcessRef = useRef(null);
  useEffect(() => {
    startSpinningProcessRef.current = startSpinningProcess;
  }, [startSpinningProcess]);

  // --- Visibility Handling ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          dispatch({ type: 'SET_VISIBILITY', payload: entry.isIntersecting });
        });
      },
      { threshold: 0.1 }
    );
    
    const currentRef = wheelContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    
    // Initial check (slightly delayed)
    const timerId = setTimeout(() => {
       if (currentRef) {
          const rect = currentRef.getBoundingClientRect();
          const initiallyVisible = rect.top < window.innerHeight && rect.bottom >= 0;
          // Only dispatch if state needs changing from initial
          if (initialState.isVisible !== initiallyVisible) { 
             dispatch({ type: 'SET_VISIBILITY', payload: initiallyVisible });
          }
       }
    }, 100); 

    return () => {
      observer.disconnect();
      clearTimeout(timerId);
    };
  }, []); // Run only on mount

  // --- Event Handlers (using state/dispatch) ---
  const handleConnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
  }, []);

  const handleDisconnect = useCallback(() => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    // Consider resetting or pausing based on requirements
    // dispatch({ type: 'RESET_WHEEL' }); 
  }, []);

  const addEntries = useCallback((entriesToAdd) => {
      // Dispatch ADD_ENTRIES, the reducer handles the isSpinning check
      dispatch({ type: 'ADD_ENTRIES', payload: entriesToAdd }); 
  }, []);

  // Logic to add entries based on consumed items (gifts/likes)
  const addEntriesToWheelLogic = useCallback(
    (itemsConsumed, itemsPerEntrySetting, rawEvent) => {
      if (itemsConsumed <= 0 || itemsPerEntrySetting <= 0) return;
      const entriesCount = Math.floor(itemsConsumed / itemsPerEntrySetting);
      if (entriesCount <= 0) return;

      const user = rawEvent?.user ?? rawEvent;
      const newEntries = Array.from({ length: entriesCount }, () => ({
        name: getDisplayName(rawEvent),
        avatar: user?.profilePictureUrl || 'https://www.tiktok.com/favicon.ico',
        isSubscriber: !!user?.isSubscriber
      }));
      addEntries(newEntries);
    },
    [addEntries]
  );
  
  // Expose dispatch for error recovery
  useEffect(() => {
    // Expose dispatch function to the DOM for error recovery
    if (wheelContainerRef.current) {
      wheelContainerRef.current.__WHEEL_DISPATCH = dispatch;
    }
    
    // Error monitoring - detect performance issues in animation
    const monitorFrameRate = (event) => {
      if (event.detail && event.detail.fps < 30 && state.isSpinning) {
        console.warn('[WheelControls] Frame rate dropped below 30fps during spin animation', event.detail);
      }
    };
    
    window.addEventListener('wheel-framerate', monitorFrameRate);
    
    return () => {
      if (wheelContainerRef.current) {
        delete wheelContainerRef.current.__WHEEL_DISPATCH;
      }
      window.removeEventListener('wheel-framerate', monitorFrameRate);
    };
  }, [state.isSpinning]);
  
  // Error handling wrapper for event handlers
  const withErrorHandling = useCallback((fn) => {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        console.error(`[WheelControls] Error in event handler:`, error);
        // If we can recover, dispatch a safe action
        if (typeof dispatch === 'function') {
          // Don't dispatch during render phase
          setTimeout(() => {
            dispatch({ type: 'ERROR_OCCURRED', payload: { error: error.message } });
          }, 0);
        }
        return null; // Prevent cascading errors
      }
    };
  }, [dispatch]);

  // Fix gift handler to store remainder and divisor
  const handleGift = withErrorHandling(useCallback((data) => {
    if (!isCollecting || currentMode !== 'gifts') return;
    if (subscriberOnly && !data.isSubscriber) return;

    const userId = data.userId || data.uniqueId || data.nickname;
    const groupId = data.groupId;
    if (!userId || !groupId) return;

    const repeatCount = data.gift?.repeat_count ?? data.repeatCount ?? 1;
    const diamondCost = data.gift?.diamond_count ?? data.diamondCount ?? data.giftValue ?? 1;
    const diamondsTotal = repeatCount * diamondCost;
    const isRepeatEnd = data.repeatEnd === true || data.gift?.repeat_end === 1;
    const now = Date.now();

    let session = giftSessionsRef.current.get(groupId);
    if (!session) {
      session = { lastTotalDiamonds: 0, lastSeen: now };
      giftSessionsRef.current.set(groupId, session);
    }

    // Calculate positive delta only, using max to prevent negative values
    const diffDiamonds = Math.max(0, diamondsTotal - session.lastTotalDiamonds);

    if (diffDiamonds > 0) {
      // Get current accumulator with divisor
      const { remainder = 0, divisor = coinsPerEntry } = giftCoinAccumulatorRef.current.get(userId) || {};
      const newTotal = remainder + diffDiamonds;
      const entries = Math.floor(newTotal / divisor);
      
      if (entries > 0) {
        // Use the helper to create rich entry objects
        addEntriesToWheelLogic(entries * divisor, divisor, data);
        // Store remainder and current divisor
        giftCoinAccumulatorRef.current.set(userId, { 
          remainder: newTotal % divisor, 
          divisor 
        });
      } else {
        // Just update the remainder
        giftCoinAccumulatorRef.current.set(userId, { 
          remainder: newTotal, 
          divisor
        });
      }
    }

    // Always update session state
    session.lastTotalDiamonds = diamondsTotal;
    session.lastSeen = now;
  }, [currentMode, isCollecting, subscriberOnly, coinsPerEntry, addEntriesToWheelLogic]));

  // Fix like handler to store remainder and divisor
  const handleLike = withErrorHandling(useCallback((data) => {
    if (!isCollecting || currentMode !== 'likes') return;
    if (subscriberOnly && !data.isSubscriber) return;

    const userId = data.userId || data.uniqueId || data.nickname;
    const comboId = data.groupId || `like-${userId}`;
    const reportedTotal = data.totalLikeCount ?? data.likeCount ?? 0;
    if (!userId) return;

    const COMBO_TIMEOUT = 5000; 
    const now = Date.now();
    let sess = likeSessionsRef.current.get(comboId);
    if (!sess) sess = { lastTotal: 0, lastSeen: now };

    // Handle combo timeout by setting lastTotal to reportedTotal
    if (now - sess.lastSeen > COMBO_TIMEOUT) {
      sess.lastTotal = reportedTotal;
    }

    // Calculate positive delta only
    const delta = Math.max(0, reportedTotal - sess.lastTotal);

    if (delta > 0) {
      // Get current accumulator with divisor
      const { remainder = 0, divisor = likesPerEntry } = likeAccumulatorRef.current.get(userId) || {};
      const newTotal = remainder + delta;
      const entries = Math.floor(newTotal / divisor);
      
      if (entries > 0) {
        // Use the helper to create rich entry objects
        addEntriesToWheelLogic(entries * divisor, divisor, data);
        // Store remainder and current divisor
        likeAccumulatorRef.current.set(userId, { 
          remainder: newTotal % divisor, 
          divisor 
        });
      } else {
        // Just update the remainder
        likeAccumulatorRef.current.set(userId, { 
          remainder: newTotal, 
          divisor
        });
      }
    }

    // Update session state
    sess.lastTotal = reportedTotal;
    sess.lastSeen = now;
    likeSessionsRef.current.set(comboId, sess);

    if (data.repeatEnd === true) {
      likeSessionsRef.current.delete(comboId);
    }
  }, [currentMode, isCollecting, subscriberOnly, likesPerEntry, addEntriesToWheelLogic]));

  const handleChat = useCallback((data) => {
    if (currentMode !== 'chat' || !isCollecting) return;
    if (subscriberOnly && !data.isSubscriber) return;

    // Decide if this message should count
    const message = data.comment || '';
    const shouldCount =
        !state.useTriggerWord ||               // toggle off → every message counts
        state.triggerWord.trim() === '' ||     // blank trigger → every message
        new RegExp(`\\b${state.triggerWord}\\b`, 'i').test(message);
    if (!shouldCount) return;

    // Create a single entry directly
    const entry = {
      name: getDisplayName(data),
      avatar: data?.profilePictureUrl || 'https://www.tiktok.com/favicon.ico',
      isSubscriber: !!data?.isSubscriber
    };
    addEntries([entry]);
  }, [currentMode, isCollecting, subscriberOnly, addEntries, state.triggerWord, state.useTriggerWord]);

  const handleJoin = useCallback((data) => {
    if (currentMode !== 'joins' || !isCollecting) return;
    if (subscriberOnly && !data.isSubscriber) return;
    
    // Create a single entry directly
    const entry = {
      name: getDisplayName(data),
      avatar: data?.profilePictureUrl || 'https://www.tiktok.com/favicon.ico',
      isSubscriber: !!data?.isSubscriber
    };
    addEntries([entry]);
  }, [currentMode, isCollecting, subscriberOnly, addEntries]);

  // --- Setup Event Listeners using the Hook ---
  useWheelEvents({ 
      isCollecting,
      isSpinning,
      onGift: handleGift,
      onLike: handleLike,
      onChat: handleChat,
      onJoin: handleJoin,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      dispatch: dispatch
   });

  // --- Setup Wheel Drawing using the Hook ---
  useDrawWheel({
      canvasRef,
      entries: wheelEntries,
      wheelSizePercent: wheelSize,
      textSizePercent: textSize,
      showTextShadows: showTextShadows,
      isVisible: isVisible,
      isSpinning: isSpinning,
  });

  // --- Derived State for Winner UI ---
  const winner = useMemo(() => {
    return (winnerIndex >= 0 && winnerIndex < wheelEntries.length) 
           ? wheelEntries[winnerIndex] 
           : null;
  }, [winnerIndex, wheelEntries]);

  const winnerEntriesCount = useMemo(() => {
    if (!winner) return 0;
    return wheelEntries.filter(entry => entry.name === winner.name).length;
  }, [winner, wheelEntries]);

  // --- Render ---
  const actualWheelDisplaySize = useMemo(() => Math.max(200, Math.round(1600 * (wheelSize / 100))), [wheelSize]);

  // --- UI Action Handlers (Dispatching actions) ---
  const handleModeSelection = useCallback((mode) => {
    if (isSpinning || isAutoSpinActive) return;
    dispatch({ type: 'SET_MODE', payload: mode });
  }, [isSpinning, isAutoSpinActive, dispatch]);

  // Memoize the mode buttons to prevent unnecessary re-renders
  const modeButtons = useMemo(() => 
    ['gifts', 'likes', 'chat', 'joins'].map(mode => (
      <ModeButton 
        key={mode}
        className={currentMode === mode ? 'active' : ''}
        onClick={() => handleModeSelection(mode)}
        disabled={isSpinning || isAutoSpinActive}
      >
        {mode === 'gifts' ? '🎁' : mode === 'likes' ? '❤️' : mode === 'chat' ? '💬' : '👋'} 
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
        {mode === 'likes' && ` (per ${likesPerEntry})`}
        {mode === 'gifts' && ` (per ${coinsPerEntry})`}
      </ModeButton>
    )),
    [currentMode, isSpinning, isAutoSpinActive, likesPerEntry, coinsPerEntry, handleModeSelection]
  );

  // Start performance monitoring when spinning
  useEffect(() => {
    if (state.isSpinning) {
      // Start performance monitoring when the wheel is spinning
      const stopMonitoring = startPerformanceMonitoring({
        onWarning: (report) => {
          console.warn('[Wheel Performance] Detected low performance during spin:', report);
          // We could dispatch a performance warning action here if needed
          if (report.averageFps < 20) {
            // Critical performance issue - consider emergency measures
            dispatch({ 
              type: WHEEL_ACTIONS.PERFORMANCE_WARNING, 
              payload: { severity: 'critical', fps: report.averageFps } 
            });
          }
        }
      });
      
      return () => {
        stopMonitoring();
      };
    }
  }, [state.isSpinning, dispatch]);

  // --- Setup Auto-Spin Timer using the Hook ---
  useAutoSpinTimer({
    isAutoSpinActive,
    currentCountdown,
    autoSpinMinutes,
    autoSpinSeconds,
    isVisible,
    dispatch
  });

  // --- Effect to handle actions after auto-spin timer elapses ---
  useEffect(() => {
    if (triggerSpinAfterAuto) {
      startSpinningProcess();
      dispatch({ type: 'CLEAR_AUTO_SPIN_TRIGGERS' });
    } else if (triggerResetAfterAuto) {
      dispatch({ type: 'RESET_WHEEL' }); // Reset if no entries
      dispatch({ type: 'CLEAR_AUTO_SPIN_TRIGGERS' });
    }
  }, [triggerSpinAfterAuto, triggerResetAfterAuto, startSpinningProcess, dispatch]);

  // --- Cleanup animation frame on unmount --- 
  useEffect(() => { 
      return () => {
          if (fastSpinFrameRef.current) {
              cancelAnimationFrame(fastSpinFrameRef.current);
              fastSpinFrameRef.current = null;
              if (DEBUG) console.log("[WheelControls Unmount] Cancelled fast spin animation frame.");
          }
      }
  }, []);

  // --- Session cleanup effect ---
  useEffect(() => {
    const SESSION_TIMEOUT = 30000; // 30 seconds
    const SWEEP_INTERVAL = 30000; // Sweep every 30 seconds

    const sweepSessions = () => {
      const now = Date.now();
      
      // Sweep gift sessions
      for (const [groupId, session] of giftSessionsRef.current.entries()) {
        if (now - session.lastSeen > SESSION_TIMEOUT) {
          giftSessionsRef.current.delete(groupId);
        }
      }

      // Sweep like sessions
      for (const [comboId, session] of likeSessionsRef.current.entries()) {
        if (now - session.lastSeen > SESSION_TIMEOUT) {
          likeSessionsRef.current.delete(comboId);
        }
      }

      if (DEBUG) console.log('[Session Sweep] Completed');
    };

    const intervalId = setInterval(sweepSessions, SWEEP_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  // --- UI Action Handlers (Dispatching actions) ---
  const handleSpin = useCallback(() => {
    if (isSpinning || isAutoSpinActive || wheelEntries.length === 0) return;
    startSpinningProcess();
  }, [isSpinning, isAutoSpinActive, wheelEntries.length, startSpinningProcess]);

  const handleReset = useCallback(() => {
    if (isSpinning) return; // Allow reset even if auto-spin is active, only block if physically spinning
    
    // Clear accumulators
    giftCoinAccumulatorRef.current.clear();
    likeAccumulatorRef.current.clear();
    giftSessionsRef.current.clear();
    likeSessionsRef.current.clear();
    
    // Reset the wheel state
    dispatch({ type: WHEEL_ACTIONS.RESET_WHEEL });
  }, [isSpinning, dispatch]);

  const handleStartAutoSpin = useCallback(() => {
    if (isSpinning) return;
    dispatch({ type: WHEEL_ACTIONS.START_AUTO_SPIN });
  }, [isSpinning, dispatch]);

  const handleStopAutoSpin = useCallback(() => {
    dispatch({ type: WHEEL_ACTIONS.STOP_AUTO_SPIN });
  }, [dispatch]);

  const handleStartCollecting = useCallback(() => {
    dispatch({ type: WHEEL_ACTIONS.START_COLLECTING });
  }, [dispatch]);

  const handleRemoveWinner = useCallback(() => {
    if (winnerIndex >= 0 && winnerIndex < wheelEntries.length) {
      const newEntries = [...wheelEntries];
      newEntries.splice(winnerIndex, 1);
      dispatch({ type: WHEEL_ACTIONS.SET_ENTRIES, payload: newEntries });
      dispatch({ type: WHEEL_ACTIONS.SET_WINNER, payload: -1 }); 
      
      setTimeout(() => {
        if (newEntries.length > 0) {
          startSpinningProcessRef.current(); // Call the latest version via ref
        } else {
          dispatch({ type: WHEEL_ACTIONS.RESET_WHEEL }); 
        }
      }, 300);
    }
  }, [winnerIndex, wheelEntries, dispatch]);

  const handleRemoveAllSameNames = useCallback(() => {
     if (winnerIndex >= 0 && winnerIndex < wheelEntries.length) {
      const winnerName = wheelEntries[winnerIndex].name;
      const newEntries = wheelEntries.filter(entry => entry.name !== winnerName);
      dispatch({ type: WHEEL_ACTIONS.SET_ENTRIES, payload: newEntries });
      dispatch({ type: WHEEL_ACTIONS.SET_WINNER, payload: -1 });

      setTimeout(() => {
        if (newEntries.length > 0) {
          startSpinningProcessRef.current(); // Call the latest version via ref
        } else {
          dispatch({ type: WHEEL_ACTIONS.RESET_WHEEL });
        }
      }, 300);
    }
  }, [winnerIndex, wheelEntries, dispatch]);

  const handleTestEntriesClick = useCallback(() => {
    const newEntries = Array.from({ length: 10 }, (_, i) => ({
      name: `Test User ${Math.floor(Math.random() * 1000)}`,
      avatar: 'https://www.tiktok.com/favicon.ico',
      isSubscriber: Math.random() > 0.5
    }));
    addEntries(newEntries); // Use the memoized addEntries action dispatcher
  }, [addEntries]);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Clean up animation frames
      if (fastSpinFrameRef.current) {
        cancelAnimationFrame(fastSpinFrameRef.current);
      }
      
      // Clean up intervals
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      
      // Clean up refs
      giftCoinAccumulatorRef.current.clear();
      likeAccumulatorRef.current.clear();
      giftSessionsRef.current.clear();
      likeSessionsRef.current.clear();
      lockedEntriesRef.current = null;
    };
  }, []);

  // --- Render ---
  return (
    <>
      <StatusText>{statusText}</StatusText>
      
      <ModeSelector>
        {modeButtons}
      </ModeSelector>

      {/* Main content area with Info Panel and Wheel Display */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative', justifyContent: 'center', flexWrap: 'wrap' }}> 
        <WheelInfoPanel>
          <WheelStatusDisplay>{wheelUiStatus}</WheelStatusDisplay>
          <WheelEntryTypeDisplay>
            {isSpinning ? "DO NOT ENTER" : wheelEntryCostText}
          </WheelEntryTypeDisplay>
          <CountdownDisplay>
            {isAutoSpinActive && currentCountdown !== null 
              ? formatTime(currentCountdown) 
              : formatTime(autoSpinMinutes * 60 + autoSpinSeconds)}
          </CountdownDisplay>
        </WheelInfoPanel>

        <WheelDisplayContainer ref={wheelContainerRef} data-wheel-container>
          <WheelWrapper size={actualWheelDisplaySize}>
             {/* Apply rotation directly via style */}
            <WheelCanvasElement 
                ref={canvasRef} 
                width={actualWheelDisplaySize} 
                height={actualWheelDisplaySize} 
                style={{ transform: `rotate(${rotationRef.current}deg)` }} 
            />
            <WheelPointer ref={pointerRef} />
            <WheelCenter centerSizePercent={centerSize} entryCount={wheelEntries.length} />
          </WheelWrapper>
          <WinnerDisplay isVisible={winner !== null}>
            {winner && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0 1rem' }}>
                        <img src={winner.avatar || 'https://www.tiktok.com/favicon.ico'} 
                            alt={winner.name} 
                            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.2)'}}/>
                    </div>
                    <div>🎉 Winner: {winner.name} 🎉</div>
                    <div style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '0.5rem' }}>
                        {winnerEntriesCount === 1 ? "(1 entry)" : `(${winnerEntriesCount} entries)`}
                    </div>
                </>
            )}
          </WinnerDisplay>
        </WheelDisplayContainer>
      </div>

      {/* Winner Action Buttons */}
      <WinnerActions isVisible={winner !== null}>
        <Button onClick={handleRemoveWinner} disabled={isSpinning}>
          🔄 Remove Winner & Respin
        </Button>
        <Button onClick={handleRemoveAllSameNames} disabled={isSpinning}>
          🔄 Remove All ({winner?.name}) & Respin
        </Button>
      </WinnerActions>
      
      {/* Main Control Buttons */}
      <Controls>
        <Button 
          variant="collecting"
          onClick={handleStartCollecting}
          disabled={isCollecting || isSpinning || isAutoSpinActive || !isConnected}
          title={!isConnected ? "Connect to TikTok Live first" : ""}
        >
          ▶️ Start Collecting
        </Button>
        <Button
          variant="secondary"
          onClick={handleStartAutoSpin}
          disabled={isSpinning || isAutoSpinActive || !currentMode || !isConnected}
          title={!isConnected ? "Connect to TikTok Live first" : !currentMode ? "Select a mode first" : ""}
        >
          ⏱️ Start Auto Spin
        </Button>
        <Button 
          variant="spin"
          onClick={handleSpin}
          disabled={wheelEntries.length === 0 || isSpinning || isAutoSpinActive}
        >
          🎡 Spin!
        </Button>
        <Button 
          variant="reset"
          onClick={handleReset}
          disabled={isSpinning} 
        >
          🔄 Reset
        </Button>
        
        {/* Settings Toggle Area */} 
        <div style={{ display: 'flex', marginLeft: 'auto', gap: '0.5rem', alignItems: 'center' }}>
          <SubscriberToggle>
            <input 
              type="checkbox" 
              id="subscriberOnlyToggleControls"
              checked={subscriberOnly}
              onChange={(e) => dispatch({ type: 'UPDATE_SETTING', payload: { setting: 'subscriberOnly', value: e.target.checked }})}
              disabled={isCollecting || isSpinning || isAutoSpinActive}
            />
            <label htmlFor="subscriberOnlyToggleControls">Subscribers only</label>
          </SubscriberToggle>
          
          <SettingsButtonContainer onClick={() => dispatch({ type: 'TOGGLE_SETTINGS_PANEL' })} >
            <Settings size={16} />
            <span>Wheel Settings</span>
          </SettingsButtonContainer>
        </div>
      </Controls>
      
      {/* Child Components */} 
      <SettingsPanel
        isVisible={settingsPanelVisible}
        settings={state} // Pass whole state or specific settings needed
        dispatch={dispatch}
        onClose={() => dispatch({ type: 'TOGGLE_SETTINGS_PANEL' })}
        isSpinning={isSpinning}
      />

      <EntryListDisplay 
        isVisible={showEntryList} 
        entries={wheelEntries} 
        onClose={() => dispatch({ type: 'TOGGLE_ENTRY_LIST' })}
      />

      {DEBUG && <TestEntriesButton onClick={handleTestEntriesClick} />}
    </>
  );
};

export default WheelControls; 