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
}

export const NewsList: React.FC<NewsListProps> = ({ news }) => {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        📰 Why is it moving?
      </h2>
      <div className="space-y-4">
        {news.map((item, idx) => (
          <a 
            key={idx} 
            href={item.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group border-b border-gray-700 last:border-0 pb-4 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-200 font-medium group-hover:text-green-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <span className="bg-gray-700 px-2 py-0.5 rounded text-xs">{item.publisher}</span>
                  <span>{item.published_at}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};