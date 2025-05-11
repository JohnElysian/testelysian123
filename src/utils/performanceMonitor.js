/**
 * Utility for monitoring performance metrics of the wheel animation
 * and other critical functionality.
 */

// Performance constants
const FRAME_RATE_THRESHOLD = 45; // fps - below this we consider performance degraded
const FRAME_SAMPLE_SIZE = 60;    // number of frames to sample for average calculation
const MIN_RENDER_TIME = 16;      // ideal frame time in ms (60fps)

// Internal state
let isMonitoring = false;
let frameRateData = [];
let lastFrameTime = 0;
let frameCount = 0;
let lowPerformanceCount = 0;
let monitoringInterval = null;

/**
 * Start monitoring performance metrics
 * @param {Object} options - Configuration options 
 * @param {number} options.interval - Polling interval in ms (default 2000ms)
 * @param {Function} options.onWarning - Callback when performance issues are detected
 * @returns {Function} Function to stop monitoring
 */
export function startPerformanceMonitoring({ interval = 2000, onWarning } = {}) {
  if (isMonitoring) return stopPerformanceMonitoring;
  
  isMonitoring = true;
  frameRateData = [];
  lastFrameTime = performance.now();
  frameCount = 0;
  lowPerformanceCount = 0;
  
  // Set up RAF monitoring
  const monitorFrame = (timestamp) => {
    if (!isMonitoring) return;
    
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    
    // Calculate instantaneous FPS
    const fps = 1000 / delta;
    
    // Add to data buffer
    frameRateData.push(fps);
    if (frameRateData.length > FRAME_SAMPLE_SIZE) {
      frameRateData.shift();
    }
    
    frameCount++;
    
    // Track low performance frames
    if (fps < FRAME_RATE_THRESHOLD) {
      lowPerformanceCount++;
    }
    
    // Continue monitoring
    requestAnimationFrame(monitorFrame);
  };
  
  // Start the monitor loop
  requestAnimationFrame(monitorFrame);
  
  // Set up status reporting interval
  monitoringInterval = setInterval(() => {
    if (!isMonitoring) return;
    
    if (frameRateData.length === 0) return;
    
    // Calculate metrics
    const averageFps = frameRateData.reduce((sum, fps) => sum + fps, 0) / frameRateData.length;
    const minFps = Math.min(...frameRateData);
    const maxFps = Math.max(...frameRateData);
    const lowPerformanceRatio = lowPerformanceCount / frameCount;
    
    // Performance warning conditions
    const isLowPerformance = averageFps < FRAME_RATE_THRESHOLD || lowPerformanceRatio > 0.1;
    
    // Create performance report
    const performanceReport = {
      timestamp: new Date().toISOString(),
      averageFps,
      minFps,
      maxFps,
      lowPerformanceRatio,
      lowPerformanceCount,
      totalFrames: frameCount,
      isLowPerformance
    };
    
    // Reset counters for next interval
    lowPerformanceCount = 0;
    frameCount = 0;
    
    // Dispatch event for components to listen to
    const event = new CustomEvent('wheel-framerate', { 
      detail: { 
        fps: averageFps,
        isLowPerformance,
        ...performanceReport 
      } 
    });
    window.dispatchEvent(event);
    
    // Call warning callback if performance is low
    if (isLowPerformance && typeof onWarning === 'function') {
      onWarning(performanceReport);
    }
    
    // Log performance issues in development
    if (process.env.NODE_ENV !== 'production' && isLowPerformance) {
      console.warn('Performance warning:', performanceReport);
    }
    
  }, interval);
  
  return stopPerformanceMonitoring;
}

/**
 * Stop performance monitoring
 */
export function stopPerformanceMonitoring() {
  isMonitoring = false;
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
}

/**
 * Get the current performance metrics
 * @returns {Object} Current performance metrics
 */
export function getPerformanceMetrics() {
  if (frameRateData.length === 0) {
    return {
      averageFps: 0,
      minFps: 0,
      maxFps: 0,
      isMonitoring,
      sampleSize: 0
    };
  }
  
  const averageFps = frameRateData.reduce((sum, fps) => sum + fps, 0) / frameRateData.length;
  
  return {
    averageFps,
    minFps: Math.min(...frameRateData),
    maxFps: Math.max(...frameRateData),
    isMonitoring,
    sampleSize: frameRateData.length
  };
}

// Helper function to measure a function's execution time
export function measureExecution(fn, label = 'Execution') {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const executionTime = performance.now() - start;
    
    if (executionTime > MIN_RENDER_TIME) {
      console.warn(`[Performance] ${label} took ${executionTime.toFixed(2)}ms (exceeds ${MIN_RENDER_TIME}ms target)`);
    }
    
    return result;
  };
}

export default {
  startPerformanceMonitoring,
  stopPerformanceMonitoring,
  getPerformanceMetrics,
  measureExecution
}; 