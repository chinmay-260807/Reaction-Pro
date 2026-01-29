import React from 'react';
import { Newspaper, Loader2, ExternalLink, Globe } from 'lucide-react';

interface NewsItem {
  title: string;
  url: string;
}

interface NewsPanelProps {
  news: NewsItem[];
  isLoading: boolean;
  onFetch: () => void;
}

const NewsPanel: React.FC<NewsPanelProps> = ({ news, isLoading, onFetch }) => {
  return (
    <div className="w-full bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl transition-all duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Newspaper size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Pro Reflex News</h3>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Global Updates</p>
          </div>
        </div>
        
        <button 
          onClick={onFetch}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all
            ${isLoading 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95'}
          `}
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
          {isLoading ? 'Fetching...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-zinc-500">
            <div className="relative">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <div className="absolute inset-0 blur-lg bg-indigo-500/20 rounded-full animate-pulse" />
            </div>
            <p className="text-xs font-medium animate-pulse">Consulting global networks...</p>
          </div>
        ) : news.length > 0 ? (
          news.map((item, idx) => (
            <a 
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-4 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-800/80 hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors leading-relaxed">
                  {item.title}
                </p>
                <div className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-950 text-zinc-600 group-hover:text-indigo-400 transition-colors">
                  <ExternalLink size={12} />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-500/80 group-hover:text-indigo-400">Source</span>
                <span className="text-[10px] text-zinc-600 truncate max-w-[200px]">{item.url}</span>
              </div>
            </a>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-zinc-500 text-sm">Stay informed about the gaming world.</p>
            <button 
              onClick={onFetch}
              className="mt-3 text-indigo-400 text-xs font-bold hover:underline"
            >
              Get Latest Headlines
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPanel;