import React, { useReducer, useEffect } from "react";
import styled from "styled-components";
import GameBoard from "./GameBoard";
import SettingsModal from "./SettingsModal";
import OfferModal from "./OfferModal";
import EndModal from "./EndModal";
import SwapOrKeepModal from "./SwapOrKeepModal";
import { reducer, initialState, ACTIONS } from "./gameReducer";

/* ---------- styled container ---------- */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 80vh;
  width: 100%;
  gap: 1.25rem;
  padding: 1.5rem;
  position: relative;
  z-index: 2;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
`;

/* ---------- main component ---------- */
const DealOrNoDealTab = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Add delay for banker call to allow animations to complete
  useEffect(() => {
    if (state.bankerWillCall) {
      // Reduced delay to 1 second (from 2 seconds)
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS.TRIGGER_BANKER_CALL });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.bankerWillCall]);

  return (
    <Wrapper>
      <GameBoard state={state} dispatch={dispatch} />
      {state.showSettings && <SettingsModal state={state} dispatch={dispatch} />}
      {state.pendingOffer !== null && <OfferModal state={state} dispatch={dispatch} />}
      {state.phase === "swap" && <SwapOrKeepModal state={state} dispatch={dispatch} />}
      {state.phase === "finished" && <EndModal state={state} dispatch={dispatch} />}
    </Wrapper>
  );
};

export default DealOrNoDealTab; 