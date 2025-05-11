import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --bg: #111827;
    --card-bg: rgba(17, 24, 39, 0.8);
    --card-bg-lighter: rgba(31, 41, 55, 0.8);
    --text: #f1f5f9;
    --text-secondary: #cbd5e1;
    --accent: #8b5cf6;
    --accent-light: #a78bfa;
    --accent-dark: #7c3aed;
    --border: rgba(148, 163, 184, 0.15);
    --shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.2);
    --radius: 16px;
    --radius-sm: 8px;
    --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --anim-duration: 0.5s;
    --wheel-title-bg: rgba(15, 23, 42, 0.8);
    --wheel-text: #f1f5f9;
    --wheel-content-bg: rgba(15, 23, 42, 0.8);
  }

  [data-theme="light"] {
    --bg: #f8fafc;
    --card-bg: rgba(255, 255, 255, 0.85);
    --card-bg-lighter: rgba(248, 250, 252, 0.9);
    --text: #1e293b;
    --text-secondary: #64748b;
    --border: rgba(0, 0, 0, 0.05);
    --shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
    --wheel-title-bg: rgba(255, 255, 255, 0.95);
    --wheel-text: #1e293b;
    --wheel-content-bg: rgba(255, 255, 255, 0.85);
  }

  /* Reset */
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 100%; height: 100%; scroll-behavior: smooth; }
  
  body { 
    font-family: var(--font-sans);
    background: var(--bg);
    color: var(--text);
    overflow-x: hidden;
    line-height: 1.6;
    background-image: 
      radial-gradient(circle at 15% 15%, rgba(124, 58, 237, 0.15) 0%, transparent 45%),
      radial-gradient(circle at 85% 85%, rgba(124, 58, 237, 0.12) 0%, transparent 45%);
    background-attachment: fixed;
  }
  
  a { color: var(--accent); text-decoration: none; transition: var(--transition); }
  a:hover { color: var(--accent-light); }
  button, input { font-family: inherit; }
  
  #root {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }
  
  /* Animation Keyframes */
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes fadeInScale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 5px 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 5px 30px rgba(139, 92, 246, 0.5); }
  }
  
  @keyframes cornerPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.5; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }
  
  @keyframes ticker-bounce {
    0% { transform: translateY(0) translateX(-50%); }
    25% { transform: translateY(4px) translateX(-50%) scale(1.05); }
    50% { transform: translateY(2px) translateX(-50%) scale(1.02); }
    100% { transform: translateY(0) translateX(-50%) scale(1); }
  }
  
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
`;

export default GlobalStyles; 