'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

interface NewsSectionProps {
  ticker?: string;
  query?: string;
  title?: string;
  limit?: number;
}

export default function NewsSection({ ticker, query, title, limit = 5 }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const params = new URLSearchParams();
        if (ticker) params.set('ticker', ticker);
        if (query) params.set('q', query);
        
        const res = await fetch(`/api/news?${params.toString()}`);
        const data = await res.json();
        setNews(data.items?.slice(0, limit) || []);
      } catch (err) {
        console.error('News fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [ticker, query, limit]);

  function formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const hours = Math.floor((now.getTime() - d.getTime()) / 3600000);
      if (hours < 1) return 'Just now';
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900">{title || 'Latest News'}</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm">No news found</div>
      ) : (
        <div className="space-y-3">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                    {item.title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>{item.source || 'News'}</span>
                    <span>·</span>
                    <span>{formatDate(item.pubDate)}</span>
                  </div>
                </div>
                <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
