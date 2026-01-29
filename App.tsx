import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, ReactionAttempt, Difficulty, SoundPack, Settings, ThemeColor } from './types';
import ReactionArea from './components/ReactionArea';
import Stats from './components/Stats';
import SettingsModal from './components/SettingsModal';
import NewsPanel from './components/NewsPanel';
import { Zap, Volume2, VolumeX, Settings2, Sliders, Trash2, Palette, AlertTriangle, RefreshCcw, Loader2 } from 'lucide-react';
import { audioManager } from './utils/audio';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY_BEST = 'reaction-pro-best-time';
const STORAGE_KEY_SETTINGS = 'reaction-pro-settings';
const STORAGE_KEY_COLOR = 'reaction-pro-theme-color';
const DELAY_POOL_SIZE = 10;

interface NewsItem {
  title: string;
  url: string;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [themeColor, setThemeColor] = useState<ThemeColor>(ThemeColor.INDIGO);
  const [currentResult, setCurrentResult] = useState<number | null>(null);
  const [history, setHistory] = useState<ReactionAttempt[]>([]);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [delayPool, setDelayPool] = useState<number[]>([]);
  const [introStage, setIntroStage] = useState(0);
  
  // News & Error States
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<Settings>({
    volume: 0.5,
    soundPack: SoundPack.CLASSIC
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Intro Sequence Controller
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroStage(1), 100);
    const timer2 = setTimeout(() => setIntroStage(2), 500);
    const timer3 = setTimeout(() => setIntroStage(3), 900);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const savedBest = localStorage.getItem(STORAGE_KEY_BEST);
      if (savedBest) {
        const parsed = parseInt(savedBest, 10);
        if (!isNaN(parsed)) setBestTime(parsed);
      }

      const savedColor = localStorage.getItem(STORAGE_KEY_COLOR) as ThemeColor;
      if (savedColor && Object.values(ThemeColor).includes(savedColor)) {
        setThemeColor(savedColor);
      }

      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        audioManager.setVolume(parsed.volume);
        audioManager.setSoundPack(parsed.soundPack);
      }
    } catch (e) {
      console.error("Critical: Initialization error", e);
      // We don't setAppError here to allow the app to function even if storage fails
    }
  }, []);

  const fetchNews = async () => {
    setIsNewsLoading(true);
    setNewsError(null);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("Missing API configuration. Please set the API_KEY environment variable.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "List exactly 3 latest technology or gaming news headlines from today. Keep the titles concise. Provide links for each.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const lines = response.text.split('\n').filter(line => line.trim().length > 10);
      
      const newsItems: NewsItem[] = lines.slice(0, 3).map((line, idx) => {
        const chunk = chunks[idx];
        return {
          title: line.replace(/^\d+\.\s*/, '').replace(/\[.*\]/, '').trim(),
          url: chunk?.web?.uri || 'https://news.google.com'
        };
      });

      if (newsItems.length === 0) throw new Error("No headlines found.");
      setNews(newsItems);
    } catch (error: any) {
      console.error("Failed to fetch news:", error);
      setNewsError(error.message || "Unable to sync with news servers.");
    } finally {
      setIsNewsLoading(false);
    }
  };

  // Pre-calculate delays when difficulty changes
  useEffect(() => {
    let minDelay = 1500;
    let maxRandom = 1500;

    switch (difficulty) {
      case Difficulty.EASY:
        minDelay = 1000;
        maxRandom = 1000;
        break;
      case Difficulty.MEDIUM:
        minDelay = 1500;
        maxRandom = 1500;
        break;
      case Difficulty.HARD:
        minDelay = 1000;
        maxRandom = 3000;
        break;
    }

    const pool = Array.from({ length: DELAY_POOL_SIZE }, () => 
      Math.floor(Math.random() * maxRandom) + minDelay
    );
    setDelayPool(pool);
  }, [difficulty]);

  // Update localStorage whenever bestTime changes
  useEffect(() => {
    if (bestTime !== null) {
      localStorage.setItem(STORAGE_KEY_BEST, bestTime.toString());
    } else {
      localStorage.removeItem(STORAGE_KEY_BEST);
    }
  }, [bestTime]);

  const handleUpdateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
      if (newSettings.volume !== undefined) audioManager.setVolume(newSettings.volume);
      if (newSettings.soundPack !== undefined) audioManager.setSoundPack(newSettings.soundPack);
      return updated;
    });
    audioManager.playTick();
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    audioManager.toggle(newState);
    if (newState) audioManager.playTick();
  };

  const handleResetBest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Reset your all-time best score?')) {
      setBestTime(null);
      audioManager.playError();
    }
  };

  const handleStart = useCallback(() => {
    if (isSettingsOpen || introStage < 3) return;
    try {
      audioManager.playStart();
      setGameState(GameState.WAITING);
      setCurrentResult(null);

      const delay = delayPool.length > 0 
        ? delayPool[Math.floor(Math.random() * delayPool.length)]
        : 2000;

      timerRef.current = setTimeout(() => {
        setGameState(GameState.ACTIVE);
        startTimeRef.current = performance.now();
      }, delay);
    } catch (e) {
      setAppError("Engine failure. Please reload.");
    }
  }, [delayPool, isSettingsOpen, introStage]);

  const handleClick = useCallback(() => {
    if (isSettingsOpen || introStage < 3) return;

    if (gameState === GameState.WAITING) {
      if (timerRef.current) clearTimeout(timerRef.current);
      audioManager.playError();
      setGameState(GameState.TOO_SOON);
    } else if (gameState === GameState.ACTIVE) {
      const endTime = performance.now();
      const reaction = Math.round(endTime - startTimeRef.current);
      audioManager.playSuccess();
      setCurrentResult(reaction);
      setGameState(GameState.RESULT);
      const attempt: ReactionAttempt = {
        timestamp: Date.now(),
        time: reaction,
      };
      setHistory(prev => [attempt, ...prev].slice(0, 10));
      setBestTime(prev => (prev === null || reaction < prev ? reaction : prev));
    } else if (gameState === GameState.RESULT || gameState === GameState.TOO_SOON || gameState === GameState.IDLE) {
      handleStart();
    }
  }, [gameState, handleStart, isSettingsOpen, introStage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Global Error Fallback UI
  if (appError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 text-red-500">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-zinc-500 mb-8 max-w-xs">{appError}</p>
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-950 font-bold rounded-xl hover:scale-105 transition-transform"
        >
          <RefreshCcw size={18} />
          Reload Engine
        </button>
      </div>
    );
  }

  // Initial Loading UI
  if (introStage === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const colorConfig = {
    [ThemeColor.INDIGO]: 'bg-indigo-600',
    [ThemeColor.ROSE]: 'bg-rose-600',
    [ThemeColor.EMERALD]: 'bg-emerald-600',
    [ThemeColor.AMBER]: 'bg-amber-600',
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Header with Intro Animation */}
      <header className={`
        p-6 flex items-center justify-between border-b border-white/5 bg-zinc-900/50 backdrop-blur-md z-10
        transition-all duration-700 ease-out transform
        ${introStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Reaction<span className="text-indigo-500">Pro</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          {bestTime !== null && (
            <div className="flex items-center gap-3 bg-zinc-900/50 px-3 py-1.5 rounded-2xl border border-white/5 group">
              <div className="text-right hidden md:block">
                <p className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-widest leading-none mb-1">All-Time Best</p>
                <p className="text-sm font-mono font-bold text-indigo-400 leading-none">{bestTime}ms</p>
              </div>
              <button 
                onClick={handleResetBest}
                className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                title="Reset High Score"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          
          <div className="h-8 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center bg-zinc-900 border border-white/5 rounded-full px-1">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSound(); }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              aria-label={soundEnabled ? "Mute sounds" : "Unmute sounds"}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); audioManager.playTick(); }}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
              aria-label="Audio Settings"
            >
              <Sliders size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden gap-8 px-6 py-12 no-scrollbar">
        
        {/* Main Reaction Area */}
        <div className={`
          w-full flex justify-center transition-all duration-700 ease-out transform
          ${introStage >= 2 ? 'opacity-100' : 'opacity-0'}
          ${introStage === 2 ? 'scale-95' : ''}
          ${introStage >= 3 && gameState !== GameState.RESULT ? 'scale-100' : ''}
          ${gameState === GameState.RESULT ? 'scale-105' : ''}
        `}>
          <ReactionArea 
            key={gameState === GameState.RESULT ? `result-${currentResult}` : gameState}
            state={gameState} 
            onClick={handleClick} 
            result={currentResult}
            themeColor={themeColor}
          />
        </div>
        
        {/* Settings & Info Area */}
        <div className={`
          w-full max-w-2xl flex flex-col gap-8 transition-all duration-700 ease-out transform
          ${introStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          {gameState === GameState.IDLE && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 bg-zinc-900/30 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Settings2 size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Difficulty</span>
                </div>
                <div className="flex p-1 bg-zinc-900 border border-white/5 rounded-xl">
                  {(Object.keys(Difficulty) as Array<keyof typeof Difficulty>).map((key) => {
                    const level = Difficulty[key];
                    const isActive = difficulty === level;
                    return (
                      <button
                        key={level}
                        onClick={(e) => { e.stopPropagation(); setDifficulty(level); audioManager.playTick(); }}
                        className={`
                          px-4 py-2 rounded-lg text-xs font-extrabold uppercase tracking-tight 
                          transition-all duration-300 transform 
                          hover:scale-105 active:scale-95
                          ${isActive 
                            ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-105 z-10' 
                            : 'text-zinc-500 hover:text-zinc-200'}
                        `}
                      >
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <Palette size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">Active Color</span>
                </div>
                <div className="flex gap-3 p-2 bg-zinc-900 border border-white/5 rounded-xl">
                  {Object.values(ThemeColor).map((color) => {
                    const isActive = themeColor === color;
                    return (
                      <button
                        key={color}
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setThemeColor(color); 
                          localStorage.setItem(STORAGE_KEY_COLOR, color);
                          audioManager.playTick(); 
                        }}
                        className={`
                          w-8 h-8 rounded-full transition-all duration-300 transform
                          ${colorConfig[color]}
                          ${isActive ? 'ring-4 ring-white/20 scale-125 shadow-lg' : 'opacity-50 hover:opacity-100 hover:scale-110'}
                        `}
                        aria-label={`Select ${color} color`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {history.length > 0 && <Stats history={history} bestTime={bestTime} />}
          
          <NewsPanel 
            news={news} 
            isLoading={isNewsLoading} 
            onFetch={fetchNews} 
            error={newsError}
          />
        </div>
      </main>

      <footer className={`
        p-4 text-center text-zinc-600 text-xs border-t border-white/5 transition-opacity duration-1000 delay-500
        ${introStage >= 3 ? 'opacity-100' : 'opacity-0'}
      `}>
        <p>Precision Engine: v2.5. Steady. <span className="text-zinc-400 font-bold">{difficulty}</span> mode active.</p>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={handleUpdateSettings}
      />
    </div>
  );
};

export default App;