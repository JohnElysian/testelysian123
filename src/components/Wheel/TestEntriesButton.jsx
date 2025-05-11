import React from 'react';
import styled from 'styled-components';

const StyledButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  background: rgba(139, 92, 246, 0.9);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;

  &:hover {
    background: rgba(139, 92, 246, 1);
  }
`;

/**
 * A simple button component to add test entries to the wheel.
 * @param {object} props - Component props.
 * @param {function} props.onClick - Function to call when the button is clicked.
 */
function TestEntriesButton({ onClick }) {
  return (
    <StyledButton id="wheelTestBtn" onClick={onClick}>
      🎡 Add 10 Test Entries
    </StyledButton>
  );
}

export default TestEntriesButton; 