import React from 'react';
import { Smile, Frown, Activity } from 'lucide-react';
import { SentimentData } from '../types';

interface SentimentCardProps {
  sentiment: SentimentData;
  trend: 'up' | 'down';
}

const SentimentCard: React.FC<SentimentCardProps> = ({ sentiment, trend }) => {
  const borderClass = trend === 'up'
    ? "border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
    : "border-red-500/20 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]";

  return (
    <div className={`h-full bg-gray-900/30 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 flex flex-col ${borderClass}`}>
      <div className="mb-2 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Sentiment</h3>
        <div className="bg-white/5 p-1.5 rounded-lg">
            <Activity className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6">
        <div className="flex items-center justify-center relative py-2">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 128 128">
                <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
                <circle className="text-emerald-500" strokeWidth="8" strokeDasharray={351} 
                        strokeDashoffset={351 - (351 * sentiment.bullishPercent) / 100}
                        strokeLinecap="round" stroke="currentColor" fill="transparent" r="56" cx="64" cy="64" />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-3xl font-bold text-white">{sentiment.bullishPercent}%</span>
                <span className="block text-[10px] text-gray-400 uppercase mt-1">Bullish</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 rounded-xl p-3 flex items-center gap-2 border border-emerald-500/20">
                <Smile className="w-4 h-4 text-emerald-400" />
                <div>
                    <span className="block text-[10px] text-emerald-200">Positive</span>
                    <span className="font-bold text-sm text-white">{sentiment.bullishPercent}%</span>
                </div>
            </div>
            <div className="bg-red-500/10 rounded-xl p-3 flex items-center gap-2 border border-red-500/20">
                <Frown className="w-4 h-4 text-red-400" />
                <div>
                    <span className="block text-[10px] text-red-200">Negative</span>
                    <span className="font-bold text-sm text-white">{sentiment.bearishPercent}%</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentCard;