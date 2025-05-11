import { useEffect, useRef, useCallback } from 'react';
import { DEBUG } from '../utils/debug'; // Assuming debug.js is in src/utils
import { WHEEL_ACTIONS } from '../components/Wheel/wheelReducer';

/**
 * Custom hook to manage TikTok Live event listeners for the wheel.
 * @param {object} options - Configuration options.
 * @param {boolean} options.isCollecting - Whether the wheel is currently collecting entries.
 * @param {boolean} options.isSpinning - Whether the wheel is currently spinning.
 * @param {function} options.onGift - Handler for gift events.
 * @param {function} options.onLike - Handler for like events.
 * @param {function} options.onChat - Handler for chat events.
 * @param {function} options.onJoin - Handler for join/member events.
 * @param {function} options.onConnect - Callback for when connection is established.
 * @param {function} options.onDisconnect - Callback for when connection is lost.
 * @param {function} options.dispatch - Optional reducer dispatch function for direct actions.
 */
function useWheelEvents({
  isCollecting,
  isSpinning,
  onGift,
  onLike,
  onChat,
  onJoin,
  onConnect,
  onDisconnect,
  dispatch
}) {
  const connectionRef = useRef(window.tiktokConnection);
  const isCollectingRef = useRef(isCollecting);
  const isSpinningRef = useRef(isSpinning);
  
  // Update refs when props change
  useEffect(() => {
    isCollectingRef.current = isCollecting;
    isSpinningRef.current = isSpinning;
  }, [isCollecting, isSpinning]);

  // Store handlers in refs to maintain function identity across renders
  const onGiftRef = useRef(onGift);
  const onLikeRef = useRef(onLike);
  const onChatRef = useRef(onChat);
  const onJoinRef = useRef(onJoin);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const dispatchRef = useRef(dispatch);

  // Update handler refs when they change
  useEffect(() => {
    onGiftRef.current = onGift;
    onLikeRef.current = onLike;
    onChatRef.current = onChat;
    onJoinRef.current = onJoin;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    dispatchRef.current = dispatch;
  }, [onGift, onLike, onChat, onJoin, onConnect, onDisconnect, dispatch]);

  // Create stable event handlers that use the latest refs
  const handleGift = useCallback((rawEvent) => {
    if (!isCollectingRef.current || isSpinningRef.current) return;
    
    const eventForWheel = {
      uniqueId: rawEvent.uniqueId,
      nickname: rawEvent.nickname,
      userId: rawEvent.userId,
      user: rawEvent.user,
      profilePictureUrl: rawEvent.profilePictureUrl,
      isSubscriber: !!rawEvent.isSubscriber,
      diamondCount: rawEvent.gift?.diamond_count ?? rawEvent.diamondCount ?? rawEvent.giftValue ?? 1,
      repeatCount: rawEvent.gift?.repeat_count ?? rawEvent.repeatCount ?? 1,
      diamondsTotal: (rawEvent.gift?.diamond_count ?? rawEvent.diamondCount ?? rawEvent.giftValue ?? 1) * 
                    (rawEvent.gift?.repeat_count ?? rawEvent.repeatCount ?? 1),
      giftId: rawEvent.giftId || rawEvent.gift?.id || 0,
      giftName: rawEvent.giftName || rawEvent.gift?.name || 'Unknown Gift',
      repeatEnd: rawEvent.repeatEnd === true || rawEvent.gift?.repeat_end === 1,
      groupId: rawEvent.groupId,
      timestamp: rawEvent.createTime || rawEvent.timestamp || Date.now()
    };
    
    if (DEBUG) console.log('[useWheelEvents] Gift event prepared for WheelControls:', eventForWheel);
    onGiftRef.current?.(eventForWheel);
  }, []);

  const handleLike = useCallback((rawEvent) => {
    if (!isCollectingRef.current || isSpinningRef.current) return;
    
    const eventForWheel = {
      uniqueId: rawEvent.uniqueId,
      nickname: rawEvent.nickname,
      userId: rawEvent.userId,
      user: rawEvent.user,
      profilePictureUrl: rawEvent.profilePictureUrl,
      isSubscriber: !!rawEvent.isSubscriber,
      likeCount: rawEvent.likeCount || 0,
      totalLikeCount: rawEvent.totalLikeCount || rawEvent.likeCount || 0,
      timestamp: rawEvent.createTime || rawEvent.timestamp || Date.now()
    };
    
    if (DEBUG) console.log('[useWheelEvents] Like event prepared for WheelControls:', eventForWheel);
    onLikeRef.current?.(eventForWheel);
  }, []);

  const handleChat = useCallback((rawEvent) => {
    if (!isCollectingRef.current || isSpinningRef.current) return;
    
    const eventForWheel = {
      uniqueId: rawEvent.uniqueId,
      nickname: rawEvent.nickname,
      userId: rawEvent.userId,
      user: rawEvent.user,
      profilePictureUrl: rawEvent.profilePictureUrl,
      isSubscriber: !!rawEvent.isSubscriber,
      comment: rawEvent.comment || '',
      timestamp: rawEvent.createTime || rawEvent.timestamp || Date.now()
    };
    
    if (DEBUG && eventForWheel.comment.startsWith('!')) {
      console.log('[useWheelEvents] Chat command detected:', eventForWheel);
    }
    onChatRef.current?.(eventForWheel);
  }, []);

  const handleJoin = useCallback((rawEvent) => {
    if (!isCollectingRef.current || isSpinningRef.current) return;
    
    const eventForWheel = {
      uniqueId: rawEvent.uniqueId,
      nickname: rawEvent.nickname,
      userId: rawEvent.userId,
      user: rawEvent.user,
      profilePictureUrl: rawEvent.profilePictureUrl,
      isSubscriber: !!rawEvent.isSubscriber,
      timestamp: rawEvent.createTime || rawEvent.timestamp || Date.now()
    };
    
    if (DEBUG) console.log('[useWheelEvents] Join event prepared for WheelControls:', eventForWheel);
    onJoinRef.current?.(eventForWheel);
  }, []);

  useEffect(() => {
    const connection = connectionRef.current;
    if (!connection) {
      if (DEBUG) console.warn('[useWheelEvents] window.tiktokConnection not found. Events not initialized.');
      
      // If dispatch is provided, update connection status
      if (dispatchRef.current) {
        dispatchRef.current({ 
          type: WHEEL_ACTIONS.SET_CONNECTION_STATUS, 
          payload: false 
        });
      }
      return;
    }

    let eventHandlers = null;

    const internalOnConnect = () => {
      if (DEBUG) console.log('[useWheelEvents] Connection established.');
      
      // Call onConnect callback if provided
      onConnectRef.current?.();
      
      // If dispatch is provided, update connection status
      if (dispatchRef.current) {
        dispatchRef.current({ 
          type: WHEEL_ACTIONS.SET_CONNECTION_STATUS, 
          payload: true 
        });
      }
      
      // Add specific event listeners if collecting
      if (isCollectingRef.current) {
        attachEventListeners();
      }
    };

    const internalOnDisconnect = () => {
      if (DEBUG) console.warn('[useWheelEvents] Connection lost.');
      
      // Call onDisconnect callback if provided
      onDisconnectRef.current?.();
      
      // If dispatch is provided, update connection status
      if (dispatchRef.current) {
        dispatchRef.current({ 
          type: WHEEL_ACTIONS.SET_CONNECTION_STATUS, 
          payload: false 
        });
      }
      
      // Remove specific event listeners
      removeEventListeners();
    };

    const attachEventListeners = () => {
      if (eventHandlers) return; // Already attached
      
      if (DEBUG) console.log('[useWheelEvents] Attaching event listeners...');
      
      // Create stable event handlers
      eventHandlers = {
        gift: handleGift,
        like: handleLike,
        chat: handleChat,
        member: handleJoin
      };
      
      // Add event listeners
      connection.on('gift', eventHandlers.gift);
      connection.on('like', eventHandlers.like);
      connection.on('chat', eventHandlers.chat);
      connection.on('member', eventHandlers.member);
    };

    const removeEventListeners = () => {
      if (!eventHandlers) return; // Not attached
      
      if (DEBUG) console.log('[useWheelEvents] Removing event listeners...');
      
      // Remove event listeners using the same function references
      connection.off('gift', eventHandlers.gift);
      connection.off('like', eventHandlers.like);
      connection.off('chat', eventHandlers.chat);
      connection.off('member', eventHandlers.member);
      
      // Clear event handlers
      eventHandlers = null;
    };

    // Initial setup
    if (connection.socket && connection.socket.connected) {
      internalOnConnect();
    } else {
      internalOnDisconnect();
    }

    // Add global connection events
    connection.on('connect', internalOnConnect);
    connection.on('disconnect', internalOnDisconnect);

    // Toggle event listeners based on isCollecting
    if (isCollecting && connection.socket && connection.socket.connected) {
      attachEventListeners();
    } else {
      removeEventListeners();
    }

    // Cleanup on unmount
    return () => {
      if (DEBUG) console.log('[useWheelEvents] Cleaning up event listeners...');
      
      // Remove specific event listeners
      if (eventHandlers) {
        connection.off('gift', eventHandlers.gift);
        connection.off('like', eventHandlers.like);
        connection.off('chat', eventHandlers.chat);
        connection.off('member', eventHandlers.member);
      }
      
      // Remove global connection events
      connection.off('connect', internalOnConnect);
      connection.off('disconnect', internalOnDisconnect);
    };
  }, [isCollecting, handleGift, handleLike, handleChat, handleJoin]);
}

export default useWheelEvents; 