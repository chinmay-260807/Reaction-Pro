import React from 'react';
import { GameState, ThemeColor } from '../types';
import { Zap, Clock, AlertCircle, RefreshCw, Play } from 'lucide-react';

interface ReactionAreaProps {
  state: GameState;
  onClick: () => void;
  result: number | null;
  themeColor?: ThemeColor;
}

const ReactionArea: React.FC<ReactionAreaProps> = ({ state, onClick, result, themeColor = ThemeColor.INDIGO }) => {
  const getStyles = () => {
    // Dynamic color mapping for Tailwind
    const themeBg = {
      [ThemeColor.INDIGO]: 'bg-indigo-500 border-indigo-400',
      [ThemeColor.ROSE]: 'bg-rose-500 border-rose-400',
      [ThemeColor.EMERALD]: 'bg-emerald-500 border-emerald-400',
      [ThemeColor.AMBER]: 'bg-amber-500 border-amber-400',
    }[themeColor];

    const themeAccentText = {
      [ThemeColor.INDIGO]: 'text-indigo-400',
      [ThemeColor.ROSE]: 'text-rose-400',
      [ThemeColor.EMERALD]: 'text-emerald-400',
      [ThemeColor.AMBER]: 'text-amber-400',
    }[themeColor];

    const themeShadow = {
      [ThemeColor.INDIGO]: 'shadow-[0_0_60px_rgba(99,102,241,0.5)]',
      [ThemeColor.ROSE]: 'shadow-[0_0_60px_rgba(244,63,94,0.5)]',
      [ThemeColor.EMERALD]: 'shadow-[0_0_60px_rgba(16,185,129,0.5)]',
      [ThemeColor.AMBER]: 'shadow-[0_0_60px_rgba(245,158,11,0.5)]',
    }[themeColor];

    switch (state) {
      case GameState.IDLE:
        return {
          bg: 'bg-zinc-900 border-zinc-800 hover:border-zinc-700',
          title: 'Reaction Pro',
          desc: 'Test your reflexes and visual response time.',
          icon: <Play className={`w-12 h-12 ${themeAccentText}`} />,
          buttonText: 'Click to Start',
          animationClass: '',
          accentText: themeAccentText,
        };
      case GameState.WAITING:
        return {
          bg: 'bg-zinc-900 border-white/5',
          title: 'Wait for Color...',
          desc: 'Do not click yet. Stay focused.',
          icon: <Clock className="w-12 h-12 text-zinc-500 animate-pulse" />,
          buttonText: 'Ready...',
          animationClass: '', 
          accentText: 'text-zinc-400',
        };
      case GameState.ACTIVE:
        return {
          bg: themeBg,
          title: 'CLICK NOW!',
          desc: 'AS FAST AS YOU CAN!',
          icon: <Zap className="w-16 h-16 text-white animate-bounce" />,
          buttonText: 'CLICK!',
          animationClass: `animate-pop-in ${themeShadow}`,
          accentText: 'text-white',
        };
      case GameState.RESULT:
        return {
          bg: 'bg-zinc-900 border-white/10',
          title: `${result} ms`,
          desc: getReactionMessage(result || 0),
          icon: <RefreshCw className={`w-12 h-12 ${themeAccentText}`} />,
          buttonText: 'Try Again',
          animationClass: 'animate-result-pop',
          accentText: themeAccentText,
        };
      case GameState.TOO_SOON:
        return {
          bg: 'bg-zinc-800 border-zinc-700',
          title: 'Too Soon!',
          desc: 'You clicked before the color changed.',
          icon: <AlertCircle className="w-12 h-12 text-amber-500" />,
          buttonText: 'Retry Attempt',
          animationClass: 'animate-content-up',
          accentText: 'text-amber-400',
        };
      default:
        return { bg: '', title: '', desc: '', icon: null, buttonText: '', animationClass: '', accentText: '' };
    }
  };

  const getReactionMessage = (time: number) => {
    if (time < 150) return "Incredible! Are you a pro gamer?";
    if (time < 200) return "Excellent! Lightning fast.";
    if (time < 250) return "Great job! Faster than average.";
    if (time < 300) return "Good. Average human reaction.";
    if (time < 400) return "Not bad, keep practicing!";
    return "A bit slow. Wake up!";
  };

  const styles = getStyles();
  const isResult = state === GameState.RESULT;
  const isWaiting = state === GameState.WAITING;
  const isIdle = state === GameState.IDLE;

  return (
    <div 
      onClick={onClick}
      className={`
        w-full max-w-xl aspect-square sm:aspect-[16/10] rounded-3xl 
        border-4 cursor-pointer transition-all duration-300 ease-out 
        flex flex-col items-center justify-center p-8 text-center
        relative overflow-hidden group shadow-2xl
        ${styles.bg}
        ${styles.animationClass}
        active:scale-95
      `}
    >
      <div className={`absolute inset-0 bg-white opacity-0 transition-opacity duration-75 ${state === GameState.ACTIVE ? 'group-active:opacity-10' : ''}`} />
      
      <div className={`transition-all duration-500 transform ${state === GameState.ACTIVE || isResult ? 'scale-110' : 'scale-100'}`}>
        <div className={`mb-6 flex justify-center transition-transform duration-700 ${isResult ? 'rotate-[360deg]' : ''}`}>
          {styles.icon}
        </div>
        
        <h2 className={`
          text-4xl sm:text-7xl font-extrabold mb-4 tracking-tight 
          transition-all duration-700 transform
          ${isResult ? `${styles.accentText} animate-fade-in-up` : state === GameState.ACTIVE ? 'text-white' : 'text-zinc-100'}
          ${isWaiting ? 'animate-soft-pulse' : ''}
        `}>
          {styles.title}
        </h2>
        
        <p className={`
          text-lg sm:text-xl font-medium mb-8 max-w-xs mx-auto 
          transition-all duration-700 transform
          ${isResult ? 'text-zinc-300 animate-fade-in-up [animation-delay:150ms]' : state === GameState.ACTIVE ? 'text-white/90' : 'text-zinc-400'}
          ${isWaiting ? 'animate-soft-pulse [animation-delay:400ms]' : ''}
        `}>
          {styles.desc}
        </p>

        <div className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm
          transition-all duration-300
          ${state === GameState.ACTIVE ? 'bg-white text-zinc-900 shadow-lg' : isResult ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 animate-fade-in-up [animation-delay:300ms]' : 'bg-zinc-800 text-zinc-300'}
          ${isIdle ? 'animate-soft-pulse ring-2 ring-white/10' : ''}
          hover:scale-105
        `}>
          {styles.buttonText}
        </div>
      </div>
    </div>
  );
};

export default ReactionArea;