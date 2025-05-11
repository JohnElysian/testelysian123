// Action type constants to prevent typos
export const WHEEL_ACTIONS = {
  SET_MODE: 'SET_MODE',
  START_COLLECTING: 'START_COLLECTING',
  STOP_COLLECTING: 'STOP_COLLECTING',
  START_SPINNING: 'START_SPINNING',
  STOP_SPINNING: 'STOP_SPINNING',
  SET_WINNER: 'SET_WINNER',
  RESET_WHEEL: 'RESET_WHEEL',
  UPDATE_SETTING: 'UPDATE_SETTING',
  ADD_ENTRIES: 'ADD_ENTRIES',
  SET_ENTRIES: 'SET_ENTRIES',
  SET_CONNECTION_STATUS: 'SET_CONNECTION_STATUS',
  SET_VISIBILITY: 'SET_VISIBILITY',
  TOGGLE_SETTINGS_PANEL: 'TOGGLE_SETTINGS_PANEL',
  TOGGLE_ENTRY_LIST: 'TOGGLE_ENTRY_LIST',
  START_AUTO_SPIN: 'START_AUTO_SPIN',
  STOP_AUTO_SPIN: 'STOP_AUTO_SPIN',
  UPDATE_COUNTDOWN: 'UPDATE_COUNTDOWN',
  AUTO_SPIN_TIMER_ELAPSED: 'AUTO_SPIN_TIMER_ELAPSED',
  CLEAR_AUTO_SPIN_TRIGGERS: 'CLEAR_AUTO_SPIN_TRIGGERS',
  TICK_COUNTDOWN: 'TICK_COUNTDOWN',
  ERROR_OCCURRED: 'ERROR_OCCURRED',
  PERFORMANCE_WARNING: 'PERFORMANCE_WARNING',
  RESET_ERROR: 'RESET_ERROR'
};

// Valid modes for the wheel
export const VALID_MODES = ['gifts', 'likes', 'chat', 'joins'];

// Helper function to load settings from localStorage or use defaults
const getInitialSetting = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  if (storedValue === null) return defaultValue;
  
  try {
    // For booleans or numbers, convert appropriate string representations
    if (defaultValue === true || defaultValue === false) {
      return storedValue === 'true';
    }
    
    if (typeof defaultValue === 'number') {
      const parsed = parseFloat(storedValue);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    // For objects or arrays, try parsing JSON
    if (typeof defaultValue === 'object') {
      return JSON.parse(storedValue);
    }
    
    // Default case (strings, etc.)
    return storedValue;
  } catch (error) {
    console.warn(`Error parsing localStorage value for ${key}:`, error);
    return defaultValue;
  }
};

export const initialState = {
  // Core Status
  currentMode: 'joins', // gifts, likes, chat, joins
  isCollecting: false,
  isSpinning: false,
  isConnected: false, // Is the TikTok connection active?
  isVisible: false,   // Is the component/tab visible?
  
  // Entries & Winner
  wheelEntries: [],
  winnerIndex: -1,
  
  // UI Text/Status
  statusText: 'Mode set to Joins. Click "Start Collecting" to begin.',
  wheelUiStatus: 'Getting ready...',
  wheelEntryCostText: 'ENTRIES ARE FOR JOINS',

  // Settings
  settingsPanelVisible: false,
  subscriberOnly: getInitialSetting('subscriberOnly', false),
  triggerWord: getInitialSetting('triggerWord', '!spin'),
  useTriggerWord: getInitialSetting('useTriggerWord', true),
  // Wheel Appearance
  wheelSize: getInitialSetting('wheelSize', 119),
  textSize: getInitialSetting('textSize', 300),
  centerSize: getInitialSetting('centerSize', 210),
  showTextShadows: getInitialSetting('showTextShadows', true),
  showEntryList: getInitialSetting('showEntryList', true),
  shuffleEntriesOnSpin: getInitialSetting('shuffleEntriesOnSpin', true),
  // Entry Costs
  likesPerEntry: getInitialSetting('likesPerEntry', 100),
  coinsPerEntry: getInitialSetting('coinsPerEntry', 1),
  // Spin Physics/Timing
  spinDuration: getInitialSetting('spinDuration', 15),

  // Auto Spin
  isAutoSpinActive: false,
  currentCountdown: null, // Remaining seconds
  autoSpinMinutes: getInitialSetting('autoSpinMinutes', 5),
  autoSpinSeconds: getInitialSetting('autoSpinSeconds', 0),
  // New flags for managing action after auto-spin timer elapses
  triggerSpinAfterAuto: false,
  triggerResetAfterAuto: false,

  // Error handling
  error: null,
  errorMessage: null,
  hasError: false,
  
  // Performance monitoring
  performanceWarnings: [],
  lastPerformanceWarning: null,
};

function getEntryCostText(mode, coinsPerEntry, likesPerEntry, triggerWord) {
   switch (mode) {
      case 'gifts': return `ENTRIES ARE FOR ${coinsPerEntry} COIN${coinsPerEntry > 1 ? 'S' : ''}`;
      case 'likes': return `ENTRIES ARE FOR ${likesPerEntry} LIKES`;
      case 'chat': return `ENTRIES ARE FOR CHAT (${triggerWord})`;
      case 'joins': return 'ENTRIES ARE FOR JOINS';
      default: return 'SET ENTRY TYPE';
    }
}

// Validation helpers
const validateMode = (mode) => {
  if (!VALID_MODES.includes(mode)) {
    console.error(`Invalid mode: ${mode}. Must be one of: ${VALID_MODES.join(', ')}`);
    return false;
  }
  return true;
};

// Action payload validation helpers
const validateSettingPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    console.error('Invalid setting payload: must be an object');
    return false;
  }
  if (!('setting' in payload) || !('value' in payload)) {
    console.error('Invalid setting payload: must have setting and value properties');
    return false;
  }
  return true;
};

const validateEntriesPayload = (payload) => {
  if (!Array.isArray(payload)) {
    console.error('Invalid entries payload: must be an array');
    return false;
  }
  if (payload.some(entry => !entry || typeof entry !== 'object' || !('name' in entry))) {
    console.error('Invalid entries payload: each entry must be an object with a name property');
    return false;
  }
  return true;
};

const validateWinnerPayload = (payload) => {
  if (typeof payload !== 'number' || !Number.isInteger(payload)) {
    console.error('Invalid winner payload: must be an integer');
    return false;
  }
  return true;
};

const validateCountdownPayload = (payload) => {
  if (typeof payload !== 'number' || !Number.isInteger(payload) || payload < 0) {
    console.error('Invalid countdown payload: must be a non-negative integer');
    return false;
  }
  return true;
};

// Update validateStateTransition to include payload validation
const validateStateTransition = (currentState, action) => {
  // Prevent spinning while already spinning
  if (action.type === WHEEL_ACTIONS.START_SPINNING && currentState.isSpinning) {
    console.warn('Cannot start spinning while already spinning');
    return false;
  }

  // Prevent collecting while spinning
  if (action.type === WHEEL_ACTIONS.START_COLLECTING && currentState.isSpinning) {
    console.warn('Cannot start collecting while spinning');
    return false;
  }

  // Prevent adding entries while spinning
  if (action.type === WHEEL_ACTIONS.ADD_ENTRIES && currentState.isSpinning) {
    console.warn('Cannot add entries while spinning');
    return false;
  }

  // Validate mode changes
  if (action.type === WHEEL_ACTIONS.SET_MODE && !validateMode(action.payload)) {
    return false;
  }

  // Add payload validations
  switch (action.type) {
    case WHEEL_ACTIONS.UPDATE_SETTING:
      return validateSettingPayload(action.payload);
    case WHEEL_ACTIONS.ADD_ENTRIES:
    case WHEEL_ACTIONS.SET_ENTRIES:
      return validateEntriesPayload(action.payload);
    case WHEEL_ACTIONS.SET_WINNER:
      return validateWinnerPayload(action.payload);
    case WHEEL_ACTIONS.UPDATE_COUNTDOWN:
      return validateCountdownPayload(action.payload);
    default:
      return true;
  }
};

export function wheelReducer(state, action) {
  // Validate state transition before processing action
  if (!validateStateTransition(state, action)) {
    return state;
  }

  switch (action.type) {
    case WHEEL_ACTIONS.SET_MODE:
      return {
        ...state,
        currentMode: action.payload,
        isCollecting: false, // Stop collecting on mode change
        isAutoSpinActive: false,
        currentCountdown: null,
        wheelEntries: [], // Reset entries on mode change
        winnerIndex: -1,
        statusText: `Mode set to ${action.payload}. Click "Start Collecting" to begin.`,
        wheelUiStatus: 'Getting ready...',
        wheelEntryCostText: getEntryCostText(action.payload, state.coinsPerEntry, state.likesPerEntry, state.triggerWord),
      };

    case WHEEL_ACTIONS.START_COLLECTING:
      return {
        ...state,
        isCollecting: true,
        isAutoSpinActive: false, // Ensure auto spin stops if manual collect starts
        currentCountdown: null,
        wheelEntries: [], // Clear entries when starting collection
        winnerIndex: -1,
        statusText: `Collecting entries for ${state.currentMode}...`,
        wheelUiStatus: 'ENTER NOW!!!!',
      };

    case WHEEL_ACTIONS.STOP_COLLECTING:
      return { ...state, isCollecting: false };

    case WHEEL_ACTIONS.START_SPINNING:
      return { 
        ...state, 
        isSpinning: true, 
        isCollecting: false, // Stop collecting when spin starts 
        isAutoSpinActive: false, // Stop auto spin if manual spin starts
        currentCountdown: null,
        statusText: 'Spinning...',
        wheelUiStatus: 'Spinning...', 
        winnerIndex: -1, // Clear previous winner visually
      };

    case WHEEL_ACTIONS.STOP_SPINNING:
      return { 
        ...state, 
        isSpinning: false,
        // Note: isCollecting remains false, statusText updated by SET_WINNER or RESET
      };

    case WHEEL_ACTIONS.SET_WINNER:
      // Ensure winner index is valid before accessing entries
      const winnerName = (action.payload >= 0 && action.payload < state.wheelEntries.length) 
                         ? state.wheelEntries[action.payload].name 
                         : 'Invalid Winner';
      return { 
        ...state, 
        winnerIndex: action.payload,
        statusText: `Winner: ${winnerName}! Reset or act.`,
        wheelUiStatus: 'Getting ready...', // Ready for next action
      };

    case WHEEL_ACTIONS.RESET_WHEEL:
      return {
        ...state,
        wheelEntries: [],
        winnerIndex: -1,
        isSpinning: false, 
        isCollecting: false, // Always stop collecting on reset
        isAutoSpinActive: false, // Fully stop auto-spin on reset
        currentCountdown: null, // Clear countdown on reset
        statusText: `Select a mode and click "Start Collecting" or "Start Auto Spin"`,
        wheelUiStatus: 'Getting ready...',
        triggerSpinAfterAuto: false, // Ensure flags are reset too
        triggerResetAfterAuto: false,
      };

    case WHEEL_ACTIONS.UPDATE_SETTING: {
      const { setting, value } = action.payload;
      localStorage.setItem(setting, String(value)); // Persist all settings
      let updatedState = { ...state, [setting]: value };

      // Update derived text based on relevant settings
      if (setting === 'coinsPerEntry' || (setting === 'currentMode' && value === 'gifts')) {
        updatedState.wheelEntryCostText = getEntryCostText(
          setting === 'currentMode' ? value : state.currentMode, 
          setting === 'coinsPerEntry' ? value : state.coinsPerEntry, 
          state.likesPerEntry,
          state.triggerWord
        );
      } else if (setting === 'likesPerEntry' || (setting === 'currentMode' && value === 'likes')) {
        updatedState.wheelEntryCostText = getEntryCostText(
          setting === 'currentMode' ? value : state.currentMode, 
          state.coinsPerEntry, 
          setting === 'likesPerEntry' ? value : state.likesPerEntry,
          state.triggerWord
        );
      } else if (
          setting === 'currentMode' ||
          setting === 'triggerWord' ||
          setting === 'useTriggerWord'
      ) {
        updatedState.wheelEntryCostText = getEntryCostText(
          setting === 'currentMode' ? value : state.currentMode,
          state.coinsPerEntry,
          state.likesPerEntry,
          setting === 'triggerWord' ? value : state.triggerWord
        );
      }
      
      return updatedState;
    }

    case WHEEL_ACTIONS.ADD_ENTRIES:
      // Avoid adding entries if spinning (already handled by validateStateTransition)
      return { ...state, wheelEntries: [...state.wheelEntries, ...action.payload] };

    case WHEEL_ACTIONS.SET_ENTRIES:
      return { ...state, wheelEntries: action.payload };

    case WHEEL_ACTIONS.SET_CONNECTION_STATUS:
      return { ...state, isConnected: action.payload };

    case WHEEL_ACTIONS.SET_VISIBILITY:
      return { ...state, isVisible: action.payload };

    case WHEEL_ACTIONS.TOGGLE_SETTINGS_PANEL:
      return { ...state, settingsPanelVisible: !state.settingsPanelVisible };

    case WHEEL_ACTIONS.TOGGLE_ENTRY_LIST: {
      const showList = !state.showEntryList;
      localStorage.setItem('showEntryList', String(showList)); // Persist immediately
      return { ...state, showEntryList: showList };
    }

    case WHEEL_ACTIONS.START_AUTO_SPIN: {
      const startTime = state.autoSpinMinutes * 60 + state.autoSpinSeconds;
      return {
        ...state,
        isCollecting: true, 
        isAutoSpinActive: true,
        currentCountdown: startTime, // Set to startTime directly, even if 0
        // Only reset entries if *not* already collecting when auto-spin starts
        wheelEntries: state.isCollecting ? state.wheelEntries : [], 
        winnerIndex: -1,
        statusText: `Auto-spin started (${state.autoSpinMinutes}m ${state.autoSpinSeconds}s). Collecting entries...`,
        wheelUiStatus: 'ENTER NOW!!!! (AUTO)',
        triggerSpinAfterAuto: false, // Ensure flags are reset when starting
        triggerResetAfterAuto: false,
      };
    }

    case WHEEL_ACTIONS.STOP_AUTO_SPIN:
      return {
        ...state,
        isAutoSpinActive: false,
        currentCountdown: null,
        // Flags are not set here; AUTO_SPIN_TIMER_ELAPSED will handle it if it was a timer finish
      };

    case WHEEL_ACTIONS.UPDATE_COUNTDOWN:
      return { ...state, currentCountdown: action.payload };

    case WHEEL_ACTIONS.AUTO_SPIN_TIMER_ELAPSED:
      return {
        ...state,
        isAutoSpinActive: false,
        currentCountdown: null,
        statusText: 'Auto-spin timer finished!',
        triggerSpinAfterAuto: state.wheelEntries.length > 0,
        triggerResetAfterAuto: state.wheelEntries.length === 0,
      };

    case WHEEL_ACTIONS.CLEAR_AUTO_SPIN_TRIGGERS:
      return {
        ...state,
        triggerSpinAfterAuto: false,
        triggerResetAfterAuto: false,
      };

    case WHEEL_ACTIONS.TICK_COUNTDOWN:
      if (state.isAutoSpinActive && state.currentCountdown !== null && state.currentCountdown > 0) {
        return { ...state, currentCountdown: state.currentCountdown - 1 };
      }
      return state; // No change if conditions not met

    // Error handling
    case WHEEL_ACTIONS.ERROR_OCCURRED:
      return {
        ...state,
        hasError: true,
        error: action.payload.error || 'Unknown error',
        errorMessage: action.payload.message || 'An unexpected error occurred',
        statusText: `Error: ${action.payload.message || 'An unexpected error occurred'}. Reset to continue.`,
        isSpinning: false,  // Stop spinning on error
        isAutoSpinActive: false,  // Stop auto-spin on error
        currentCountdown: null,
      };
      
    case WHEEL_ACTIONS.RESET_ERROR:
      return {
        ...state,
        hasError: false,
        error: null,
        errorMessage: null,
        statusText: 'Wheel reset after error. Ready to continue.',
      };
      
    case WHEEL_ACTIONS.PERFORMANCE_WARNING:
      const newWarning = {
        timestamp: Date.now(),
        severity: action.payload.severity || 'warning',
        fps: action.payload.fps,
        message: action.payload.message || `Low performance detected: ${action.payload.fps} FPS`
      };
      
      // Keep only the last 10 warnings
      const warnings = [...state.performanceWarnings, newWarning].slice(-10);
      
      // Only take action on critical performance issues
      if (newWarning.severity === 'critical' && state.isSpinning) {
        // For critical issues during spinning, we might want to adjust physics
        // to ensure the wheel still completes its spin properly
        return {
          ...state,
          performanceWarnings: warnings,
          lastPerformanceWarning: newWarning,
          // Potentially adjust animation parameters:
          // spinDuration: Math.min(state.spinDuration, 10), // Shorten spin time
          statusText: `Performance warning: ${newWarning.message}`,
        };
      }
      
      return {
        ...state,
        performanceWarnings: warnings,
        lastPerformanceWarning: newWarning,
      };

    default:
      console.error(`Unhandled action type: ${action.type}`);
      return state; // Return current state for unhandled actions
  }
}
 