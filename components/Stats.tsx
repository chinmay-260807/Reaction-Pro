
import React from 'react';
import { ReactionAttempt } from '../types';
import { Trophy, History } from 'lucide-react';

interface StatsProps {
  history: ReactionAttempt[];
  bestTime: number | null;
}

const Stats: React.FC<StatsProps> = ({ history, bestTime }) => {
  if (history.length === 0) return null;

  const averageTime = Math.round(
    history.reduce((acc, curr) => acc + curr.time, 0) / history.length
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {/* Metrics Card */}
      <div className="bg-zinc-900/80 border border-white/5 p-4 rounded-2xl backdrop-blur-xl flex justify-around items-center">
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
             <Trophy className="w-3 h-3 text-amber-500" />
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">All-Time Best</span>
          </div>
          <p className="text-xl font-mono font-bold text-white">{bestTime}ms</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="text-center">
          <div className="flex items-center gap-1 justify-center mb-1">
             <History className="w-3 h-3 text-indigo-500" />
             <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Session Avg</span>
          </div>
          <p className="text-xl font-mono font-bold text-white">{averageTime}ms</p>
        </div>
      </div>

      {/* History List */}
      <div className="hidden sm:flex bg-zinc-900/80 border border-white/5 p-4 rounded-2xl backdrop-blur-xl flex-col">
        <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Recent History</span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {history.map((attempt, i) => (
            <div 
              key={attempt.timestamp} 
              className={`
                flex-shrink-0 px-3 py-1 rounded-lg text-xs font-mono font-medium
                ${i === 0 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'bg-zinc-800 text-zinc-400'}
              `}
            >
              {attempt.time}ms
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
