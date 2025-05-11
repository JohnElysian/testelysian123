import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { ACTIONS } from "./gameReducer";
import DiamondIcon from "./DiamondIcon";

const drumroll = keyframes`
  0% { transform: scale(1); }
  20% { transform: scale(1.03); }
  40% { transform: scale(1); }
  60% { transform: scale(1.03); }
  80% { transform: scale(1); }
  100% { transform: scale(1.05); }
`;

const phoneRing = keyframes`
  0% { transform: rotate(-10deg); }
  25% { transform: rotate(10deg); }
  50% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
  100% { transform: rotate(0deg); }
`;

const countUp = keyframes`
  0% { opacity: 0.7; transform: scale(0.95); }
  100% { opacity: 1; transform: scale(1); }
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  
  pointer-events: auto;
`;

const Panel = styled(motion.div)`
  background: rgba(17, 24, 39, 0.95);
  padding: 2rem;
  border-radius: var(--radius);
  width: 380px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  pointer-events: auto;
`;

const OfferAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  margin: 1rem 0;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: ${props => props.revealing ? drumroll : countUp} 1s forwards;
`;

const CountingOfferAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent);
  margin: 1rem 0;
  text-shadow: 0 0 10px rgba(139, 92, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  animation: ${drumroll} 3s forwards;
`;

const PhoneIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  animation: ${phoneRing} 1s ease-in-out;
`;

const LastOpenedBox = styled.div`
  background: rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-sm);
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  .box-number {
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  .box-value {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 1.3rem;
    font-weight: 700;
    color: ${props => props.isHighValue ? 'rgba(220, 38, 38, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
  }
`;

const BankerMessage = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-style: italic;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    top: -10px;
    left: 20px;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-bottom: 10px solid rgba(255, 255, 255, 0.1);
  }
`;

const PreviousOffers = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  margin-top: 0.5rem;
  
  h4 {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    opacity: 0.8;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }
  
  li {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    background: rgba(255, 255, 255, 0.1);
    padding: 0.3rem 0.5rem;
    border-radius: var(--radius-sm);
    gap: 0.3rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  background: ${(props) => (props.accept ? "var(--accent)" : "transparent")};
  border: ${(props) =>
    props.accept ? "none" : "1px solid rgba(255, 255, 255, 0.2)"};
  border-radius: var(--radius-sm);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${(props) =>
      props.accept
        ? "var(--accent)"
        : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ValueListsWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 120px 1fr 120px;
  padding: 1.5rem;
  pointer-events: none;
  z-index: -1;
  
  @media (max-width: 1000px) {
    display: none;
  }
`;

const ValuesCol = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  justify-content: center;
  pointer-events: none;
  opacity: 0.9;
`;

const ValueItem = styled.li`
  padding: 0.5rem 0.6rem;
  text-align: center;
  border-radius: var(--radius-sm);
  font-weight: 600;
  background: ${({ side }) =>
    side === "left" ? "rgba(30,64,175,.25)" : "rgba(220,38,38,.25)"};
  text-decoration: ${({ opened }) => (opened ? "line-through" : "none")};
  opacity: ${({ opened }) => (opened ? 0.35 : 1)};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  
  .diamond-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-right: 4px;
  }
`;

const OfferModal = ({ state, dispatch }) => {
  const [offerState, setOfferState] = useState('ringing'); // ringing, message, counting, offer, deciding
  const [countValue, setCountValue] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  
  // Prepare the value lists for display
  const sorted = [...state.boxes].sort((a, b) => a.value - b.value);
  const half = Math.ceil(sorted.length / 2);
  
  // Function to render value list similar to GameBoard
  const renderValueList = (list, side) => (
    <ValuesCol side={side}>
      {list.map((box) => (
        <ValueItem key={box.value} opened={box.opened} side={side}>
          <span className="diamond-wrapper">
            <DiamondIcon size={14} />
          </span>
          {Math.round(box.value).toLocaleString()}
        </ValueItem>
      ))}
    </ValuesCol>
  );
  
  useEffect(() => {
    // Sequence: phone ring -> banker speaks -> count up offer -> reveal final offer
    const ringingTimer = setTimeout(() => {
      setOfferState('message');
      
      const messageTimer = setTimeout(() => {
        setOfferState('counting');
        setIsCounting(true);
        
        // After counting completes, show the final offer
        const offerTimer = setTimeout(() => {
          setOfferState('offer');
          setIsCounting(false);
        }, 3000);
        
        return () => clearTimeout(offerTimer);
      }, 5000); // Doubled from 2500 to 5000 ms to give more time to read banker messages
      
      return () => clearTimeout(messageTimer);
    }, 1500);
    
    return () => clearTimeout(ringingTimer);
  }, []);
  
  // Create dramatic count-up animation for offer amount
  useEffect(() => {
    if (offerState !== 'counting' || !state.pendingOffer) return;
    
    // Start counting from a small value
    const finalValue = Math.round(state.pendingOffer);
    const duration = 2000; // 2 seconds for count up (reduced from 2500)
    const steps = 12; // Reduced from 15 for faster counting
    const interval = duration / steps;
    let currentStep = 0;
    
    // Starting value is approximately 10% of the final value
    setCountValue(Math.max(Math.floor(finalValue * 0.1), 1));
    
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        setCountValue(finalValue);
        return;
      }
      
      // Calculate intermediate values with exponential growth
      // Use a curve that grows slowly at first then accelerates
      // Increase the exponent for a steeper curve toward the end
      const progress = (currentStep / steps) ** 2.0; // Increased from 1.8 for steeper curve
      let targetValue = Math.floor(finalValue * progress);
      
      // For high values, accelerate even more in the final steps
      if (finalValue > 10000 && currentStep > steps * 0.75) {
        // Add extra acceleration in final 25% of steps
        targetValue = Math.floor(finalValue * (0.9 + (currentStep / steps) * 0.1));
      }
      
      setCountValue(targetValue);
    }, interval);
    
    return () => clearInterval(timer);
  }, [offerState, state.pendingOffer]);
  
  const handleDecision = (accept) => {
    setOfferState('deciding');
    
    // Add suspense before actual decision
    setTimeout(() => {
      if (accept) {
        dispatch({ type: ACTIONS.ACCEPT_OFFER });
      } else {
        dispatch({ type: ACTIONS.DECLINE_OFFER });
      }
    }, 1000);
  };
  
  // Get a message based on the game state and progress
  const getBankerMessage = () => {
    // Analyze the game state to determine if player is doing well or poorly
    const remainingValues = state.boxes ? state.boxes.filter(box => !box.opened).map(box => box.value) : [];
    const maxRemainingValue = Math.max(...remainingValues);
    const minRemainingValue = Math.min(...remainingValues);
    const avgRemainingValue = remainingValues.reduce((sum, val) => sum + val, 0) / remainingValues.length;
    const playerHasHighValueBox = state.playerBoxValue > avgRemainingValue;
    const isFirstOffer = !state.offerHistory || state.offerHistory.length === 0;
    const isLateGame = state.boxes ? state.boxes.filter(box => box.opened).length > (state.boxes.length * 0.6) : false;
    const closeToEndGame = state.boxes ? state.boxes.filter(box => !box.opened).length <= 5 : false;
    const veryCloseToEndGame = state.boxes ? state.boxes.filter(box => !box.opened).length <= 3 : false;
    
    // Check if a top value was recently opened
    const allValues = state.boxes.map(box => box.value);
    const sortedValues = [...allValues].sort((a, b) => b - a); // Sort in descending order
    const topThreeValues = sortedValues.slice(0, 3);
    const topTwoValues = sortedValues.slice(0, 2);
    const recentlyLostHighValue = state.recentlyOpenedValue > avgRemainingValue * 1.5;
    const recentlyLostVeryHighValue = state.recentlyOpenedValue > avgRemainingValue * 3;
    const recentlyLostTopValue = topThreeValues.includes(state.recentlyOpenedValue);
    const highestValuesGone = !remainingValues.some(val => topTwoValues.includes(val));
    
    // Calculate how generous/stingy the current offer is
    const offerRatio = state.pendingOffer / avgRemainingValue;
    const isGenerousOffer = offerRatio > 0.85;
    const isStingyOffer = offerRatio < 0.6;
    const isInsultingOffer = offerRatio < 0.4;
    
    // Check if player has declined previous good offers
    const hasMissedGoodOffers = state.offerHistory && state.offerHistory.some(offer => offer > state.pendingOffer * 1.2);
    
    // Different message categories based on game state
    const firstOfferMessages = [
      "First offer of the day! I'm feeling generous...",
      "Let's see... for a first offer, I think this is fair.",
      "I'll start with this amount. Take it or leave it.",
      "For a starter, what do you think about this?",
      "Welcome to the game! Here's my opening offer.",
      "Let's get this show started! My first offer is on the table.",
      "Not sure about your luck today? This offer is guaranteed!",
      "My first offer is always a gentle one. Don't expect this generosity to last.",
      "I'm starting nice. It gets much worse from here, trust me.",
      "An opening gift from me to you. Probably the best you'll get.",
      "Take this now and save yourself the heartbreak later.",
      "I've seen how this usually ends. You might want this now."
    ];
    
    const playerDoingWellMessages = [
      "You're getting lucky. Better take this while you can!",
      "Hmm, things seem to be going your way. This offer won't last forever.",
      "You've been fortunate so far. Want to quit while you're ahead?",
      "My financial advisor is getting nervous. Take this offer before I change my mind!",
      "The odds seem to be in your favor right now. Here's what I'm willing to pay.",
      "I'm starting to think you've got a strategy! How about we end this now?",
      "My shareholders are sweating. This is a generous offer considering.",
      "My accountant is having heart palpitations. Take the deal!",
      "This luck of yours can't possibly hold. Better cash out now.",
      "Your good fortune is making me uncomfortable. Let's end this.",
      "Every box you open makes me more nervous. Take this!",
      "Are you cheating somehow? This offer reflects my annoyance.",
      "I hate to see players doing well. Take this and go.",
      "Statistics say your luck should run out soon. Here's a safety net.",
      "I'm not usually this generous. You've caught me in a rare mood.",
      "Your good fortune is cute. But statistics always win in the end.",
      "This offer is better than you deserve, based on probability.",
      "Fine! You're doing well. This is more than fair considering."
    ];
    
    const playerDoingPoorlyMessages = [
      "Ouch! That was painful to watch. Need a bailout?",
      "Well, that's unfortunate. I'm still willing to offer you this...",
      "Things aren't looking good for you. This might be your best option now.",
      "Losing those big values? This offer might be the best you'll get.",
      "After that performance, I'm surprised I'm offering anything at all!",
      "You're making this too easy for me. Take this offer before you lose more.",
      "I almost feel bad watching this. Almost. Here's my offer.",
      "HA! That was fun to watch. Here's a pity offer.",
      "I'm laughing all the way to the bank! Want some consolation money?",
      "That sound you hear? That's your dreams shattering. Here's a small comfort.",
      "Your face when that box opened! Priceless! Take this offer as a souvenir.",
      "My grandmother plays better than you! But here's something anyway.",
      "I haven't enjoyed myself this much in ages! Thanks for the entertainment.",
      "I'm practically stealing from you at this point. But here's my offer.",
      "This offer is charity after that disaster. You should thank me!",
      "Things are going EXACTLY as I hoped! Here's a token of my appreciation.",
      "Keep opening boxes like that and I'll be offering pennies next!",
      "I can barely contain my glee! Here's an offer while I'm feeling generous.",
      "Every box you open makes my day better! Here's my offer.",
      "Sorry not sorry! Here's what's left of your hopes and dreams."
    ];
    
    const afterBigLossMessages = [
      "BOOM! That box was explosive! Goodbye dreams, hello reality!",
      "Oh my! Did you see all those diamonds disappear? I sure did!",
      "That's gotta sting! Do you need a moment to recover?",
      "There goes your retirement fund! I'm practically giddy!",
      "WOW! That was the box you needed to avoid! My lucky day!",
      "That sound you heard? That was me cackling with delight!",
      "I just made a fortune on your misfortune! Here's a tiny fraction back.",
      "That's going to leave a mark! Want a bandaid for that wound?",
      "Congratulations! You've just made my day with that catastrophe!",
      "Oh dear... your face says it all. Here's a tissue with some money.",
      "I haven't seen a loss that bad since... well, my last victim!",
      "The universe just told you to take my offer. Loudly.",
      "That box was like watching a car crash in slow motion. Magnificent!",
      "I'm feeling generous after watching that beautiful disaster."
    ];
    
    const lateGameMessages = [
      "We're in the endgame now. Last chance to walk away with something substantial.",
      "It's getting tense! Your box or what's left on the board?",
      "Few boxes left. The odds are shifting. Think carefully.",
      "My final few offers will only get worse if you keep eliminating high values.",
      "The suspense is killing me! Almost as much as it's killing your potential winnings.",
      "Tick tock. Time to decide if you want to risk it all.",
      "My patience is wearing thin. Take this offer or suffer the consequences.",
      "I can taste your desperation now. The end is near.",
      "We're approaching the point of no return. Last chance for a decent offer.",
      "My offers don't get better from here. Only worse.",
      "The board is thinning out. So are your chances of walking away happy.",
      "Last chance saloon, my friend. I won't be this nice again.",
      "You've come far, but the real pain is just beginning.",
      "I love this part. When hope begins to fade from your eyes.",
      "Is that anxiety I detect? Good. You should be worried.",
      "Decision time: guaranteed money or probable disappointment?"
    ];
    
    const finalStageMessages = [
      "The final countdown! Your palms sweating yet?",
      "Two pathways: one leads to glory, one to devastation.",
      "This is why I love this game. Pure agony of choice at the end.",
      "I can smell your fear from here! Delicious!",
      "A 50-50 chance of happiness or regret. Choose wisely.",
      "Just a few boxes left! And most players get it wrong at this point.",
      "Your heart is racing, isn't it? Mine too, with excitement!",
      "The house always wins. That's me, by the way.",
      "I can already see tomorrow's headline: 'Player Makes Terrible Final Decision'",
      "I'd wish you luck, but I'm actively hoping you fail!"
    ];
    
    const highPressureMessages = [
      "Listen carefully. This is SIGNIFICANTLY higher than the statistical value remaining.",
      "My financial team is begging me not to make this offer. Take it before I listen to them!",
      "This is highway robbery—in your favor! Don't be a fool.",
      "I NEVER make offers this good. This is a one-time exception.",
      "Take the money and run. You'll thank me later.",
      "This offer is too good to pass up. Trust me, I'm a banker.",
      "My boss will fire me for this offer. Please take it so it's worth it!",
      "I'm breaking every rule with this offer. TAKE IT!",
      "Our algorithm says this is madness, but I'm feeling reckless.",
      "This is more than fair and you know it! Don't push your luck.",
      "I've never made an offer this generous in my banking career.",
      "This offer is like finding money on the street. Just take it!",
      "I must be losing my mind with this offer. Quick, accept before I change it!",
      "You won't see these numbers again, I promise you that.",
      "I'm practically giving away money here. What more do you want?",
      "This is charity, not banking. You're welcome."
    ];
    
    const teasingMessages = [
      "Is that sweat I see? Nervous about your decision?",
      "Your indecision is amusing. Take the safe route with this offer.",
      "I can practically hear your heart pounding from here. Here's my offer.",
      "You look like you could use an escape hatch. Here it is!",
      "That lucky streak won't last forever. But this money could!",
      "I've seen better players than you walk away with nothing. Just saying...",
      "Are you feeling lucky? I wouldn't be.",
      "Your box or mine? That is the question!",
      "Sweating yet? You should be!",
      "Your face shows pure terror. I'm loving every second of it!",
      "Fortune favors the bold, but bankruptcy favors the foolish.",
      "Gambling is fun until you lose everything, isn't it?",
      "Your hesitation speaks volumes about your confidence.",
      "I can see the doubt in your eyes. Take the safe bet.",
      "This game reveals character. Yours is... interesting.",
      "I love watching players like you struggle with decisions.",
      "Enjoying your time in the pressure cooker? Here's your way out.",
      "Each decision gets harder. This one should be easy though!",
      "Your palms are sweaty, knees weak, arms are heavy...",
      "Risk it all or take the safe route? What kind of player are you?"
    ];
    
    const insultingMessages = [
      "Even a child could see this is a good deal. What's your excuse?",
      "I'm starting to think you don't understand how probability works.",
      "Your gameplay is almost as bad as your decision-making abilities.",
      "This offer is better than you deserve, honestly.",
      "I've seen monkeys make better financial decisions.",
      "Take the deal before you embarrass yourself further.",
      "Are you trying to lose? Because it certainly looks that way.",
      "Your strategy is... interesting. And by interesting, I mean terrible.",
      "My grandmother would have played this game better blindfolded.",
      "Are you deliberately trying to fail? Or is this your natural talent?",
      "This might be too complicated for you. Let me simplify: TAKE THE MONEY.",
      "I'm offering you a safety net for your obvious incompetence.",
      "I'm genuinely embarrassed for you right now.",
      "Each decision you make confirms my low opinion of your abilities.",
      "At this point, I'm offering money out of pity.",
      "Your gameplay is like watching a car crash in slow motion.",
      "Not the sharpest tool in the shed, are you?",
      "I'm fascinated by your ability to consistently make the wrong choice.",
      "You've elevated bad decisions to an art form. Bravo!",
      "Take notes, everyone! This is how NOT to play the game.",
      "Is this your first time making decisions? It shows.",
      "I've seen better gameplay from random number generators.",
      "You're making my job too easy. It's almost unsporting."
    ];
    
    const missedGoodOfferMessages = [
      "Remember that offer you rejected? Better than this one, wasn't it?",
      "Regretting your earlier decisions yet? You should be.",
      "You had your chance for a better deal. That ship has sailed.",
      "Let's reflect on your poor judgment so far. Ready for more?",
      "Hindsight is 20/20, isn't it? Hope that earlier 'No Deal' was worth it.",
      "This offer is worse than before. That's how the game works!",
      "Fortune favors the brave, but punishes the foolish. Which are you?",
      "That earlier offer is looking pretty good in the rearview mirror, huh?",
      "I gave you a chance. You didn't take it. Your loss. Literally.",
      "You could've walked away richer earlier. Too late now!",
      "My generosity has limits. You've reached them.",
      "What's that saying? Opportunity knocks once? Well, it did."
    ];
    
    const stingyOfferMessages = [
      "I'm feeling particularly... economical today.",
      "My generosity has its limits. Here's proof.",
      "My shareholders would kill me if I offered more.",
      "The economy is tough. This reflects those hard times.",
      "This offer reflects my current mood: miserly.",
      "Take it or leave it. Preferably leave it so I can offer less next time!",
      "Don't expect charity from a banker. This is business.",
      "I've calculated exactly how little I can offer without embarrassment.",
      "This offer is like my heart: small and cold.",
      "Low offer, high entertainment value watching you squirm.",
      "I'm paid to protect the bank's money. I'm very good at my job.",
      "I had a higher number in mind, then I remembered I don't like you."
    ];
    
    // Select appropriate message category based on game state
    let messagePool = [];
    
    if (isFirstOffer) {
      messagePool = firstOfferMessages;
    } else if (recentlyLostVeryHighValue || recentlyLostTopValue) {
      messagePool = afterBigLossMessages;
    } else if (recentlyLostHighValue) {
      messagePool = playerDoingPoorlyMessages;
    } else if (veryCloseToEndGame) {
      messagePool = finalStageMessages;
    } else if (playerHasHighValueBox && isLateGame) {
      messagePool = [...highPressureMessages, ...teasingMessages];
    } else if (playerHasHighValueBox) {
      messagePool = playerDoingWellMessages;
    } else if (closeToEndGame) {
      messagePool = lateGameMessages;
    } else if (hasMissedGoodOffers) {
      messagePool = missedGoodOfferMessages;
    } else if (isGenerousOffer) {
      messagePool = highPressureMessages;
    } else if (isStingyOffer || isInsultingOffer) {
      messagePool = stingyOfferMessages;
    } else if (Math.random() < 0.4) { // 40% chance for insults regardless of situation
      messagePool = insultingMessages;
    } else {
      messagePool = teasingMessages;
    }
    
    // Add a custom message if they recently lost a very high value
    if (state.recentlyOpenedValue && state.recentlyOpenedValue > avgRemainingValue * 3) {
      messagePool.push(`You just lost the ${Math.round(state.recentlyOpenedValue).toLocaleString()} box! That's gotta hurt! I'm almost crying... from laughter!`);
    }
    
    // Add some references to specific values if they're still on the board
    if (maxRemainingValue > 10000 && Math.random() < 0.3) {
      messagePool.push(`That ${Math.round(maxRemainingValue).toLocaleString()} is still on the board. Want to risk it all? Please do, it's more fun for me!`);
    }
    
    // Only add the "high value box is gone" message if the top values are actually gone
    if (highestValuesGone) {
      afterBigLossMessages.push("Those high value boxes are gone! How about a consolation prize for your terrible luck?");
      afterBigLossMessages.push("All the good boxes are gone! I'm practically giddy with delight!");
    }
    
    // Add impossibly specific messages that feel personalized (0.5% chance)
    if (Math.random() < 0.005) {
      const specificMessages = [
        "Is that the same shirt you wore yesterday? Bold fashion choice.",
        "Those lucky socks aren't working out so well, are they?",
        "I notice you always hesitate before making bad decisions. Interesting pattern.",
        "Your left eye twitches when you're nervous. Like now.",
        "I've analyzed 317 of your facial expressions. Anxiety is winning.",
        "Your viewing audience is about to witness a financial disaster."
      ];
      messagePool = [...messagePool, ...specificMessages];
    }
    
    return messagePool[Math.floor(Math.random() * messagePool.length)];
  };

  return (
    <Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Value lists container */}
      <ValueListsWrapper>
        {renderValueList(sorted.slice(0, half), "left")}
        <div /> {/* Empty center column */}
        {renderValueList(sorted.slice(half), "right")}
      </ValueListsWrapper>
      
      <Panel 
        initial={{ scale: 0.95 }} 
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ margin: 0 }}>
          {offerState === 'ringing' ? 'Incoming Call...' : 
           offerState === 'message' ? 'The Banker Says:' :
           offerState === 'counting' ? 'Calculating Offer...' :
           'The Banker\'s Offer'}
        </h2>
        
        {offerState === 'ringing' && (
          <PhoneIcon>
            📞
          </PhoneIcon>
        )}
        
        {offerState === 'message' && (
          <BankerMessage>
            {getBankerMessage()}
          </BankerMessage>
        )}
        
        {offerState === 'counting' && (
          <CountingOfferAmount>
            <DiamondIcon size={30} />
            {Math.round(countValue).toLocaleString()}
          </CountingOfferAmount>
        )}
        
        {(offerState === 'offer' || offerState === 'deciding') && (
          <OfferAmount revealing={false}>
            <DiamondIcon size={30} />
            {Math.round(state.pendingOffer).toLocaleString()}
          </OfferAmount>
        )}
        
        {offerState === 'offer' && (
          <p style={{ opacity: 0.8 }}>
            Deal or No Deal? Accept the offer or continue opening boxes.
          </p>
        )}
        
        {state.lastOffer && offerState === 'offer' && (
          <PreviousOffers>
            <h4>Previous Offers:</h4>
            <ul>
              {state.offerHistory && state.offerHistory.map((offer, index) => (
                <li key={index}>
                  <DiamondIcon size={12} />
                  {Math.round(offer).toLocaleString()}
                </li>
              ))}
              {!state.offerHistory && state.lastOffer && (
                <li>
                  <DiamondIcon size={12} />
                  {Math.round(state.lastOffer).toLocaleString()}
                </li>
              )}
            </ul>
          </PreviousOffers>
        )}
        
        {offerState === 'deciding' && (
          <p style={{ fontSize: "1.1rem", color: "var(--accent)" }}>
            Final answer...
          </p>
        )}
        
        {offerState === 'offer' && (
          <ButtonsContainer>
            <Button
              accept
              onClick={() => handleDecision(true)}
            >
              DEAL
            </Button>
            <Button
              onClick={() => handleDecision(false)}
            >
              NO DEAL
            </Button>
          </ButtonsContainer>
        )}
      </Panel>
    </Backdrop>
  );
};

export default OfferModal; 