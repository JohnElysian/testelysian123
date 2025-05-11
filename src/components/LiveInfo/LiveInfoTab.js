// @ts-nocheck
// TODO: The user should verify and potentially correct the @ts-nocheck if this is a TypeScript file.
// It was added because of the large number of changes and potential type inference issues during refactoring.
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MessageCircle, Gift, Settings, DollarSign } from 'lucide-react';

// --- Constants ---
const MAX_CHAT_MESSAGES = 200; // Max number of chat items to keep in state
const MAX_DISPLAYED_GIFTS = 100; // Max number of gift items to keep in state
const GIFT_SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes for gift session pruning
const PROCESSED_EVENTS_CLEAR_INTERVAL_MS = 60 * 1000; // 1 minute for clearing recent event IDs

// Initialize counters and notification settings
let chatCount = 0;
// let giftCount = 0; // Will be derived from displayedGifts.length
let showJoinNotifications = localStorage.getItem('showJoinNotifications') === 'true' || false;
let showGiftNotifications = localStorage.getItem('showGiftNotifications') !== 'false'; // Default to true
let minGiftAmount = parseInt(localStorage.getItem('minGiftAmount') || '0', 10);

// Create a set to track processed event IDs
const processedEvents = new Set();

// Clear set occasionally to prevent memory issues
setInterval(() => {
  processedEvents.clear();
}, 60000); // Clear every minute

// Track if events have been set up to avoid duplicate setup
let eventsSetup = false;

// Store event handlers for removal during cleanup
const eventHandlers = {
  chat: null,
  gift: null,
  join: null,
  // Removed chatWindow, giftWindow, joinWindow as they are not used directly by LiveInfoTab component event handlers
};

const StreamPanelsWrapper = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 2rem;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  background: transparent;
  width: 100%;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const StreamPanel = styled.div`
  display: flex;
  flex-direction: column;
  height: 500px;
  overflow: hidden;
  border-radius: var(--radius);
  background: linear-gradient(
    to bottom right,
    rgba(23, 31, 50, 0.8),
    rgba(15, 23, 42, 0.8)
  );
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.36), inset 0 0 0 1px rgba(139, 92, 246, 0.1);
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const StreamHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: rgba(31, 41, 55, 0.4);
  width: 100%;
  position: relative;
  z-index: 2;
  
  h3 {
    font-size: 1.1rem;
    color: var(--accent);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .counter {
    color: var(--text-secondary);
    font-size: 0.9rem;
    pointer-events: none;
  }
  
  .header-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 6px;
    padding: 3px 8px;
    background: rgba(0, 0, 0, 0.2);
    margin-right: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    
    &:hover {
      background: rgba(33, 178, 194, 0.1);
    }
  }
  
  .join-toggle-switch { 
    position: relative;
    width: 36px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    
    &.active {
      background: rgba(33, 178, 194, 0.6);
      border-color: rgba(33, 178, 194, 0.8);
    }
    
    &::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: white;
      transition: transform 0.3s ease;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
    
    &.active::after {
      transform: translateX(16px);
    }
    
    &:hover {
      border-color: rgba(33, 178, 194, 0.5);
    }
  }
  
  .join-label {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-secondary);
    user-select: none;
  }
`;

const StreamContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(17, 24, 39, 0.8);
  scrollbar-width: thin;
  scrollbar-color: var(--accent) transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(139, 92, 246, 0.3);
    border-radius: 20px;
  }
`;

// Settings panel components
const SettingsPanel = styled.div`
  position: absolute;
  top: 55px;
  right: 10px;
  width: 260px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: var(--radius-sm);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  z-index: 100;
  padding: 1rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
  transform-origin: top right;
  animation: fadeInScale 0.2s ease-out;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 10px;
    width: 12px;
    height: 12px;
    background: rgba(15, 23, 42, 0.95);
    transform: rotate(45deg);
    border-left: 1px solid rgba(139, 92, 246, 0.2);
    border-top: 1px solid rgba(139, 92, 246, 0.2);
  }
  
  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const SettingsTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: var(--accent);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingsLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text);
  user-select: none;
  cursor: pointer;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 36px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &.active {
    background: var(--accent-dark);
    border-color: var(--accent);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    transition: transform 0.3s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
  
  &.active::after {
    transform: translateX(16px);
  }
  
  &:hover {
    border-color: var(--accent-light);
  }
`;

const AmountInput = styled.input`
  width: 70px;
  padding: 0.35rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-xs);
  color: var(--text);
  font-size: 0.85rem;
  text-align: right;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const SettingsButton = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(139, 92, 246, 0.1);
    color: var(--accent);
  }
  
  &.active {
    color: var(--accent);
    background: rgba(139, 92, 246, 0.15);
  }
`;

function setupNotificationStyles() {
  if (document.getElementById('notification-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'notification-styles';
    styleEl.textContent = `
      .notification-item {
        background: rgba(255, 255, 255, 0.05); margin-bottom: 0.75rem; padding: 0.75rem 1rem;
        border-radius: 8px; display: flex; align-items: flex-start; gap: 0.75rem;
        animation: fadeIn 0.3s ease-out; border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.2s ease; position: relative; overflow: hidden;
      }
      .notification-item:hover {
        transform: translateY(-2px); background: rgba(255, 255, 255, 0.08);
        border-color: rgba(139, 92, 246, 0.3);
      }
      .notification-item.join { background: rgba(33, 178, 194, 0.1); border-color: rgba(33, 178, 194, 0.2); }
      .notification-item.gift { background: rgba(139, 92, 246, 0.1); border-color: rgba(139, 92, 246, 0.2); }
      .giftcontainer .notification-item.gift.gift-value-100 { animation: pulseBorder100 2.5s infinite linear; }
    .giftcontainer .notification-item.gift.gift-value-500 {
        background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.3);
      }
      .giftcontainer .notification-item.gift.gift-value-500 .gift-icon { border-color: #22c55e; }
    .giftcontainer .notification-item.gift.gift-rare {
        border-color: rgba(63, 131, 248, 0.3); box-shadow: 0 0 15px rgba(63, 131, 248, 0.2);
        animation: pulseBackgroundRare 2.0s infinite ease-in-out; transform: translateY(-2px) scale(1.02);
      }
    .giftcontainer .notification-item.gift.gift-rare .gift-icon {
        border-color: #3f83f8; animation: scaleIconRare 2.2s infinite alternate ease-in-out;
    }
    .giftcontainer .notification-item.gift.gift-epic {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.25)); 
        border-color: rgba(239, 68, 68, 0.6); box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
        animation: pulseBackgroundEpic 1.5s infinite ease-in-out; transform: translateY(-3px) scale(1.03);
      }
    .giftcontainer .notification-item.gift.gift-epic .gift-icon {
        border-color: #ef4444; animation: rotateIconEpic 8s infinite linear;
    }
    .giftcontainer .notification-item.gift.gift-legendary {
        border-color: rgba(234, 179, 8, 0.5); box-shadow: 0 0 25px rgba(234, 179, 8, 0.4);
        transform: translateY(-4px) scale(1.04); animation: pulseBackgroundLegendary 2s infinite ease-in-out;
      }
    .giftcontainer .notification-item.gift.gift-legendary .gift-icon {
        border: 2px solid #f97316; box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
        animation: pulseicon 2s infinite alternate;
      }
      .giftcontainer .notification-item.gift.gift-combo-large { border-width: 2px; }
      .giftcontainer .notification-item.gift.gift-combo-large:not(.gift-value-500):not(.gift-rare):not(.gift-epic):not(.gift-legendary) {
          animation: pulseBackground 2.5s infinite ease-in-out;
      }
    .gift-icon {
        width: 44px; height: 44px; border-radius: 8px; overflow: hidden; flex-shrink: 0;
        background: #181f2e; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        margin-left: auto; display: flex; justify-content: center; align-items: center;
      }
      .gift-icon img { width: 100%; height: 100%; object-fit: contain; }
      .profile-picture {
        width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0;
        border: 2px solid var(--accent); background: #181f2e; position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      }
    .profile-picture.join { border-color: #21b2c2; }
      .profile-picture.gift { border-color: #a855f7; }
    .profile-picture img { width: 100%; height: 100%; object-fit: cover; }
    .notification-content { flex: 1; min-width: 0; }
    .timestamp-badge { position: absolute; top: 0.5rem; right: 0.75rem; font-size: 0.7rem; color: var(--text-secondary); opacity: 0.7; }
    .username-link { color: var(--accent); font-weight: 600; text-decoration: none; transition: color 0.2s ease; }
    .username-link:hover { color: var(--accent-light); text-decoration: underline; }
    .username-link.join { color: #21b2c2; }
      .username-link.gift { color: #a855f7; }
    .message-text { margin-top: 0.25rem; word-break: break-word; color: var(--text); font-size: 0.95rem; line-height: 1.4; }
      .join-tag { display: inline-flex; align-items: center; gap: 0.35rem; background-color: rgba(33,178,194,0.15); color: #21b2c2; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 500; margin-left: 0.5rem; vertical-align: middle; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulseicon { 0% { transform: scale(1); border-color: #eab308; } 100% { transform: scale(1.1); border-color: #f97316; } }
      @keyframes pulseBorder100 { 0% { border-color: rgba(56,189,248,0.3); } 50% { border-color: rgba(56,189,248,0.6); } 100% { border-color: rgba(56,189,248,0.3); } }
      @keyframes pulseBackgroundRare { 0% { background-color: rgba(63,131,248,0.15); } 50% { background-color: rgba(63,131,248,0.25); } 100% { background-color: rgba(63,131,248,0.15); } }
      @keyframes scaleIconRare { from { transform: scale(1); } to { transform: scale(1.08); } }
      @keyframes pulseBackgroundEpic { 0% { background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.25)); } 50% { background: linear-gradient(135deg, rgba(239,68,68,0.3), rgba(220,38,38,0.4)); } 100% { background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.25)); } }
      @keyframes rotateIconEpic { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulseBackgroundLegendary { 0% { background: linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.15)); } 50% { background: linear-gradient(135deg, rgba(234,179,8,0.25), rgba(249,115,22,0.25)); } 100% { background: linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.15)); } }
      @keyframes pulseBackground { 0% { background-color: rgba(139,92,246,0.1); } 50% { background-color: rgba(139,92,246,0.2); } 100% { background-color: rgba(139,92,246,0.1); } }
    `;
    document.head.appendChild(styleEl);
}

const getInitialState = (key, defaultValue, isBoolean = false) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return defaultValue;
  if (isBoolean) return storedValue === 'true';
  if (typeof defaultValue === 'number') return parseInt(storedValue, 10) || defaultValue;
  return storedValue;
};

const LiveInfoTab = () => {
  const chatContainerRef = useRef(null);
  const giftContainerRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [displayedGifts, setDisplayedGifts] = useState([]);
  const [showSettings, setShowSettings] = useState(false);

  const [showJoinNotifications, setShowJoinNotifications] = useState(() => getInitialState('showJoinNotifications', false, true));
  const [showGiftNotifications, setShowGiftNotifications] = useState(() => getInitialState('showGiftNotifications', true, true));
  const [minGiftAmount, setMinGiftAmount] = useState(() => getInitialState('minGiftAmount', 0));
  const [showDisplayNames, setShowDisplayNames] = useState(() => getInitialState('liveInfoShowDisplayNames', false, true));
  const [autoScrollGifts, setAutoScrollGifts] = useState(() => getInitialState('liveInfoAutoScrollGifts', true, true));
  const [autoScrollChat, setAutoScrollChat] = useState(true); 

  const liveInfoGiftSessionsRef = useRef(new Map());
  const processedEventsRef = useRef(new Set()); // For short-term deduplication of raw events

  // --- LocalStorage Persistence for Settings ---
  useEffect(() => { localStorage.setItem('showJoinNotifications', showJoinNotifications.toString()); }, [showJoinNotifications]);
  useEffect(() => { localStorage.setItem('showGiftNotifications', showGiftNotifications.toString()); }, [showGiftNotifications]);
  useEffect(() => { localStorage.setItem('minGiftAmount', minGiftAmount.toString()); }, [minGiftAmount]);
  useEffect(() => { localStorage.setItem('liveInfoShowDisplayNames', showDisplayNames.toString()); }, [showDisplayNames]);
  useEffect(() => { localStorage.setItem('liveInfoAutoScrollGifts', autoScrollGifts.toString()); }, [autoScrollGifts]);

  // --- Auto-scroll ---
  const scrollToBottom = useCallback((containerRef, shouldScroll) => {
    if (shouldScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => { scrollToBottom(chatContainerRef, autoScrollChat); }, [chatMessages, autoScrollChat, scrollToBottom]);
  useEffect(() => { scrollToBottom(giftContainerRef, autoScrollGifts); }, [displayedGifts, autoScrollGifts, scrollToBottom]);

  // --- Periodic Cleanup: Processed Events and Stale Gift Sessions ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Clear general processed event IDs (short-term deduplication)
      processedEventsRef.current.clear();
      // console.log('[LiveInfoTab] Cleared processedEventsRef (short-term event deduplication).');
      
      // Prune stale gift sessions
      const now = Date.now();
      const sessions = liveInfoGiftSessionsRef.current;
      let prunedGiftSession = false;
      sessions.forEach((session, key) => {
        if (now - session.lastUpdatedAt > GIFT_SESSION_TIMEOUT_MS) {
          sessions.delete(key);
          console.log(`[LiveInfoTab] Pruned stale gift session: ${key} (older than ${GIFT_SESSION_TIMEOUT_MS / 1000 / 60} mins)`);
          prunedGiftSession = true;
        }
      });
      
      // If gift sessions were pruned, update displayedGifts to remove any that are no longer in active sessions
      if (prunedGiftSession) {
        setDisplayedGifts(prev => prev.filter(dg => sessions.has(dg.comboId)).slice(-MAX_DISPLAYED_GIFTS));
      }

    }, PROCESSED_EVENTS_CLEAR_INTERVAL_MS); // This interval handles both clearings (adjust frequency as needed)
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array, runs once on mount and cleans up on unmount

  // --- Event Handlers ---
  const handleIncomingChat = useCallback((data, isJoin = false) => {
    // Unique event ID for short-term deduplication
    const eventId = `chat-${data.userId || data.uniqueId}-${data.createTime || data.timestamp || Date.now()}-${data.comment || (isJoin ? 'join' : '')}`;
    if (processedEventsRef.current.has(eventId)) {
      // console.log('[LiveInfoTab] Skipping duplicate chat/join event:', eventId);
      return;
    }
    processedEventsRef.current.add(eventId);

    if (isJoin && !showJoinNotifications) return;

    const newChatItem = {
      id: eventId, // Use eventId as React key
      isJoin,
      profilePictureUrl: data.profilePictureUrl || 'https://www.tiktok.com/favicon.ico',
      uniqueId: data.uniqueId || 'User',
      nickname: data.nickname || data.uniqueId || 'User',
      comment: data.comment,
      timestamp: Date.now(), // For display or sorting if needed
    };

    setChatMessages(prevMessages => [...prevMessages, newChatItem].slice(-MAX_CHAT_MESSAGES));
  }, [showJoinNotifications]); // Dependency: showJoinNotifications to gate join messages

  const handleIncomingGift = useCallback((data) => {
    if (!showGiftNotifications) return;
    
    const diamondCount = data.diamondCount || 0; 
    const eventRepeatCount = data.repeatCount || 1; 
    const isRepeatEnd = data.repeatEnd === true || data.gift?.repeat_end === 1;

    const userIdForTracking = data.userId || data.uniqueId; 
    const giftRawId = data.giftId || data.gift_id;
    
    // Robust comboId and displayId logic
    let comboId = data.groupId; // Prefer server-provided groupId for combos
    let displayId;

    if (comboId) { // This is part of a TikTok native combo
        displayId = `gift-combo-${comboId}`;
    } else { // Single gift or system without groupId - treat as a unique event
        // Create a unique ID for this specific event if no groupId
        comboId = `single-${userIdForTracking}-${giftRawId}-${data.timestamp || Date.now()}-${Math.random().toString(36).substring(2, 7)}`; 
        displayId = comboId; 
    }
    
    // Short-term deduplication for raw gift events, especially non-combo ones
    const uniqueGiftEventSignature = `gift-event-${userIdForTracking}-${giftRawId}-${data.timestamp || Date.now()}-${eventRepeatCount}-${diamondCount}`;
    if (processedEventsRef.current.has(uniqueGiftEventSignature)) { 
        // console.log('[LiveInfoTab] Skipping duplicate raw gift event:', uniqueGiftEventSignature);
        return;
    }
    processedEventsRef.current.add(uniqueGiftEventSignature);


    const currentComboTotalValue = diamondCount * eventRepeatCount;
    const now = Date.now();
    let session = liveInfoGiftSessionsRef.current.get(comboId);

    if (!session) { 
      // This is a new gift (or start of a combo if comboId is from data.groupId)
      session = {
        displayId: displayId, 
        comboId: comboId, // The logical ID for the combo/gift
        user: { userId: userIdForTracking, uniqueId: data.uniqueId || 'User', nickname: data.nickname || data.uniqueId, profilePictureUrl: data.profilePictureUrl || 'https://www.tiktok.com/favicon.ico' },
        gift: { giftId: giftRawId, giftName: data.giftName || 'Gift', giftPictureUrl: data.giftPictureUrl || '', diamondCount: diamondCount },
        currentTotalValue: currentComboTotalValue,
        currentRepeatCount: eventRepeatCount,
        createdAt: now,
        lastUpdatedAt: now,
      };
    } else { // Existing session (likely an update to an ongoing combo if comboId was from data.groupId)
      // Only accumulate if it's a true combo (has groupId) and the current event's comboId matches the session's
      if (data.groupId && data.groupId === session.comboId) {
          session.currentTotalValue = currentComboTotalValue; // TikTok usually sends total for combo
          session.currentRepeatCount = eventRepeatCount; // And current repeat for combo
      } else if (!data.groupId) { // Non-combo gift updating its own "session" which is just itself
      session.currentTotalValue = currentComboTotalValue;
      session.currentRepeatCount = eventRepeatCount;
      }
      // Always update user details and timestamp
      session.user.uniqueId = data.uniqueId || session.user.uniqueId; 
      session.user.nickname = data.nickname || session.user.nickname;
      session.user.profilePictureUrl = data.profilePictureUrl || session.user.profilePictureUrl;
      session.lastUpdatedAt = now;
    }
    liveInfoGiftSessionsRef.current.set(comboId, { ...session });

    setDisplayedGifts(prevGifts => {
      const updatedGifts = [...prevGifts];
      const existingDisplayIndex = updatedGifts.findIndex(g => g.displayId === displayId);

      if (session.currentTotalValue >= minGiftAmount) {
        const giftToDisplay = { ...session }; 
        if (existingDisplayIndex !== -1) {
          updatedGifts[existingDisplayIndex] = giftToDisplay;
        } else {
          updatedGifts.push(giftToDisplay);
        }
        return updatedGifts.slice(-MAX_DISPLAYED_GIFTS); 
      } else { 
        if (existingDisplayIndex !== -1) { 
          return updatedGifts.filter(g => g.displayId !== displayId).slice(-MAX_DISPLAYED_GIFTS);
        }
        // Not displayed and still below threshold, no change to displayedGifts needed for this item
        return updatedGifts; // Return potentially sliced if other items were added/removed or list was already at max
      }
    });

    if (isRepeatEnd && data.groupId) { // Only delete session if it was a native combo (had groupId) and it ended
      liveInfoGiftSessionsRef.current.delete(comboId);
      console.log(`[LiveInfoTab] Gift session ended and removed for comboId: ${comboId}`);
    }
  }, [showGiftNotifications, minGiftAmount]); // Dependencies: These ensure the callback is fresh when settings change.

  // --- Setup Event Listeners for TikTok Connection ---
  useEffect(() => {
    // Guard against no connection object
    if (!window.tiktokConnection) {
      console.warn('[LiveInfoTab] window.tiktokConnection not found. Listeners not attached.');
      return;
    }

    console.log('[LiveInfoTab] Setting up event listeners.');
    // Ensure handlers are stable or correctly depend on state/props
    const chatHandler = (data) => handleIncomingChat(data, false);
    const memberHandler = (data) => handleIncomingChat(data, true); // Reuses chat handler with isJoin=true
    const giftHandler = (data) => handleIncomingGift(data);

    try {
      window.tiktokConnection.on('chat', chatHandler);
      window.tiktokConnection.on('gift', giftHandler);
      window.tiktokConnection.on('member', memberHandler); // TikTok uses 'member' for joins
      console.log('[LiveInfoTab] Event listeners added.');
    } catch (e) {
      console.error('[LiveInfoTab] Error adding listeners:', e);
    }

    // Cleanup function: Essential to prevent leaks and double registrations
    return () => {
      console.log('[LiveInfoTab] Cleaning up event listeners.');
      if (window.tiktokConnection) {
        try {
          window.tiktokConnection.off('chat', chatHandler);
          window.tiktokConnection.off('gift', giftHandler);
          window.tiktokConnection.off('member', memberHandler);
          console.log('[LiveInfoTab] Event listeners removed.');
    } catch (e) {
          console.error('[LiveInfoTab] Error removing listeners:', e);
        }
      }
    };
  }, [handleIncomingChat, handleIncomingGift]); // Dependencies: if these handlers change, re-subscribe

  // --- Initial Style Setup ---
  useEffect(() => {
    setupNotificationStyles(); // Call style setup once on mount
  }, []);

  // --- Test Gift Functionality ---
  const sendTestGift = useCallback((coinValue) => {
    const mockData = {
      userId: `test_user_${Date.now()}`, 
      uniqueId: `Tester${coinValue}`,
      nickname: 'Test Display Name',
      profilePictureUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/8ab96799066341795a979654c90c5934~tplv-obj.png',
      giftId: 9000 + coinValue, // Test Gift ID
      giftName: `Test ${coinValue} Coin Gift`,
      giftPictureUrl: 'https://p19-webcast.tiktokcdn.com/img/maliva/webcast-va/377785ca8c04ebda8f3c5844eed6161e~tplv-obj.image',
      diamondCount: coinValue,
      repeatCount: 1,
      // To test combos, you'd send multiple events with the same groupId
      // groupId: `test-combo-${coinValue}`, 
      groupId: null, // For single test gift
      repeatEnd: true, // For single test gift, it ends immediately
      timestamp: Date.now(),
    };
    handleIncomingGift(mockData);
  }, [handleIncomingGift]);


  // --- Render ---
  return (
    <StreamPanelsWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Chat Panel */}
      <StreamPanel>
        <StreamHeader>
          <h3><MessageCircle size={20} /> Live Chat</h3>
          <div className="header-controls">
            <div className="toggle-wrapper" onClick={() => setShowJoinNotifications(prev => !prev)}>
              <span className="join-label">Show Joins</span>
              <div className={`join-toggle-switch ${showJoinNotifications ? 'active' : ''}`}></div>
            </div>
            {/* Auto-scroll toggle for chat */}
            <div className="toggle-wrapper" onClick={() => setAutoScrollChat(prev => !prev)} title="Toggle Chat Auto-Scroll">
              <span className="join-label">Scroll</span>
              <div className={`join-toggle-switch ${autoScrollChat ? 'active' : ''}`}></div>
            </div>
            <span className="counter">{chatMessages.length}</span>
          </div>
        </StreamHeader>
        <StreamContent className="chatcontainer" ref={chatContainerRef}>
          {chatMessages.map(msg => (
            <div key={msg.id} className={`notification-item ${msg.isJoin ? 'join' : 'chat'}`}>
              <img 
                src={msg.profilePictureUrl} 
                alt={msg.uniqueId} 
                className={`profile-picture ${msg.isJoin ? 'join' : 'chat'}`}
              />
              <div className="notification-content">
                <a 
                  href={`https://www.tiktok.com/@${msg.uniqueId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`username-link ${msg.isJoin ? 'join' : 'chat'}`}
                >
                  {showDisplayNames ? msg.nickname : msg.uniqueId}
                </a>
                {msg.isJoin ? (
                  <span className="join-tag">joined</span>
                ) : (
                  <div className="message-text">{msg.comment}</div>
                )}
              </div>
              {/* <span className="timestamp-badge">{new Date(msg.timestamp).toLocaleTimeString()}</span> */}
            </div>
          ))}
        </StreamContent>
      </StreamPanel>
      
      {/* Gift Panel */}
      <StreamPanel>
        <StreamHeader>
          <h3><Gift size={20} /> Gifts</h3>
          <div className="header-controls">
            <SettingsButton
              title="Gift settings"
              className={showSettings ? 'active' : ''}
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={18} />
            </SettingsButton>
            <span className="counter">{displayedGifts.length}</span>
          </div>
          
          {showSettings && (
            <SettingsPanel>
              <SettingsTitle><Settings size={16} /> Gift Settings</SettingsTitle>
              <SettingsRow>
                <SettingsLabel htmlFor="giftToggleSwitch">Show gift notifications</SettingsLabel>
                <ToggleSwitch 
                  id="giftToggleSwitch"
                  className={showGiftNotifications ? 'active' : ''}
                  onClick={() => setShowGiftNotifications(prev => !prev)}
                />
              </SettingsRow>
              <SettingsRow>
                <SettingsLabel htmlFor="minGiftAmountInput">Minimum gift value</SettingsLabel>
                <AmountInput
                  id="minGiftAmountInput"
                  type="number"
                  min="0"
                  value={minGiftAmount} // Controlled component
                  onChange={(e) => setMinGiftAmount(Math.max(0, parseInt(e.target.value,10) || 0))}
                />
              </SettingsRow>
              <SettingsRow>
                <SettingsLabel htmlFor="displayNameToggle">Show display names</SettingsLabel>
                <ToggleSwitch 
                  id="displayNameToggle" 
                  className={showDisplayNames ? 'active' : ''}
                  onClick={() => setShowDisplayNames(prev => !prev)}
                />
              </SettingsRow>
              <SettingsRow>
                 <SettingsLabel htmlFor="autoScrollGiftsToggle">Auto-scroll gifts</SettingsLabel>
                <ToggleSwitch 
                  id="autoScrollGiftsToggle"
                  className={autoScrollGifts ? 'active' : ''}
                  onClick={() => setAutoScrollGifts(prev => !prev)}
                />
              </SettingsRow>
              {/* Test Buttons Section */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h5 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Test Gifts:</h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[1, 10, 100, 500, 1000, 5000, 10000].map(val => (
                    <button key={val} onClick={() => sendTestGift(val)} style={{ padding: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Test {val} Coins
                    </button>
                  ))}
                </div>
              </div>
            </SettingsPanel>
          )}
        </StreamHeader>
        <StreamContent className="giftcontainer" ref={giftContainerRef}>
          {displayedGifts.map(gift => {
            // Build dynamic class list
            let giftItemClasses = ['notification-item', 'gift'];

            // Value-based classes (apply highest applicable)
            if (gift.currentTotalValue >= 10000) {
              giftItemClasses.push('gift-legendary');
            } else if (gift.currentTotalValue >= 5000) {
              giftItemClasses.push('gift-epic');
            } else if (gift.currentTotalValue >= 1000) {
              giftItemClasses.push('gift-rare');
            } else if (gift.currentTotalValue >= 500) {
              giftItemClasses.push('gift-value-500'); 
            } else if (gift.currentTotalValue >= 100) {
              giftItemClasses.push('gift-value-100'); 
            }

            // Combo-based class (independent)
            if (gift.currentRepeatCount > 10) { // Assuming this is for large combos
              giftItemClasses.push('gift-combo-large'); 
            }

            const finalClassName = giftItemClasses.join(' ');

            // Use gift.displayId (derived from comboId or unique event ID) as the key
            return (
              <div key={gift.displayId} className={finalClassName}>
                <img 
                  src={gift.user.profilePictureUrl} 
                  alt={gift.user.uniqueId} 
                  className="profile-picture gift"
                />
                <div className="notification-content">
                  <a 
                    href={`https://www.tiktok.com/@${gift.user.uniqueId}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="username-link gift"
                  >
                    {showDisplayNames ? gift.user.nickname : gift.user.uniqueId}
                  </a>
                  <span style={{ color: 'var(--text-secondary)' }}> sent </span>
                  {gift.gift.giftName} 
                  {gift.currentRepeatCount > 1 && <span style={{ color: 'var(--text-secondary)' }}> x {gift.currentRepeatCount}</span>}
                  {gift.currentTotalValue > 0 && <span style={{ color: 'var(--accent-light)', fontWeight: 'bold' }}> (Coins: {gift.currentTotalValue.toLocaleString()})</span>} 
                </div>
                <div className="gift-icon"> {/* Ensure this class is styled for gift icons */}
                    <img src={gift.gift.giftPictureUrl} alt={gift.gift.giftName} />
                </div>
                {/* Optional: Timestamp for gifts */}
                {/* <span className="timestamp-badge">{new Date(gift.lastUpdatedAt).toLocaleTimeString()}</span> */}
              </div>
            );
          })}
        </StreamContent>
      </StreamPanel>
    </StreamPanelsWrapper>
  );
};

export default LiveInfoTab; 