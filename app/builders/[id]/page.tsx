'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ExternalLink, TrendingUp, TrendingDown, Bell, Copy, Check, Newspaper } from 'lucide-react';
import NewsSection from '@/components/NewsSection';

// Use environment variables with fallback values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L7gJaRj4UpH8UtsyC0GDHQ_6MV10N4u';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 52-week stock data (updated daily - can be refreshed via scripts/update-stock-prices.js)
const STOCK_STATS: Record<string, { volume: string; avgVolume: string; high: number; low: number; dividend: string; yield: string }> = {
  'KBH': { volume: '1.85M', avgVolume: '2.1M', high: 62.48, low: 44.21, dividend: '$0.20', yield: '0.38%' },
  'TOL': { volume: '520K', avgVolume: '680K', high: 168.53, low: 95.21, dividend: '$1.00', yield: '0.73%' },
  'PHM': { volume: '890K', avgVolume: '1.2M', high: 142.87, low: 91.34, dividend: '$0.60', yield: '0.50%' },
  'LEN': { volume: '2.1M', avgVolume: '2.8M', high: 121.22, low: 79.54, dividend: '$0.50', yield: '0.53%' },
  'DHI': { volume: '1.8M', avgVolume: '2.4M', high: 178.45, low: 109.89, dividend: '$1.00', yield: '0.71%' },
  'TPH': { volume: '380K', avgVolume: '420K', high: 58.76, low: 32.12, dividend: '$0.38', yield: '0.82%' },
  'NVR': { volume: '8.5K', avgVolume: '12K', high: 7288.00, low: 4890.00, dividend: '$12.50', yield: '0.19%' },
  'LGIH': { volume: '420K', avgVolume: '580K', high: 58.42, low: 28.76, dividend: '-', yield: '-' },
  'CVCO': { volume: '65K', avgVolume: '85K', high: 612.34, low: 345.00, dividend: '-', yield: '-' },
};

// Format market cap
const formatMarketCap = (value: number | null) => {
  if (!value) return 'N/A';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toLocaleString()}`;
};

export default function BuilderDetail({ params }: { params: { id: string } }) {
  const [builder, setBuilder] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [tenK, setTenK] = useState<any[]>([]);
  const [tenQ, setTenQ] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'10k' | '10q' | 'earnings' | 'presentations' | 'news'>('10k');
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get builder
        const { data: builderData } = await supabase
          .from('builders')
          .select('*')
          .eq('id', params.id)
          .single();

        setBuilder(builderData);

        // Get stock price
        if (builderData?.id) {
          const { data: stockData } = await supabase
            .from('stock_prices')
            .select('*')
            .eq('builder_id', builderData.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (stockData) setStock(stockData);
        }

        // Fetch all filings and earnings data
        try {
          const response = await fetch(`/api/filings/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setTenK(data.tenK || []);
            setTenQ(data.tenQ || []);
            setEarnings(data.tenQ || []);
          } else {
            throw new Error('API error');
          }
        } catch (apiError) {
          // Fallback to direct Supabase queries
          const { data: tenKData } = await supabase
            .from('filings_10k')
            .select('*')
            .eq('builder_id', params.id)
            .order('filing_date', { ascending: false });

          setTenK(tenKData || []);

          const { data: tenQData } = await supabase
            .from('earnings_calls')
            .select('*')
            .eq('builder_id', params.id)
            .order('call_date', { ascending: false });

          setTenQ(tenQData || []);
          setEarnings(tenQData || []);
        }

        // Fetch investor presentations
        try {
          const { data: presentationsData } = await supabase
            .from('investor_presentations')
            .select('*')
            .eq('builder_id', params.id)
            .order('presentation_date', { ascending: false });

          setPresentations(presentationsData || []);
        } catch (err) {
          // Table may not exist yet - that's OK
          console.log('Presentations not available yet');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionEmail || !builder) return;

    setSubscribing(true);
    try {
      const response = await fetch('/api/alerts/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: subscriptionEmail,
          builderIds: [builder.id],
        }),
      });

      if (response.ok) {
        setSubscriptionStatus('success');
        setSubscriptionEmail('');
        setTimeout(() => setSubscriptionStatus('idle'), 3000);
      } else {
        setSubscriptionStatus('error');
        setTimeout(() => setSubscriptionStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setSubscriptionStatus('error');
      setTimeout(() => setSubscriptionStatus('idle'), 3000);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading || !builder) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-center">
          <div className="w-32 h-8 bg-gradient-to-r from-navy-200 to-teal-200 rounded mb-4"></div>
          <p className="text-gray-500">Loading builder details...</p>
        </div>
      </div>
    );
  }

  const stats = builder?.ticker ? STOCK_STATS[builder.ticker] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-teal-600 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 sm:gap-6">
            {/* Builder Name & Ticker */}
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">{builder.name}</h1>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-bold">{builder.ticker}</span>
                {builder.website && (
                  <a
                    href={builder.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:opacity-80 transition text-xs sm:text-sm"
                  >
                    Website <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Stock Info Table — stacked on mobile */}
            {stock && stats && (
              <div className="bg-white/15 backdrop-blur rounded-lg p-3 sm:p-4 border border-white/20 w-full md:w-auto">
                {/* Mobile: 2-col grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm md:hidden">
                  <div>
                    <span className="text-white/60 text-xs">Price</span>
                    <div className="font-bold">${stock.price?.toFixed(2) || 'N/A'}
                      {stock.change_percent !== null && (
                        <span className={`ml-1 text-xs ${stock.change_percent > 0 ? 'text-green-300' : 'text-red-300'}`}>
                          {stock.change_percent > 0 ? '▲' : '▼'}{Math.abs(stock.change_percent).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs">Mkt Cap</span>
                    <div className="font-semibold">{formatMarketCap(stock.market_cap)}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs">52W High</span>
                    <div className="font-semibold text-green-300">${stats.high.toFixed(0)}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs">52W Low</span>
                    <div className="font-semibold text-red-300">${stats.low.toFixed(0)}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs">Volume</span>
                    <div className="font-semibold">{stats.volume}</div>
                  </div>
                  <div>
                    <span className="text-white/60 text-xs">Dividend</span>
                    <div className="font-semibold">{stats.dividend} ({stats.yield})</div>
                  </div>
                </div>
                {/* Desktop: table */}
                <table className="text-sm hidden md:table">
                  <tbody>
                    <tr>
                      <td className="opacity-70 pr-6 py-1">Price</td>
                      <td className="font-bold py-1">
                        ${stock.price?.toFixed(2) || 'N/A'}
                        {stock.change_percent !== null && (
                          <span className={`ml-2 ${stock.change_percent > 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {stock.change_percent > 0 ? '▲' : '▼'} {Math.abs(stock.change_percent).toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="opacity-70 px-6 py-1">Volume</td>
                      <td className="font-semibold py-1">{stats.volume}</td>
                    </tr>
                    <tr>
                      <td className="opacity-70 py-1">Mkt Cap</td>
                      <td className="font-semibold py-1">{formatMarketCap(stock.market_cap)}</td>
                      <td className="opacity-70 px-6 py-1">52W High</td>
                      <td className="font-semibold py-1 text-green-300">${stats.high.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="opacity-70 py-1">Div</td>
                      <td className="font-semibold py-1">{stats.dividend}</td>
                      <td className="opacity-70 px-6 py-1">52W Low</td>
                      <td className="font-semibold py-1 text-red-300">${stats.low.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="opacity-70 py-1">Yield</td>
                      <td className="font-semibold py-1">{stats.yield}</td>
                      <td className="opacity-70 px-6 py-1">Avg Vol</td>
                      <td className="font-semibold py-1">{stats.avgVolume}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Markets */}
          {builder.markets && (
            <div className="flex flex-wrap gap-2 mt-6">
              {builder.markets.map((market: string) => (
                <span key={market} className="px-4 py-2 bg-white/20 backdrop-blur rounded-full text-sm font-semibold">
                  📍 {market}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* Alert Subscription Box */}
        <div className="mb-12 bg-white rounded-lg shadow-lg p-8 border-l-4 border-teal-500">
          <div className="flex items-start gap-4 mb-4">
            <Bell className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Alerts for {builder.name}</h3>
              <p className="text-gray-600 mb-6">Receive emails when new 10-K filings and earnings calls are released.</p>

              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={subscriptionEmail}
                  onChange={(e) => setSubscriptionEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={subscribing}
                />
                <button
                  type="submit"
                  disabled={subscribing}
                  className="px-6 py-2 bg-gradient-to-r from-navy-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
                >
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>

              {subscriptionStatus === 'success' && (
                <p className="mt-2 text-green-600 text-sm flex items-center gap-1">
                  <Check className="w-4 h-4" /> Confirmation email sent!
                </p>
              )}
              {subscriptionStatus === 'error' && (
                <p className="mt-2 text-red-600 text-sm">Error subscribing. Please try again.</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs - scrollable on mobile */}
        <div className="mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-4 sm:gap-8 min-w-max px-1">
            <button
              onClick={() => setActiveTab('10k')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition text-sm whitespace-nowrap ${
                activeTab === '10k'
                  ? 'border-navy-700 text-navy-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 10-K ({tenK.length})
            </button>
            <button
              onClick={() => setActiveTab('10q')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition text-sm whitespace-nowrap ${
                activeTab === '10q'
                  ? 'border-teal-700 text-teal-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 10-Q ({tenQ.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition text-sm whitespace-nowrap ${
                activeTab === 'earnings'
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📞 Earnings ({earnings.length})
            </button>
            <button
              onClick={() => setActiveTab('presentations')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition text-sm whitespace-nowrap ${
                activeTab === 'presentations'
                  ? 'border-purple-700 text-purple-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Presentations ({presentations.length})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-semibold transition text-sm whitespace-nowrap ${
                activeTab === 'news'
                  ? 'border-teal-700 text-teal-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📰 News
            </button>
          </div>
        </div>

        {/* NEWS TAB */}
        {activeTab === 'news' && (
          <div className="mt-6">
            <NewsSection 
              ticker={builder?.ticker} 
              title={`${builder?.name} (${builder?.ticker}) News`}
              limit={10}
            />
          </div>
        )}

        {/* 10-K FILINGS TAB */}
        {activeTab === '10k' && (
          <div className="space-y-6">
            {tenK.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No 10-K filings found yet.</p>
                <p className="text-gray-400 text-sm mt-2">Historical 10-K data will appear here. Loading...</p>
              </div>
            ) : (
              tenK.map((filing) => (
                <div
                  key={filing.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition border-l-4 border-navy-500 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          Fiscal Year {filing.fiscal_year}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Filed {filing.filing_date ? new Date(filing.filing_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      {filing.link && (
                        <a
                          href={filing.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg font-semibold flex items-center gap-2 transition text-xs sm:text-sm whitespace-nowrap self-start"
                        >
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                          View SEC Filing
                        </a>
                      )}
                    </div>

                    {filing.summary && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Detailed 10-K Summary</h4>
                        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200 space-y-3">
                          {filing.summary.split('\n\n').map((section: string, i: number) => {
                            const trimmed = section.trim();
                            if (!trimmed) return null;
                            
                            // Check if this is a category header (starts with **)
                            if (trimmed.startsWith('**') && trimmed.includes(':**')) {
                              const [header, ...rest] = trimmed.split('\n');
                              const categoryLabel = header.replace(/\*\*/g, '').replace(':', '');
                              const content = rest.join('\n').replace(/^- /gm, '').trim();
                              
                              const categoryIcons: Record<string, string> = {
                                'General / Business Opportunities': '🏢',
                                'Sales and Marketing': '📢',
                                'Homebuilding Operations': '🏗️',
                                'Real Estate Inventory (Locations)': '📍',
                                'Land Acquisition and Development': '🌍',
                                'Industry and Economic Risks': '⚠️',
                                'Joint Ventures': '🤝',
                                'Margins: Home Sales Gross Margin': '📊',
                                'Impairments': '📉',
                                'Home Sales Gross Margin': '📊',
                              };
                              
                              const icon = categoryIcons[categoryLabel] || '•';
                              
                              return (
                                <div key={i} className="grid grid-cols-[28px_1fr] gap-3">
                                  <span className="text-lg text-center mt-0.5">{icon}</span>
                                  <div>
                                    <span className="font-semibold text-gray-800 text-sm">{categoryLabel}</span>
                                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{content}</p>
                                  </div>
                                </div>
                              );
                            }
                            
                            // Regular text
                            return (
                              <p key={i} className="text-sm text-gray-600 leading-relaxed pl-9">{trimmed}</p>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {filing.key_metrics && Object.keys(filing.key_metrics).length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-900 mb-4">Key Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(filing.key_metrics as Record<string, any>)
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div key={key} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-lg border border-slate-200">
                                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-lg font-bold text-slate-800 mt-2">{String(value).substring(0, 25)}</p>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 10-Q FILINGS TAB */}
        {activeTab === '10q' && (
          <div className="space-y-6">
            {tenQ.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No 10-Q filings found yet.</p>
                <p className="text-gray-400 text-sm mt-2">Quarterly report data will appear here. Loading...</p>
              </div>
            ) : (
              tenQ.map((filing) => (
                <div
                  key={filing.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition border-l-4 border-teal-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Q{filing.fiscal_quarter} {filing.fiscal_year} 10-Q
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {filing.call_date ? new Date(filing.call_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                    </div>

                    {filing.ai_summary && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Quarterly Summary</h4>
                        <p className="text-gray-700 leading-relaxed line-clamp-4">{filing.ai_summary}</p>
                        {filing.ai_summary.length > 300 && (
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold mt-2">
                            Read full summary →
                          </button>
                        )}
                      </div>
                    )}

                    {filing.key_highlights && filing.key_highlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">📊 Key Metrics & Highlights</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filing.key_highlights.slice(0, 6).map((highlight: string, i: number) => (
                            <li key={i} className="flex gap-3 p-3 bg-teal-50 rounded-lg">
                              <span className="text-teal-600 font-bold flex-shrink-0">•</span>
                              <span className="text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* EARNINGS CALLS TAB */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            {earnings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No earnings call data found yet.</p>
                <p className="text-gray-400 text-sm mt-2">Earnings call transcripts and summaries will appear here.</p>
              </div>
            ) : (
              earnings.map((call) => (
                <div
                  key={call.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition border-l-4 border-teal-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Q{call.fiscal_quarter} {call.fiscal_year} 10-Q Filing
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {call.call_date ? new Date(call.call_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      {call.link && (
                        <a
                          href={call.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View SEC Filing
                        </a>
                      )}
                    </div>

                    {call.ai_summary && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                        <p className="text-gray-700 leading-relaxed line-clamp-4">{call.ai_summary}</p>
                        {call.ai_summary.length > 300 && (
                          <button className="text-teal-600 hover:text-teal-700 text-sm font-semibold mt-2">
                            Read full summary →
                          </button>
                        )}
                      </div>
                    )}

                    {call.key_highlights && call.key_highlights.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">✨ Key Highlights</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {call.key_highlights.slice(0, 4).map((highlight: string, i: number) => (
                            <li key={i} className="flex gap-3 p-3 bg-teal-50 rounded-lg">
                              <span className="text-teal-600 font-bold flex-shrink-0">•</span>
                              <span className="text-gray-700">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* INVESTOR PRESENTATIONS TAB */}
        {activeTab === 'presentations' && (
          <div className="space-y-6">
            {presentations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">No investor presentations found yet.</p>
                <p className="text-gray-400 text-sm mt-2">Quarterly investor presentations and investor day materials will appear here.</p>
              </div>
            ) : (
              presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition border-l-4 border-purple-500 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {presentation.presentation_title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {presentation.presentation_date ? new Date(presentation.presentation_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        {presentation.pdf_link && (
                          <a
                            href={presentation.pdf_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                            PDF
                          </a>
                        )}
                        {presentation.presentation_url && (
                          <a
                            href={presentation.presentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View
                          </a>
                        )}
                      </div>
                    </div>

                    {presentation.presentation_summary && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Presentation Summary</h4>
                        <p className="text-gray-700 leading-relaxed line-clamp-4">{presentation.presentation_summary}</p>
                        {presentation.presentation_summary.length > 300 && (
                          <button className="text-purple-600 hover:text-purple-700 text-sm font-semibold mt-2">
                            Read full summary →
                          </button>
                        )}
                      </div>
                    )}

                    {presentation.financial_guidance && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">📈 Financial Guidance</h4>
                        <p className="text-gray-700 leading-relaxed">{presentation.financial_guidance}</p>
                      </div>
                    )}

                    {presentation.key_slides && presentation.key_slides.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">🎯 Key Slide Topics</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {presentation.key_slides.slice(0, 6).map((slide: string, i: number) => (
                            <li key={i} className="flex gap-3 p-3 bg-purple-50 rounded-lg">
                              <span className="text-purple-600 font-bold flex-shrink-0">•</span>
                              <span className="text-gray-700">{slide}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
