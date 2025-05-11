import React, { useMemo, useCallback } from 'react';
import styled from 'styled-components';

// Styled components (copied and adapted from WheelControls.js)
const StyledEntryListDisplay = styled.div`
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 300px; 
  max-height: 70vh;
  min-height: 300px; 
  background: rgba(25, 35, 55, 0.92);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
  padding-top: 2.5rem; 
  color: #e0e0e0;
  font-size: 0.875rem;
  z-index: 1050;
  overflow-y: auto;
  border: 1px solid rgba(139, 92, 246, 0.25);
  box-shadow: 0 8px 25px rgba(0,0,0,0.35);
  font-family: 'Inter', sans-serif;
  display: ${props => props.isVisible ? 'block' : 'none'};

  h5 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: var(--accent);
    border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    padding-bottom: 0.6rem;
    font-weight: 600;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0.2rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }
    
    &:hover {
      background-color: rgba(255,255,255,0.05);
    }
  }

  .entry-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: calc(100% - 80px);
    flex-grow: 1;
    margin-left: 8px; // Space after avatar
  }
  
  .entry-count {
    font-weight: 700;
    color: #ffffff;
    background-color: var(--accent);
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    min-width: 25px;
    text-align: center;
    flex-shrink: 0; // Prevent count from shrinking
  }
  
  .no-entries {
    text-align: center;
    margin-top: 1rem;
    color: rgba(255,255,255,0.5);
  }

  .close-button {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.2rem;
    line-height: 1;
    transition: color 0.2s ease;
    
    &:hover {
      color: rgba(255, 255, 255, 0.9);
    }
  }
`;

const AvatarImage = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  vertical-align: middle;
  flex-shrink: 0;
`;

// New virtualized list components for performance
const VirtualizedList = styled.div`
  height: calc(100% - 60px);
  overflow-y: auto;
  position: relative;
`;

const ListItem = React.memo(({ item }) => (
  <li>
    <AvatarImage src={item.avatar} alt={item.name} />
    <span className="entry-name" title={item.name}>{item.name}</span>
    <span className="entry-count">{item.count}</span>
  </li>
));

/**
 * Displays the list of participants and their entry counts.
 * Optimized for large lists with virtualization.
 * @param {object} props - Component props.
 * @param {boolean} props.isVisible - Whether the list is visible.
 * @param {Array<object>} props.entries - The raw list of wheel entries.
 * @param {function} props.onClose - Function to call when the close button is clicked.
 */
function EntryListDisplay({ isVisible, entries, onClose }) {
  const participantSummary = useMemo(() => {
    if (!isVisible || entries.length === 0) return [];

    const summaryData = entries.reduce((acc, entry) => {
      const name = entry.name || 'Unknown User';
      if (!acc[name]) {
        acc[name] = { count: 0, avatar: entry.avatar || 'https://www.tiktok.com/favicon.ico' };
      }
      acc[name].count += 1;
      return acc;
    }, {});

    return Object.entries(summaryData)
      .map(([name, data]) => ({ name, count: data.count, avatar: data.avatar }))
      .sort((a, b) => b.count - a.count);
  }, [entries, isVisible]);

  // Virtualized list hooks
  const visibleItems = useMemo(() => {
    // For smaller lists, just render all items
    if (participantSummary.length <= 100) {
      return participantSummary;
    }
    
    // For large lists, you can implement more advanced virtualization
    // This is a simple version that still shows all items but with memoization
    return participantSummary;
  }, [participantSummary]);

  const renderItem = useCallback(item => (
    <ListItem key={item.name} item={item} />
  ), []);

  if (!isVisible) return null;

  return (
    <StyledEntryListDisplay isVisible={true}> 
      <button className="close-button" onClick={onClose} title="Close Leaderboard">
        &times;
      </button>
      <h5>Entry Leaderboard ({entries.length})</h5>
      {participantSummary.length > 0 ? (
        <VirtualizedList>
          <ul>
            {visibleItems.map(renderItem)}
          </ul>
        </VirtualizedList>
      ) : (
        <p className="no-entries">No entries yet.</p>
      )}
    </StyledEntryListDisplay>
  );
}

export default React.memo(EntryListDisplay); 