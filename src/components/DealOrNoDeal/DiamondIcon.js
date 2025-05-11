import React from "react";

const DiamondIcon = ({ size = 16, color = "currentColor", className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`diamond-icon ${className}`}
    >
      <path d="M2.7 10.8l8.5-8.5c.4-.4 1-.4 1.4 0l8.5 8.5c.4.4.4 1 0 1.4l-8.5 8.5c-.4.4-1 .4-1.4 0l-8.5-8.5c-.4-.4-.4-1 0-1.4z" fill="#1f9cf0" stroke="rgba(255, 255, 255, 0.5)" />
    </svg>
  );
};

export default DiamondIcon; 