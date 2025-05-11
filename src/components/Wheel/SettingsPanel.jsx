import React from 'react';
import styled from 'styled-components';
import { Gauge, Settings } from 'lucide-react';
import Button from '../ui/Button'; // Assuming Button component exists in ../ui/

// Styled components (copied and adapted from WheelControls.js)
const StyledSettingsPanel = styled.div`
  position: fixed;
  top: 70px;
  right: 20px;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 8px;
  padding: 1rem;
  width: 250px;
  max-height: 85vh;
  overflow-y: auto;
  backdrop-filter: blur(5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(139, 92, 246, 0.2);
  animation: fadeInScale 0.2s ease-out;
  z-index: 9999;
  display: ${props => props.isVisible ? 'block' : 'none'};

  h4 {
    margin: 0 0 0.75rem 0;
    color: white;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const SettingsRow = styled.div`
  margin-bottom: 1.25rem;
  
  .setting-label {
    color: white;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    display: block;
  }
`;

const SizeSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  position: relative;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
  }
`;

const SizeLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const SettingsFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const PresetButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  margin: 0.25rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

/**
 * Renders the settings panel for the wheel.
 * @param {object} props - Component props.
 * @param {boolean} props.isVisible - Whether the panel is visible.
 * @param {object} props.settings - Current settings state.
 * @param {function} props.dispatch - Reducer dispatch function.
 * @param {function} props.onClose - Function to close the panel.
 * @param {boolean} props.isSpinning - Whether the wheel is currently spinning.
 */
function SettingsPanel({ isVisible, settings, dispatch, onClose, isSpinning }) {
  const handleSettingChange = (setting, value) => {
    dispatch({ type: 'UPDATE_SETTING', payload: { setting, value } });
  };

  return (
    <StyledSettingsPanel isVisible={isVisible}>
      <h4>
        <Gauge size={16} />
        <span>Wheel Size Settings</span>
      </h4>

      {/* Wheel Size */}
      <SettingsRow>
        <div className="setting-label">
          Wheel Size: <strong>{settings.wheelSize}%</strong>
        </div>
        <SizeSlider 
          type="range" 
          min="50" 
          max="600" 
          value={settings.wheelSize}
          onChange={(e) => handleSettingChange('wheelSize', parseInt(e.target.value, 10))}
        />
        <SizeLabels>
          <span>Small</span>
          <span>Full Panel</span>
        </SizeLabels>
      </SettingsRow>
      
      {/* Text Size */}
      <SettingsRow>
        <div className="setting-label">
          Text Size: <strong>{settings.textSize}%</strong>
        </div>
        <SizeSlider 
          type="range" 
          min="50" 
          max="300" 
          value={settings.textSize}
          onChange={(e) => handleSettingChange('textSize', parseInt(e.target.value, 10))}
        />
        <SizeLabels>
          <span>Small Text</span>
          <span>Large Text</span>
        </SizeLabels>
      </SettingsRow>

      {/* Center Hub Size */}
      <SettingsRow>
        <div className="setting-label">
          Center Hub Size: <strong>{settings.centerSize}%</strong>
        </div>
        <SizeSlider 
          type="range" 
          min="50" 
          max="300" 
          value={settings.centerSize}
          onChange={(e) => handleSettingChange('centerSize', parseInt(e.target.value, 10))}
        />
        <SizeLabels>
          <span>Small Hub</span>
          <span>Large Hub</span>
        </SizeLabels>
      </SettingsRow>

      {/* Trigger Word (new setting) */}
      <SettingsRow>
        <div className="setting-label">
          Chat Trigger Word:
        </div>
        <input 
          type="text" 
          value={settings.triggerWord}
          onChange={(e) => handleSettingChange('triggerWord', e.target.value)}
          style={{ 
            width: '100%', 
            padding: '0.5rem', 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            borderRadius: '4px', 
            color: 'white' 
          }}
          placeholder="Enter trigger word (e.g. !spin)"
        />
        <label style={{display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'0.5rem'}}>
          <input
            type="checkbox"
            checked={settings.useTriggerWord}
            onChange={e => dispatch({ type:'UPDATE_SETTING', payload:{ setting:'useTriggerWord', value:e.target.checked }})}
            disabled={isSpinning}
          />
          Use trigger word (otherwise every chat message earns an entry)
        </label>
        <div style={{ 
          fontSize: '0.8rem', 
          marginTop: '0.25rem', 
          color: 'rgba(255,255,255,0.6)' 
        }}>
          Used in chat mode to trigger entries
        </div>
      </SettingsRow>

      {/* Spin Duration */}
      <SettingsRow>
        <div className="setting-label">Spin Duration: <strong>{settings.spinDuration}s</strong></div>
        <SizeSlider 
          type="range" 
          min="5"
          max="30"
          step="1"
          value={settings.spinDuration}
          onChange={(e) => handleSettingChange('spinDuration', parseInt(e.target.value, 10))}
        />
        <SizeLabels>
          <span>Short (5s)</span>
          <span>Long (30s)</span>
        </SizeLabels>
      </SettingsRow>
      
      {/* Likes Per Entry */}
      <SettingsRow>
        <div className="setting-label">
          Likes Per Entry: <strong>{settings.likesPerEntry}</strong>
        </div>
        <SizeSlider 
          type="range" 
          min="1" 
          max="1000" 
          step="10"
          value={settings.likesPerEntry}
          onChange={(e) => handleSettingChange('likesPerEntry', parseInt(e.target.value, 10))}
          disabled={isSpinning}
        />
        <SizeLabels>
          <span>1 Like</span>
          <span>1000 Likes</span>
        </SizeLabels>
      </SettingsRow>
      
      {/* Coins Per Entry */}
      <SettingsRow>
        <div className="setting-label">
          Coins Per Entry: <strong>{settings.coinsPerEntry}</strong>
        </div>
        <SizeSlider 
          type="range" 
          min="1" 
          max="1000" 
          step="1"
          value={settings.coinsPerEntry}
          onChange={(e) => handleSettingChange('coinsPerEntry', parseInt(e.target.value, 10))}
          disabled={isSpinning}
        />
        <SizeLabels>
          <span>1 Coin</span>
          <span>1000 Coins</span>
        </SizeLabels>
        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[10, 50, 100, 500, 1000].map(val => (
            <PresetButton 
              key={val} 
              onClick={() => handleSettingChange('coinsPerEntry', val)} 
              disabled={isSpinning}
            >
              {val}
            </PresetButton>
          ))}
        </div>
      </SettingsRow>

      {/* Show Text Shadows Toggle */}
      <SettingsRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label htmlFor="shadowTogglePanel" className="setting-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
          Show Text Shadows
        </label>
        <input 
          type="checkbox" 
          id="shadowTogglePanel"
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)'}}
          checked={settings.showTextShadows}
          onChange={(e) => handleSettingChange('showTextShadows', e.target.checked)}
        />
      </SettingsRow>

      {/* Show Entry List Toggle */}
      <SettingsRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <label htmlFor="showEntryListTogglePanel" className="setting-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
          Show Entry List
        </label>
        <input 
          type="checkbox" 
          id="showEntryListTogglePanel"
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)'}}
          checked={settings.showEntryList}
          onChange={(e) => handleSettingChange('showEntryList', e.target.checked)}
        />
      </SettingsRow>

      {/* Shuffle Entries Toggle */}
      <SettingsRow style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
        <label htmlFor="shuffleEntriesTogglePanel" className="setting-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
          Shuffle Entries on Spin
        </label>
        <input
          type="checkbox"
          id="shuffleEntriesTogglePanel"
          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)'}}
          checked={settings.shuffleEntriesOnSpin}
          onChange={(e) => handleSettingChange('shuffleEntriesOnSpin', e.target.checked)}
        />
      </SettingsRow>

      {/* Auto Spin Timer */}
      <SettingsRow>
        <label className="setting-label">Auto Spin Timer (mm:ss)</label>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="number" 
            min="0" 
            max="59" 
            value={settings.autoSpinMinutes}
            onChange={(e) => handleSettingChange('autoSpinMinutes', parseInt(e.target.value, 10) || 0)}
            style={{ width: '50px', padding: '0.3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}
            disabled={isSpinning} // Should use isAutoSpinActive from parent state?
          />
          <span>:</span>
          <input 
            type="number" 
            min="0" 
            max="59" 
            value={settings.autoSpinSeconds}
            onChange={(e) => handleSettingChange('autoSpinSeconds', Math.min(59, parseInt(e.target.value, 10) || 0))}
            style={{ width: '50px', padding: '0.3rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'white' }}
            disabled={isSpinning} // Should use isAutoSpinActive from parent state?
          />
        </div>
      </SettingsRow>

      <SettingsFooter>
        <Button onClick={onClose}>
          Close
        </Button>
      </SettingsFooter>
    </StyledSettingsPanel>
  );
}

export default SettingsPanel; 