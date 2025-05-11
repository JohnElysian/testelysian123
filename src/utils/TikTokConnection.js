import io from 'socket.io-client';

// Create a singleton instance
let instance = null;

class TikTokConnection {
  constructor(backendUrl = undefined) {
    // Return existing instance if already created (singleton pattern)
    if (instance) {
      return instance;
    }
    
    // Use the global connection object if available
    if (window.tiktokConnection) {
      console.log("[React] Using existing global TikTok connection");
      this.useGlobalConnection();
    } else {
      console.log("[React] Creating new TikTok connection");
      this.socket = io(backendUrl || "https://tiktok-chat-reader.zerody.one/");
      this.uniqueId = null;
      this.options = null;
      this.eventListeners = new Map();
      this.connectionState = {
        connected: false,
        connecting: false,
        disconnected: true
      };

      this.setupSocketListeners();
    }
    
    // Store the instance
    instance = this;
  }
  
  useGlobalConnection() {
    this.global = window.tiktokConnection;
    this.uniqueId = this.global.uniqueId;
    this.options = this.global.options;
    this.eventListeners = new Map();
    this.socket = this.global.socket;
    
    // Get current connection state from the DOM
    const stateText = document.getElementById('stateText')?.textContent || '';
    const connectedStatus = document.getElementById('connectionStatus')?.classList.contains('connected') || false;
    const connectingStatus = document.getElementById('connectionStatus')?.classList.contains('connecting') || false;
    
    // Set initial state
    this.connectionState = {
      connected: connectedStatus || (stateText.includes('Connected') && !stateText.includes('Disconnected')),
      connecting: connectingStatus || stateText.includes('Connecting'),
      disconnected: !connectedStatus && !connectingStatus
    };
    
    // Directly intercept events from the global socket
    if (this.socket) {
      console.log("[React] Intercepting events from global socket", this.socket);
      
      // Remove any existing listeners to avoid duplicates
      ['roomUser', 'like', 'gift', 'follow', 'share', 'viewer', 'roomStats', 'chat', 'member', 'streamEnd', 'tiktokConnected', 'tiktokDisconnected'].forEach(event => {
        this.socket.off(event);
      });
      
      // Setup new listeners
      this.setupSocketListeners();
    }
    
    // Also intercept events from the global connection using a MutationObserver
    this.setupMutationObservers();
  }

  setupMutationObservers() {
    // Monitor the chat container for new messages
    const chatContainer = document.querySelector('.chatcontainer');
    if (chatContainer) {
      const chatObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Process each added node to extract chat data
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && !node.classList.contains('notification-item')) {
                try {
                  // Extract data from the DOM element
                  const profilePic = node.querySelector('.miniprofilepicture')?.src || '';
                  const username = node.querySelector('.usernamelink')?.textContent || '';
                  const uniqueId = node.querySelector('.usernamelink')?.href?.split('@')[1] || username;
                  const comment = node.textContent.replace(username + ':', '').trim();
                  
                  // Create a mock data object similar to what the socket would emit
                  const mockData = {
                    uniqueId: uniqueId,
                    nickname: username,
                    profilePictureUrl: profilePic,
                    comment: comment,
                    userId: Date.now().toString() // Generate a fake userId
                  };
                  
                  // Notify listeners
                  this.notifyListeners('chat', mockData);
                } catch (e) {
                  console.warn('[TikTokConnection] Error processing chat message', e);
                }
              }
            });
          }
        });
      });
      
      chatObserver.observe(chatContainer, { childList: true });
    }
    
    // Monitor the gift container for new gifts
    const giftContainer = document.querySelector('.giftcontainer');
    if (giftContainer) {
      const giftObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Process each added node to extract gift data
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1 && !node.classList.contains('notification-item')) {
                try {
                  // Extract data from the DOM element
                  const profilePic = node.querySelector('.miniprofilepicture')?.src || '';
                  const username = node.querySelector('.usernamelink')?.textContent || '';
                  const uniqueId = node.querySelector('.usernamelink')?.href?.split('@')[1] || username;
                  const giftName = node.textContent.match(/Name: ([^\(]+)/)?.[1]?.trim() || 'Gift';
                  const giftId = node.textContent.match(/ID:(\d+)/)?.[1] || '0';
                  const repeatCount = parseInt(node.textContent.match(/Repeat: x([0-9,]+)/)?.[1]?.replace(/,/g, '') || '1');
                  const diamondCount = parseInt(node.textContent.match(/Cost: ([0-9,]+)/)?.[1]?.replace(/,/g, '') || '0') / repeatCount;
                  const giftPictureUrl = node.querySelector('.gifticon')?.src || '';
                  
                  // Create a mock data object similar to what the socket would emit
                  const mockData = {
                    uniqueId: uniqueId,
                    nickname: username,
                    profilePictureUrl: profilePic,
                    giftId: giftId,
                    giftName: giftName,
                    diamondCount: diamondCount,
                    repeatCount: repeatCount,
                    giftPictureUrl: giftPictureUrl,
                    userId: Date.now().toString() // Generate a fake userId
                  };
                  
                  // Notify listeners
                  this.notifyListeners('gift', mockData);
                } catch (e) {
                  console.warn('[TikTokConnection] Error processing gift', e);
                }
              }
            });
          }
        });
      });
      
      giftObserver.observe(giftContainer, { childList: true });
    }
    
    // Monitor the connection status
    const connectionStatus = document.getElementById('connectionStatus');
    if (connectionStatus) {
      const connectionObserver = new MutationObserver(() => {
        const isConnected = connectionStatus.classList.contains('connected');
        const isConnecting = connectionStatus.classList.contains('connecting');
        
        this.connectionState = {
          connected: isConnected,
          connecting: isConnecting,
          disconnected: !isConnected && !isConnecting
        };
        
        this.notifyStateChange();
      });
      
      connectionObserver.observe(connectionStatus, { attributes: true, attributeFilter: ['class'] });
    }
    
    // Also monitor the state text for changes
    const stateText = document.getElementById('stateText');
    if (stateText) {
      const stateObserver = new MutationObserver(() => {
        const text = stateText.textContent;
        
        if (text.includes('Connected')) {
          this.connectionState.connected = true;
          this.connectionState.connecting = false;
          this.connectionState.disconnected = false;
        } else if (text.includes('Connecting')) {
          this.connectionState.connected = false;
          this.connectionState.connecting = true;
          this.connectionState.disconnected = false;
        } else {
          this.connectionState.connected = false;
          this.connectionState.connecting = false;
          this.connectionState.disconnected = true;
        }
        
        this.notifyStateChange();
      });
      
      stateObserver.observe(stateText, { childList: true, characterData: true });
    }
  }

  setupSocketListeners() {
    if (!this.socket) return;
    
    try {
      this.socket.on('connect', () => {
        console.info("[React] Socket connected!");
        
        // Update connection state
        this.connectionState = {
          connected: false,
          connecting: true,
          disconnected: false
        };
        this.notifyStateChange();

        // Reconnect to streamer if uniqueId already set
        if (this.uniqueId) {
          this.setUniqueId();
        }
      });

      this.socket.on('disconnect', () => {
        console.warn("[React] Socket disconnected!");
        
        // Update connection state
        this.connectionState = {
          connected: false,
          connecting: false,
          disconnected: true
        };
        this.notifyStateChange();
      });

      this.socket.on('streamEnd', () => {
        console.warn("[React] LIVE has ended!");
        this.uniqueId = null;
        
        // Update connection state
        this.connectionState = {
          connected: false,
          connecting: false,
          disconnected: true
        };
        this.notifyStateChange();
        
        // Notify listeners
        this.notifyListeners('streamEnd');
      });

      this.socket.on('tiktokDisconnected', (errMsg) => {
        console.warn("[React] TikTok disconnected:", errMsg);
        
        // Update connection state
        this.connectionState = {
          connected: false,
          connecting: false,
          disconnected: true
        };
        this.notifyStateChange();
        
        if (errMsg && errMsg.includes('LIVE has ended')) {
          this.uniqueId = null;
        }
        
        // Notify listeners
        this.notifyListeners('tiktokDisconnected', errMsg);
      });
      
      this.socket.on('tiktokConnected', (state) => {
        console.log("[React] TikTok connected:", state);
        
        // Update connection state
        this.connectionState = {
          connected: true,
          connecting: false,
          disconnected: false
        };
        this.notifyStateChange();
        
        // Notify listeners
        this.notifyListeners('tiktokConnected', state);
      });

      // Forward standard events
      ['roomUser', 'like', 'gift', 'follow', 'share', 'viewer', 'roomStats', 'chat', 'member'].forEach(event => {
        try {
          this.socket.on(event, (data) => {
            try {
              console.log(`[React] Received ${event} event:`, data);
              this.notifyListeners(event, data);
            } catch (err) {
              console.error(`[React] Error handling ${event} event:`, err);
            }
          });
        } catch (err) {
          console.error(`[React] Error setting up ${event} listener:`, err);
        }
      });
    } catch (err) {
      console.error("[React] Error setting up socket listeners:", err);
    }
  }

  connect(uniqueId, options = {}) {
    this.uniqueId = uniqueId;
    this.options = options;
    
    // If using global connection, call its connect method
    if (this.global) {
      console.log("[React] Using global connect for:", uniqueId);
      return this.global.connect(uniqueId, options);
    }

    this.setUniqueId();

    // Update connection state
    this.connectionState = {
      connected: false,
      connecting: true,
      disconnected: false
    };
    this.notifyStateChange();

    return new Promise((resolve, reject) => {
      const onConnect = (state) => {
        this.socket.off('tiktokConnected', onConnect);
        this.socket.off('tiktokDisconnected', onDisconnect);
        resolve(state);
      };

      const onDisconnect = (errMsg) => {
        this.socket.off('tiktokConnected', onConnect);
        this.socket.off('tiktokDisconnected', onDisconnect);
        reject(errMsg);
      };

      this.socket.once('tiktokConnected', onConnect);
      this.socket.once('tiktokDisconnected', onDisconnect);

      setTimeout(() => {
        this.socket.off('tiktokConnected', onConnect);
        this.socket.off('tiktokDisconnected', onDisconnect);
        
        // Update connection state
        this.connectionState = {
          connected: false,
          connecting: false,
          disconnected: true
        };
        this.notifyStateChange();
        
        reject('Connection Timeout');
      }, 15000);
    });
  }

  disconnect() {
    if (this.global) {
      // Cannot disconnect the global socket since other components might be using it
      console.log("[React] Cannot disconnect global connection");
      return;
    }
    
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Update connection state
    this.connectionState = {
      connected: false,
      connecting: false,
      disconnected: true
    };
    this.notifyStateChange();
    
    this.uniqueId = null;
  }

  setUniqueId() {
    if (this.global) {
      this.global.setUniqueId();
      return;
    }
    
    if (this.socket && this.uniqueId) {
      this.socket.emit('setUniqueId', this.uniqueId, this.options || {});
    }
  }

  on(eventName, eventHandler) {
    try {
      if (!eventName || typeof eventHandler !== 'function') {
        console.warn('[TikTokConnection] Invalid event registration:', eventName);
        return this;
      }
      
      if (!this.eventListeners.has(eventName)) {
        this.eventListeners.set(eventName, new Set());
      }
      
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.add(eventHandler);
      }
    } catch (err) {
      console.error(`[TikTokConnection] Error registering ${eventName} handler:`, err);
    }
    
    return this;
  }

  off(eventName, eventHandler) {
    try {
      if (!eventName || !eventHandler) {
        console.warn('[TikTokConnection] Invalid event unregistration:', eventName);
        return this;
      }
      
      if (!this.eventListeners.has(eventName)) {
        return this;
      }
      
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(eventHandler);
        
        if (listeners.size === 0) {
          this.eventListeners.delete(eventName);
        }
      }
    } catch (err) {
      console.error(`[TikTokConnection] Error unregistering ${eventName} handler:`, err);
    }
    
    return this;
  }

  notifyListeners(eventName, data) {
    try {
      if (!this.eventListeners.has(eventName)) {
        return;
      }
      
      const listeners = this.eventListeners.get(eventName);
      if (!listeners) return;
      
      listeners.forEach(handler => {
        try {
          if (typeof handler === 'function') {
            handler(data);
          }
        } catch (e) {
          console.error(`[TikTokConnection] Error in ${eventName} handler:`, e);
        }
      });
    } catch (err) {
      console.error(`[TikTokConnection] Fatal error notifying ${eventName} listeners:`, err);
    }
  }

  notifyStateChange() {
    this.notifyListeners('connectionStateChanged', this.connectionState);
  }

  getConnectionState() {
    return this.connectionState;
  }
}

// Export a singleton instance
const connection = new TikTokConnection();
export default connection; 