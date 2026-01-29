import React from 'react';
import { X, Volume2, Music, Check } from 'lucide-react';
import { SoundPack, Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const packs = Object.values(SoundPack);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-content-up" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-result-pop">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Music className="w-5 h-5 text-indigo-500" />
            Audio Settings
          </h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Volume Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-2">
                <Volume2 size={14} />
                Volume
              </span>
              <span className="text-indigo-400 font-mono">{Math.round(settings.volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={settings.volume}
              onChange={(e) => onUpdate({ volume: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Sound Pack Section */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-zinc-500">
              Sound Pack
            </div>
            <div className="grid grid-cols-1 gap-3">
              {packs.map((pack) => {
                const isActive = settings.soundPack === pack;
                return (
                  <button
                    key={pack}
                    onClick={() => onUpdate({ soundPack: pack })}
                    className={`
                      w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all duration-300
                      ${isActive 
                        ? 'bg-indigo-600/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.1)]' 
                        : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:border-white/10 hover:bg-zinc-800'}
                    `}
                  >
                    <div>
                      <p className={`font-bold ${isActive ? 'text-white' : 'text-zinc-200'}`}>{pack}</p>
                      <p className="text-xs text-zinc-500">
                        {pack === SoundPack.CLASSIC && "Original sine wave tones"}
                        {pack === SoundPack.ARCADE && "Retro 8-bit game effects"}
                        {pack === SoundPack.TECH && "Minimalist high-freq blips"}
                      </p>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-indigo-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-950/50 text-center">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-zinc-100 text-zinc-900 font-bold rounded-xl hover:bg-white active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
