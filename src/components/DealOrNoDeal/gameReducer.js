export const ACTIONS = {
  RESET_GAME: "RESET_GAME",
  START_GAME: "START_GAME",
  OPEN_BOX: "OPEN_BOX",
  ACCEPT_OFFER: "ACCEPT_OFFER",
  DECLINE_OFFER: "DECLINE_OFFER",
  SWAP_OR_KEEP: "SWAP_OR_KEEP",
  TOGGLE_SETTINGS: "TOGGLE_SETTINGS",
  SET_MAX: "SET_MAX",
  SET_GEN_MODE: "SET_GEN_MODE",
  SET_PLAYER_BOX: "SET_PLAYER_BOX",
  TOGGLE_BANKER_OFFERS: "TOGGLE_BANKER_OFFERS",
  TRIGGER_BANKER_CALL: "TRIGGER_BANKER_CALL"
};

export const initialState = {
  phase: "setup",          // setup | playing | swap | finished
  maxPrizePreset: 44999,
  generationMode: "pre",   // pre | lazy
  boxes: [],               // [{id, value, opened}]
  playerBoxId: null,
  openedCount: 0,
  roundsBetweenOffers: 5,
  pendingOffer: null,
  showSettings: true,
  lastOffer: null,
  acceptedValue: null,
  bankerOffersEnabled: true,
  offerHistory: [],
  bankerWillCall: false,   // Flag to indicate banker will call soon but with a delay
  calculatedOffer: null,   // Stores the offer before it becomes pendingOffer
  lastOpenTime: null       // Track when boxes are opened to determine player speed
};

/*----------- helpers -----------*/
const niceRound = (n, isMaxPrize = false) => {
  // First ensure we have an integer
  n = Math.round(n);
  
  // Special cases for specific preset values - don't round these
  if (n === 44999 || n === 49999 || isMaxPrize) return n;
  
  // round to "pleasant" numbers for the board
  if (n >= 10000) return Math.round(n / 500) * 500;
  if (n >= 1000)  return Math.round(n / 100) * 100;
  if (n >= 100)   return Math.round(n / 10)  * 10;
  return n;
};

const generateValues = (maxPrize) => {
  /* create a symmetrical-ish spread: 24 unique amounts from 1 to maxPrize */
  // Ensure maxPrize is an integer
  maxPrize = Math.round(maxPrize);
  
  const low  = [1, 5, 10, 20, 50, 90, 100, 200, 300, 500, 699, 900];
  
  // Make sure the highest value is exactly the maxPrize (not rounded)
  const high = Array.from({length:11}, (_,i)=> niceRound(maxPrize * ((i+1)/12)**2 ));
  // Add the exact maxPrize value as the highest value
  high.push(maxPrize);
  
  const set  = [...low, ...high].map(value => niceRound(Math.round(value)));
  return Array.from(new Set(set)).slice(0,24);
};

const distributeValues = (values) => {
  // Fisher-Yates shuffle algorithm for true randomness
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Get random index between 0 and i (inclusive)
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements at i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Create boxes with sequential IDs (1-24) but randomized values
  return shuffled.map((value, index) => ({ 
    id: index + 1, // Sequential IDs from 1-24
    value, 
    opened: false 
  }));
};

/*----------- reducer -----------*/
export function reducer(state, action) {
  switch(action.type){
    case ACTIONS.TOGGLE_SETTINGS:
      return {...state, showSettings: !state.showSettings };

    case ACTIONS.SET_MAX:
      return {...state, maxPrizePreset: action.value};
      
    case ACTIONS.SET_GEN_MODE:
      return {...state, generationMode: action.value};

    case ACTIONS.SET_PLAYER_BOX:
      return {
        ...state, 
        playerBoxId: action.boxId,
        openedCount: 0
      };

    case ACTIONS.START_GAME: {
      const values = generateValues(state.maxPrizePreset);
      const boxes  = distributeValues(values);
      return {
        ...state,
        phase:"playing",
        showSettings:false,
        boxes,
        playerBoxId: null,
        openedCount:0,
        pendingOffer:null,
        lastOffer:null,
        acceptedValue:null,
      };
    }

    case ACTIONS.OPEN_BOX: {
      if (state.phase !== "playing") return state;
      
      // Find the box that's being opened to track its value
      const openedBox = state.boxes.find(b => b.id === action.boxId);
      const openedValue = openedBox ? openedBox.value : 0;
      
      // Update boxes array
      const boxes = state.boxes.map(b => b.id === action.boxId ? {...b, opened:true} : b);
      const openedCount = state.openedCount + 1;
      
      // Calculate if the opened box was a high value
      const remainingValues = boxes.filter(b => !b.opened).map(b => b.value);
      const avgRemainingValue = remainingValues.length > 0 
        ? remainingValues.reduce((a,b) => a+b, 0) / remainingValues.length 
        : 0;
      const isHighValueBox = openedValue > avgRemainingValue * 1.5;
      
      let calculatedOffer = null;
      let bankerWillCall = false;
      
      if (state.bankerOffersEnabled && openedCount % state.roundsBetweenOffers === 0 && openedCount < boxes.length-1){
        const expected = avgRemainingValue;
        
        // More sophisticated banker algorithm with randomness
        // Base factor varies based on game progress
        const progress = openedCount / boxes.length;
        let factor = 0.4 + 0.5 * progress; // 0.4 → 0.9
        
        // Add randomness to the banker offer (sometimes generous, sometimes stingy)
        const randomFactor = 0.85 + (Math.random() * 0.3); // 0.85 - 1.15
        factor *= randomFactor;
        
        // If player recently lost a high value, banker might be more generous
        if (isHighValueBox) {
          factor *= 1.1; // 10% boost to make player feel better after a loss
        }
        
        calculatedOffer = Math.round(expected * Math.min(factor, 0.95));
        bankerWillCall = true; // Set flag that banker will call after a delay
      }

      // If only 2 boxes left, force the swap phase, but respect the isPreSwapBox flag
      // When isPreSwapBox is true, we don't immediately switch to swap phase
      // to allow the animation to play out
      const phase = (boxes.length - openedCount === 2 && !action.isPreSwapBox) ? "swap" : state.phase;
      
      // Special case for the pre-swap box (3rd last box)
      const isPreSwapReveal = boxes.length - openedCount === 2 && action.isPreSwapBox;

      return {
        ...state, 
        boxes, 
        openedCount, 
        calculatedOffer,
        bankerWillCall,
        pendingOffer: null, // Don't set pendingOffer yet, it will be set after delay
        phase,
        recentlyOpenedValue: openedValue, // Track recently opened value for banker messages
        playerBoxValue: state.playerBoxId ? state.boxes.find(b => b.id === state.playerBoxId)?.value : null,
        isPreSwapReveal, // Flag to indicate we're in the special pre-swap animation
        lastOpenedBoxId: action.boxId, // Always store last opened box ID
        lastOpenedBoxValue: openedValue, // Always store last opened box value
        lastOpenTime: Date.now() // Add timestamp of when box was opened
      };
    }

    case ACTIONS.ACCEPT_OFFER: {
      // Add current offer to history
      const offerHistory = [...(state.offerHistory || []), state.pendingOffer];
      return {
        ...state, 
        phase: "finished", 
        acceptedValue: state.pendingOffer, 
        lastOffer: state.pendingOffer, 
        pendingOffer: null,
        offerHistory
      };
    }

    case ACTIONS.DECLINE_OFFER: {
      // Add current offer to history
      const offerHistory = [...(state.offerHistory || []), state.pendingOffer];
      return {
        ...state, 
        lastOffer: state.pendingOffer, 
        pendingOffer: null,
        offerHistory
      };
    }

    case ACTIONS.SWAP_OR_KEEP: {
      const keep = action.keep;
      const playerBox = state.boxes.find(b => b.id === state.playerBoxId);
      const remainingId = state.boxes.find(b => !b.opened && b.id !== state.playerBoxId).id;
      const otherBox = state.boxes.find(b => b.id === remainingId);
      const finalBoxId = keep ? state.playerBoxId : remainingId;
      const finalValue = state.boxes.find(b => b.id === finalBoxId).value;
      
      // Determine if player made the optimal choice
      const madeOptimalChoice = (playerBox.value > otherBox.value && keep) || 
                               (otherBox.value > playerBox.value && !keep);
      
      // Determine if this is a high value win (>50% of max prize)
      const isHighValueWin = finalValue > (state.maxPrizePreset * 0.5);
      
      return {
        ...state, 
        phase: "finished", 
        acceptedValue: finalValue,
        swapDecision: !keep, // true if swapped, false if kept
        playerBoxId: state.playerBoxId, // Original player box ID
        playerBoxValue: playerBox.value, // Original player box value
        swappedBoxId: remainingId, // The other box ID
        swappedBoxValue: otherBox.value, // The other box value
        madeOptimalChoice,
        isHighValueWin
      };
    }

    case ACTIONS.RESET_GAME:
      return initialState;

    case ACTIONS.TOGGLE_BANKER_OFFERS:
      return {...state, bankerOffersEnabled: !state.bankerOffersEnabled};

    case ACTIONS.TRIGGER_BANKER_CALL:
      return {
        ...state,
        pendingOffer: state.calculatedOffer,
        bankerWillCall: false,
        calculatedOffer: null
      };

    default:
      return state;
  }
} 