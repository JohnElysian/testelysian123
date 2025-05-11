import { useCallback, useEffect, useRef } from 'react';
import { DEBUG } from '../utils/debug'; // Assuming debug.js is in src/utils

/**
 * Custom hook for drawing the prize wheel on a canvas.
 * @param {object} options - Configuration options.
 * @param {React.RefObject<HTMLCanvasElement>} options.canvasRef - Ref to the canvas element.
 * @param {Array<object>} options.entries - Array of wheel entries.
 * @param {number} options.wheelSizePercent - Percentage for overall wheel size.
 * @param {number} options.textSizePercent - Percentage for text size on segments.
 * @param {boolean} options.showTextShadows - Whether to draw text shadows.
 * @param {boolean} options.isVisible - Whether the wheel component is currently visible.
 * @param {boolean} options.isSpinning - Whether the wheel is currently in a fast spin animation.
 */
function useDrawWheel({
  canvasRef,
  entries,
  wheelSizePercent,
  textSizePercent,
  showTextShadows,
  isVisible,
  isSpinning, // To know if we should skip drawing when not visible & not spinning
}) {
  const drawingInProgressRef = useRef(false);

  // Calculate actual wheel size based on percentage. Memoize if wheelSizePercent can change frequently
  // For now, it's recalculated on each render of the hook, which is fine if WheelControls memoizes props.
  const actualWheelSize = Math.max(200, Math.round(1600 * (wheelSizePercent / 100)));

  const drawWheelLogic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      if (DEBUG) console.error('[useDrawWheel] No canvas element found!');
      return;
    }

    if (!isVisible && !isSpinning) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (DEBUG) console.log('[useDrawWheel] Wheel not visible and not spinning, clearing canvas and skipping draw.');
      return;
    }
    
    if (canvas.width !== actualWheelSize || canvas.height !== actualWheelSize) {
        canvas.width = actualWheelSize;
        canvas.height = actualWheelSize;
        if (DEBUG) console.log(`[useDrawWheel] Canvas dimensions updated to ${actualWheelSize}x${actualWheelSize}`);
    }

    if (drawingInProgressRef.current) {
      if (DEBUG) console.warn('[useDrawWheel] Draw already in progress, skipping.');
      return;
    }
    drawingInProgressRef.current = true;

    try {
      const ctx = canvas.getContext('2d', { alpha: true });
      const width = canvas.width;
      const height = canvas.height;

      if (width === 0 || height === 0) {
        if (DEBUG) console.error(`[useDrawWheel] Canvas dimensions are zero (${width}x${height}), cannot draw.`);
        drawingInProgressRef.current = false;
        return;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 10;
      
      ctx.clearRect(0, 0, width, height);
      
      const segments = Math.max(1, entries.length);
      const anglePerSegmentRadians = (Math.PI * 2) / segments;

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      
      for (let i = 0; i < segments; i++) {
        const startAngle = i * anglePerSegmentRadians - Math.PI / 2;
        const endAngle = startAngle + anglePerSegmentRadians;
        const drawToCenter = segments <= 300;

        ctx.beginPath();
        if (drawToCenter) {
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius - 6, startAngle, endAngle);
          ctx.lineTo(centerX, centerY);
        } else {
          const innerRadiusSegments = radius * 0.15;
          const innerStartX = centerX + Math.cos(startAngle) * innerRadiusSegments;
          const innerStartY = centerY + Math.sin(startAngle) * innerRadiusSegments;
          ctx.moveTo(innerStartX, innerStartY);
          ctx.arc(centerX, centerY, radius - 6, startAngle, endAngle);
          const innerEndX = centerX + Math.cos(endAngle) * innerRadiusSegments;
          const innerEndY = centerY + Math.sin(endAngle) * innerRadiusSegments;
          ctx.lineTo(innerEndX, innerEndY);
          ctx.arc(centerX, centerY, innerRadiusSegments, endAngle, startAngle, true);
        }
        ctx.closePath();
      
        const hue = (i * 137.508) % 360;
        const saturation = segments > 80 ? 80 : 70;
        const lightness = segments > 80 ? (i % 2 === 0 ? 50 : 40) : 45;
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fill();
        
        ctx.lineWidth = segments > 300 ? 0.3 : (segments > 200 ? 0.5 : (segments > 100 ? 0.75 : (segments > 50 ? 1 : 2)));
        ctx.strokeStyle = segments > 100 ? 'rgba(0,0,0,0.5)' : '#1a202c';
        ctx.stroke();
        
        if (i < entries.length) {
          const midAngle = startAngle + (anglePerSegmentRadians / 2);
          const textOuterRadius = radius * 0.85;
          const textInnerRadius = segments > 300 ? radius * 0.45 : radius * 0.35;
          const outerX = centerX + Math.cos(midAngle) * textOuterRadius;
          const outerY = centerY + Math.sin(midAngle) * textOuterRadius;
          const innerX = centerX + Math.cos(midAngle) * textInnerRadius;
          const innerY = centerY + Math.sin(midAngle) * textInnerRadius;
          const textAngle = Math.atan2(innerY - outerY, innerX - outerX);
          const diagonalLength = Math.sqrt(Math.pow(outerX - innerX, 2) + Math.pow(outerY - innerY, 2));
        
          const entry = entries[i];
          const displayName = entry.isSubscriber ? `⭐ ${entry.name}` : entry.name;
        
          ctx.save();
          const fontSize = Math.max(8, Math.round(16 * (textSizePercent / 100)));
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          if (showTextShadows && segments <= 75) {
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = segments <= 50 ? 4 : 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
          } else {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        
          const textWidth = ctx.measureText(displayName).width;
          const availableSpace = diagonalLength * 0.8;
          let finalText = displayName;

          if (textWidth > availableSpace && finalText.length > 3) {
            const ellipsis = '...';
            const ellipsisWidth = ctx.measureText(ellipsis).width;
            let truncatedText = '';
            let measuredWidth = 0;
            for (let j = 0; j < displayName.length; j++) {
              const char = displayName[j];
              const charWidth = ctx.measureText(char).width;
              if (measuredWidth + charWidth + ellipsisWidth <= availableSpace) {
                truncatedText += char;
                measuredWidth += charWidth;
              } else { break; }
            }
            finalText = truncatedText + ellipsis;
          }
        
          const textX = (outerX + innerX) / 2;
          const textY = (outerY + innerY) / 2;
          ctx.translate(textX, textY);
          ctx.rotate(textAngle);
          ctx.fillText(finalText, 0, 0);
          ctx.restore();
        }
      }
    } catch (error) {
      if (DEBUG) console.error('[useDrawWheel] Error during drawing:', error);
    } finally {
      drawingInProgressRef.current = false;
    }
  }, [canvasRef, entries, textSizePercent, showTextShadows, isVisible, isSpinning, actualWheelSize]);

  useEffect(() => {
    if (isVisible) {
      const canvas = canvasRef.current;
      if (canvas) {
        if (canvas.width !== actualWheelSize || canvas.height !== actualWheelSize) {
            canvas.width = actualWheelSize;
            canvas.height = actualWheelSize;
            if (DEBUG) console.log(`[useDrawWheel effect] Canvas dimensions updated to ${actualWheelSize}x${actualWheelSize} before drawing.`);
        }
        drawWheelLogic();
      }
    } else if (!isSpinning) {
        const canvas = canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
  }, [isVisible, entries, wheelSizePercent, textSizePercent, showTextShadows, drawWheelLogic, isSpinning, actualWheelSize]);
}

export default useDrawWheel; 