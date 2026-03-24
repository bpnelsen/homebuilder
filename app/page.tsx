'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, Building2, DollarSign, ArrowUpRight, ArrowDownRight, Newspaper, BarChart3, GitCompareArrows } from 'lucide-react';
import NewsSection from '@/components/NewsSection';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L7gJaRj4UpH8UtsyC0GDHQ_6MV10N4u';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Builder {
  id: string;
  name: string;
  ticker: string;
  website: string;
  markets: string[];
}

interface StockPrice {
  price: number;
  market_cap: number;
  change_percent: number;
}

function formatMarketCap(cap: number | null): string {
  if (cap === null || cap === undefined || isNaN(cap)) return '—';
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap.toLocaleString()}`;
}

export default function Home() {
  const [builders, setBuilders] = useState<(Builder & { stock?: StockPrice })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: builderData } = await supabase.from('builders').select('*').order('name');
        if (builderData) {
          const buildersWithPrices = await Promise.all(
            builderData.map(async (builder) => {
              const { data: priceData } = await supabase
                .from('stock_prices')
                .select('price, market_cap, change_percent')
                .eq('builder_id', builder.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();
              return { ...builder, stock: priceData || undefined };
            })
          );
          setBuilders(buildersWithPrices);
        }
      } catch (error) {
        console.error('Error fetching builders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = builders.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.ticker.toLowerCase().includes(search.toLowerCase())
  );

  const totalMarketCap = builders.reduce((sum, b) => sum + (b.stock?.market_cap || 0), 0);
  const avgChange = builders.length
    ? builders.reduce((sum, b) => sum + (b.stock?.change_percent || 0), 0) / builders.length
    : 0;
  const gainers = builders.filter(b => (b.stock?.change_percent || 0) > 0).length;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
            <span className="text-xs sm:text-sm font-medium text-teal-400 tracking-wide uppercase">Financial Intelligence Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3">Home Builder Research</h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-4">
            10-K filings, stock data, and financial analysis for 9 publicly traded homebuilders.
          </p>
          <Link href="/compare" className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition text-sm">
            <GitCompareArrows className="w-4 h-4" /> Compare All Builders
          </Link>

          {/* Stats - 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Total Market Cap</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{formatMarketCap(totalMarketCap)}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Avg Change</p>
              <p className={`text-xl sm:text-2xl font-bold mt-1 ${avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">Gainers</p>
              <p className="text-xl sm:text-2xl font-bold mt-1 text-green-400">{gainers}<span className="text-sm text-slate-400">/{builders.length}</span></p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-white/10">
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wide">10-K Reports</p>
              <p className="text-xl sm:text-2xl font-bold mt-1">36+</p>
            </div>
          </div>
        </div>
      </div>

      {/* News Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5">
          <NewsSection 
            query="residential construction homebuilder housing" 
            title="🏠 Industry News"
            limit={5}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Search */}
        {!loading && builders.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter builders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition shadow-sm text-sm"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="h-10 w-10 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading builders...</p>
          </div>
        ) : (
          <>
            {/* MOBILE: Card layout */}
            <div className="md:hidden space-y-3">
              {filtered.map((builder) => (
                <Link
                  key={builder.id}
                  href={`/builders/${builder.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-teal-200 transition active:bg-slate-50"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{builder.name}</div>
                      <div className="text-sm text-gray-500">{builder.ticker}</div>
                    </div>
                    {builder.stock && (
                      <div className="text-right">
                        <div className="font-bold text-gray-900">${builder.stock.price.toFixed(2)}</div>
                        <div className={`text-xs font-semibold ${builder.stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {builder.stock.change_percent >= 0 ? '▲' : '▼'} {Math.abs(builder.stock.change_percent).toFixed(2)}%
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase">Market Cap</span>
                      <div className="font-semibold text-gray-800 text-sm">
                        {builder.stock ? formatMarketCap(builder.stock.market_cap) : '—'}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {builder.markets?.slice(0, 2).map((m) => (
                        <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">{m}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* DESKTOP: Table layout */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-3">Builder</div>
                <div className="col-span-1 text-right">Price</div>
                <div className="col-span-1 text-right">Change</div>
                <div className="col-span-2 text-right">Market Cap</div>
                <div className="col-span-4">Markets</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              {filtered.map((builder) => (
                <Link
                  key={builder.id}
                  href={`/builders/${builder.id}`}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-slate-50 transition-colors group items-center last:border-b-0"
                >
                  <div className="col-span-3">
                    <div className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{builder.name}</div>
                    <div className="text-sm text-gray-500">{builder.ticker}</div>
                  </div>
                  <div className="col-span-1 text-right">
                    {builder.stock ? (
                      <span className="font-semibold text-gray-900">${builder.stock.price.toFixed(2)}</span>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </div>
                  <div className="col-span-1 text-right">
                    {builder.stock ? (
                      <span className={`inline-flex items-center gap-0.5 text-sm font-medium px-2 py-0.5 rounded ${
                        builder.stock.change_percent >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {builder.stock.change_percent >= 0 ? '▲' : '▼'}
                        {Math.abs(builder.stock.change_percent).toFixed(2)}%
                      </span>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </div>
                  <div className="col-span-2 text-right">
                    {builder.stock ? (
                      <span className="font-semibold text-gray-900">{formatMarketCap(builder.stock.market_cap)}</span>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </div>
                  <div className="col-span-4">
                    <div className="flex flex-wrap gap-1.5">
                      {builder.markets?.slice(0, 3).map((market) => (
                        <span key={market} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded">{market}</span>
                      ))}
                      {(builder.markets?.length || 0) > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">+{builder.markets!.length - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-sm text-teal-500 group-hover:text-teal-600 font-medium opacity-0 group-hover:opacity-100 transition">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Market Overview — All Builders at a Glance */}
        {!loading && builders.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">📊 Market Overview</h2>
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 sm:gap-3">
              {builders.map((builder) => (
                <Link
                  key={builder.id}
                  href={`/builders/${builder.id}`}
                  className="text-center p-2 sm:p-3 rounded-lg border border-gray-100 hover:border-teal-200 hover:bg-teal-50/50 transition group"
                >
                  <div className="text-[10px] sm:text-xs font-bold text-gray-700 group-hover:text-teal-600">{builder.ticker}</div>
                  {builder.stock && (
                    <>
                      <div className="text-xs sm:text-sm font-semibold text-gray-900 mt-1">${builder.stock.price.toFixed(0)}</div>
                      <div className={`text-[10px] sm:text-xs font-medium ${
                        builder.stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {builder.stock.change_percent >= 0 ? '+' : ''}{builder.stock.change_percent.toFixed(1)}%
                      </div>
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
