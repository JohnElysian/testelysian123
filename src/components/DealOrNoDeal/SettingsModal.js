import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ACTIONS } from "./gameReducer";

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  will-change: opacity;
  transform: translateZ(0);
`;

const Panel = styled(motion.div)`
  background: rgba(17, 24, 39, 0.98);
  padding: 2rem;
  border-radius: var(--radius);
  min-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border: 1px solid rgba(139, 92, 246, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  transform: translateZ(0);
  will-change: transform;
  backface-visibility: hidden;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.65rem;
  background: rgba(15, 23, 42, 0.6);
  color: var(--text);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
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

const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  
  label {
    font-weight: 500;
    color: var(--text-secondary);
    font-size: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ToggleSwitch = styled.div`
  width: 44px;
  height: 22px;
  background: ${props => props.checked ? 'var(--accent)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 11px;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
  
  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '24px' : '2px'};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: white;
    transition: all 0.3s;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem;
  background: rgba(15, 23, 42, 0.6);
  color: var(--text);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--accent);
  }
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  
  label {
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

// Add styles for disabled options
const StyledOption = styled.option`
  &:disabled {
    color: rgba(150, 150, 150, 0.5);
    font-style: italic;
  }
`;

const SettingsModal = ({ state, dispatch }) => {
  // Fixed presets array - removed 500 option
  const presets = [1000, 5000, 10000, 15000, 25000, 44999];
  const [customMaxPrize, setCustomMaxPrize] = useState("");
  const [useCustomValue, setUseCustomValue] = useState(false);
  const [error, setError] = useState("");
  
  // Track if the easter egg is unlocked
  const [easterEggUnlocked, setEasterEggUnlocked] = useState(false);
  
  const MIN_MAX_PRIZE = 1000; // Minimum value for the max prize
  const EASTER_EGG_VALUE = 1111; // Exact value to unlock the easter egg
  
  // In case the state was initialized with 49999, use the correct preset
  // This helps during transition to the new presets
  useEffect(() => {
    if (state.maxPrizePreset === 49999) {
      dispatch({ type: ACTIONS.SET_MAX, value: 44999 });
    }
  }, []);
  
  // Check if the max prize is exactly the easter egg value
  useEffect(() => {
    setEasterEggUnlocked(state.maxPrizePreset === EASTER_EGG_VALUE);
    
    // If easter egg is locked but generation mode is lazy, reset to pre
    if (!easterEggUnlocked && state.generationMode === "lazy") {
      dispatch({ type: ACTIONS.SET_GEN_MODE, value: "pre" });
    }
  }, [state.maxPrizePreset]);
  
  const handleCustomValueChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomMaxPrize(value);
    setError("");
    
    if (value) {
      const numValue = parseInt(value, 10);
      if (numValue > 0) {
        if (numValue < MIN_MAX_PRIZE) {
          setError(`Value must be at least ${MIN_MAX_PRIZE.toLocaleString()} diamonds`);
          return;
        }
        
        dispatch({ type: ACTIONS.SET_MAX, value: numValue });
        setUseCustomValue(true);
        
        // Check for easter egg
        setEasterEggUnlocked(numValue === EASTER_EGG_VALUE);
      }
    }
  };
  
  const handlePresetChange = (e) => {
    dispatch({ type: ACTIONS.SET_MAX, value: +e.target.value });
    setUseCustomValue(false);
    setError("");
    
    // Check for easter egg
    setEasterEggUnlocked(+e.target.value === EASTER_EGG_VALUE);
  };
  
  const handleGenerationModeChange = (e) => {
    // Only allow changing to "lazy" if easter egg is unlocked
    if (e.target.value === "lazy" && !easterEggUnlocked) {
      return;
    }
    
    dispatch({ type: ACTIONS.SET_GEN_MODE, value: e.target.value });
  };

  return (
    <Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e) => e.stopPropagation()}
    >
      <Panel initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
        <h2 style={{ margin: 0, color: "var(--accent)", textAlign: "center" }}>
          Deal or No Deal – Settings
        </h2>

        <FormGroup>
          <label>Max prize preset</label>
          <Select
            value={useCustomValue ? "" : state.maxPrizePreset}
            onChange={handlePresetChange}
          >
            <option value="" disabled={!useCustomValue}>Select a preset</option>
            {presets.map((p) => (
              <option key={p} value={p}>
                {p.toLocaleString()} diamonds
              </option>
            ))}
          </Select>
          
          <InputGroup>
            <label>Custom:</label>
            <Input
              type="text"
              placeholder="Enter custom value"
              value={customMaxPrize}
              onChange={handleCustomValueChange}
            />
          </InputGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <label>Box generation mode</label>
          <Select
            value={state.generationMode}
            onChange={handleGenerationModeChange}
          >
            <option value="pre">Pre-deal (fixed at start)</option>
            <StyledOption 
              value="lazy" 
              disabled={!easterEggUnlocked}
            >
              On reveal (random each click)
            </StyledOption>
          </Select>
          
          <ToggleRow>
            <label htmlFor="banker-toggle">
              Enable Banker Offers
            </label>
            <ToggleSwitch 
              checked={state.bankerOffersEnabled} 
              onClick={() => dispatch({ type: ACTIONS.TOGGLE_BANKER_OFFERS })}
              id="banker-toggle"
            />
          </ToggleRow>
        </FormGroup>

        <Button onClick={() => dispatch({ type: ACTIONS.START_GAME })}>
          Start Game
        </Button>
      </Panel>
    </Backdrop>
  );
};

export default SettingsModal; 