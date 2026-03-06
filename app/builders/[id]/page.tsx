'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ExternalLink, TrendingUp, TrendingDown, Bell, Copy, Check } from 'lucide-react';

// Use environment variables with fallback values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L7gJaRj4UpH8UtsyC0GDHQ_6MV10N4u';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function BuilderDetail({ params }: { params: { id: string } }) {
  const [builder, setBuilder] = useState<any>(null);
  const [stock, setStock] = useState<any>(null);
  const [tenK, setTenK] = useState<any[]>([]);
  const [tenQ, setTenQ] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'10k' | '10q' | 'earnings'>('10k');
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

        // Fetch all filings via API (includes historical 10-K and 10-Q)
        try {
          const response = await fetch(`/api/filings/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setTenK(data.tenK || []);
            setTenQ(data.tenQ || []);
            setEarnings(data.tenQ || []); // Use same data for earnings calls for now
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
          setEarnings(tenQData || []); // Use same data for earnings calls for now
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">{builder.name}</h1>
          
          <div className="flex flex-wrap gap-6 items-center mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">{builder.ticker}</span>
              {builder.website && (
                <a
                  href={builder.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  Visit Website <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>

            {stock && (
              <div className="bg-white/10 backdrop-blur px-6 py-3 rounded-lg">
                <div className="text-sm opacity-90">Stock Price</div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  ${stock.price?.toFixed(2) || 'N/A'}
                  {stock.change_percent && (
                    <span className={stock.change_percent > 0 ? 'text-green-300' : 'text-red-300'}>
                      {stock.change_percent > 0 ? '↑' : '↓'} {Math.abs(stock.change_percent).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {builder.markets && (
            <div className="flex flex-wrap gap-2">
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

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('10k')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === '10k'
                  ? 'border-navy-700 text-navy-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📄 10-K Filings ({tenK.length})
            </button>
            <button
              onClick={() => setActiveTab('10q')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === '10q'
                  ? 'border-teal-700 text-teal-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 10-Q Filings ({tenQ.length})
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`py-4 px-2 border-b-2 font-semibold transition ${
                activeTab === 'earnings'
                  ? 'border-green-700 text-green-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📞 Earnings Calls ({earnings.length})
            </button>
          </div>
        </div>

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
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Fiscal Year {filing.fiscal_year}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Filed {filing.filing_date ? new Date(filing.filing_date).toLocaleDateString() : 'Date TBD'}
                        </p>
                      </div>
                      {filing.link && (
                        <a
                          href={filing.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-4 px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View SEC Filing
                        </a>
                      )}
                    </div>

                    {filing.summary && (
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                        <p className="text-gray-700 leading-relaxed line-clamp-4">{filing.summary}</p>
                        {filing.summary.length > 300 && (
                          <button className="text-navy-600 hover:text-navy-700 text-sm font-semibold mt-2">
                            Read full summary →
                          </button>
                        )}
                      </div>
                    )}

                    {filing.key_metrics && Object.keys(filing.key_metrics).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Key Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(filing.key_metrics as Record<string, any>)
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div key={key} className="bg-gradient-to-br from-navy-50 to-teal-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 uppercase font-semibold">{key}</p>
                                <p className="text-lg font-bold text-navy-700 mt-1">{String(value).substring(0, 20)}</p>
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
      </div>
    </div>
  );
}
