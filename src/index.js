import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

// Create a bridge for interoperability between React and the original app
if (typeof window !== 'undefined') {
  // Safe event dispatching helper
  window.safeDispatchEvent = function(eventName, detail) {
    try {
      console.log(`[EventBridge] Dispatching ${eventName} event:`, detail);
      const event = new CustomEvent(eventName, { detail });
      window.dispatchEvent(event);
    } catch (err) {
      console.error(`[EventBridge] Error dispatching ${eventName} event:`, err);
    }
  };
  
  // Safe event handler for the original app's event system
  // This prevents issues when the original handlers are undefined or improperly initialized
  window.safeHandleOriginalEvent = function(eventName, detail) {
    try {
      // Check if the original connection instance exists
      if (window.tiktokConnection && window.tiktokConnection.socket) {
        // Find original handlers by event name
        const originalHandler = window.tiktokConnection._listeners?.[eventName]?.[0];
        if (typeof originalHandler === 'function') {
          // Call the original handler safely
          originalHandler(detail);
        }
      }
      
      // Always dispatch the event for React components
      window.safeDispatchEvent(eventName, detail);
    } catch (err) {
      console.error(`[EventBridge] Error handling original ${eventName} event:`, err);
      // Still try to dispatch the event
      window.safeDispatchEvent(eventName, detail);
    }
  };
  
  // Load event counter to avoid duplicates
  let eventsLoaded = window._eventsLoaded || 0;
  
  // Only set up events once
  if (eventsLoaded < 1) {
    console.log('[EventBridge] Setting up event relays between React and original app');
    
    // Set of processed event IDs to avoid duplicates
    const processedEvents = new Set();
    
    // Clear processed events periodically to prevent memory issues
    setInterval(() => {
      processedEvents.clear();
    }, 60000); // Clear every minute
    
    // Function to deduplicate events by creating a unique ID
    function createEventId(event) {
      if (!event || !event.detail) return null;
      
      const data = event.detail;
      let components = [];
      
      if (data.uniqueId) components.push(data.uniqueId);
      if (data.comment) components.push(data.comment);
      if (data.giftName) components.push(data.giftName);
      if (data.giftId) components.push(data.giftId);
      if (data.repeatCount) components.push(data.repeatCount);
      
      // Add timestamp component - round to nearest second to group rapid events
      components.push(Math.floor(Date.now() / 1000));
      
      return components.join(':');
    }
    
    // Set up event relaying between React and the original app with deduplication
    window.addEventListener('tiktok-chat', (event) => {
      // Ensure the event doesn't get lost if React hasn't mounted yet
      if (event && event.detail) {
        const eventId = createEventId(event);
        if (eventId && processedEvents.has(eventId)) {
          console.log('[EventBridge] Skipping duplicate chat event:', eventId);
          return;
        }
        
        if (eventId) processedEvents.add(eventId);
        
        console.log('[EventBridge] Relaying chat event:', event.detail);
        
        // Dispatch both original and relay events to ensure compatibility
        window.safeDispatchEvent('tiktok-chat-relay', event.detail);
        window.safeDispatchEvent('tiktok-chat', event.detail);
      }
    });
    
    window.addEventListener('tiktok-gift', (event) => {
      if (event && event.detail) {
        const eventId = createEventId(event);
        if (eventId && processedEvents.has(eventId)) {
          console.log('[EventBridge] Skipping duplicate gift event:', eventId);
          return;
        }
        
        if (eventId) processedEvents.add(eventId);
        
        console.log('[EventBridge] Relaying gift event:', event.detail);
        
        // Dispatch both original and relay events to ensure compatibility
        window.safeDispatchEvent('tiktok-gift-relay', event.detail);
        window.safeDispatchEvent('tiktok-gift', event.detail);
      }
    });
    
    window.addEventListener('tiktok-member', (event) => {
      if (event && event.detail) {
        const eventId = createEventId(event);
        if (eventId && processedEvents.has(eventId)) {
          console.log('[EventBridge] Skipping duplicate member event:', eventId);
          return;
        }
        
        if (eventId) processedEvents.add(eventId);
        
        console.log('[EventBridge] Relaying member event:', event.detail);
        
        // Dispatch both original and relay events to ensure compatibility
        window.safeDispatchEvent('tiktok-member-relay', event.detail);
        window.safeDispatchEvent('tiktok-member', event.detail);
      }
    });
    
    // Mark events as loaded
    window._eventsLoaded = 1;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 