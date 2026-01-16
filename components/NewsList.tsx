import React from 'react';

interface NewsItem {
  id: number;
  title: string;
  publisher: string;
  link: string;
  published_at: string;
}

interface NewsListProps {
  news: NewsItem[];
  trend: 'up' | 'down'; // 트렌드 props 추가
}

export const NewsList: React.FC<NewsListProps> = ({ news, trend }) => {
  if (!news || news.length === 0) return null;

  // 조건부 테두리 및 그림자 색상
  const borderClass = trend === 'up'
    ? "border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
    : "border-red-500/20 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]";

  return (
    // Glassmorphism 적용: bg-opacity, backdrop-blur
    <div className={`h-full bg-gray-900/30 backdrop-blur-xl rounded-3xl p-6 border transition-all duration-300 ${borderClass}`}>
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        📰 Breaking News
      </h2>
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {news.map((item, idx) => (
          <a 
            key={idx} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group border-b border-white/5 last:border-0 pb-3 last:pb-0"
          >
            <div className="flex flex-col gap-1">
              <h3 className="text-gray-200 text-sm font-medium group-hover:text-white transition-colors line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 group-hover:text-gray-400">
                <span className="bg-white/5 px-2 py-0.5 rounded">{item.publisher}</span>
                <span>{item.published_at}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};