'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Search, TrendingUp, Building2, DollarSign, ArrowUpRight, ArrowDownRight, Newspaper } from 'lucide-react';
import NewsSection from '@/components/NewsSection';

// Use environment variables with fallback values for Vercel deployment
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

export default function Home() {
  const [builders, setBuilders] = useState<(Builder & { stock?: StockPrice })[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 Supabase connecting...');
        console.log('URL:', SUPABASE_URL ? '✓ Set' : '✗ Missing');
        console.log('Key:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
        
        // Get builders
        const { data: builderData, error } = await supabase
          .from('builders')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('❌ Supabase error:', error.message);
        } else {
          console.log('✅ Builders loaded:', builderData?.length || 0);
        }

        if (builderData) {
          // Get latest stock prices
          const buildersWithPrices = await Promise.all(
            builderData.map(async (builder) => {
              const { data: priceData } = await supabase
                .from('stock_prices')
                .select('price, market_cap, change_percent')
                .eq('builder_id', builder.id)
                .order('date', { ascending: false })
                .limit(1)
                .single();

              return {
                ...builder,
                stock: priceData || undefined,
              };
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

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden mb-12">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-700/5 via-teal-500/5 to-navy-700/5 blur-3xl" />
        
        <div className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Icon badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-navy-900/10 border border-navy-900/20 rounded-full backdrop-blur-sm">
            <Building2 className="w-4 h-4 text-navy-700" />
            <span className="text-sm font-semibold text-navy-700">Financial Intelligence Platform</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-navy-700 via-navy-600 to-teal-500 bg-clip-text text-transparent">
            Research Home Builders
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl leading-relaxed mb-8">
            Choose a builder below to explore 10-K filings, earnings calls, real-time stock data, and AI-powered financial analysis.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl">
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 hover:border-navy-200/80 transition">
              <p className="text-sm text-gray-600 mb-1">Builders</p>
              <p className="text-2xl font-bold text-navy-700">{builders.length}</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 hover:border-teal-200/80 transition">
              <p className="text-sm text-gray-600 mb-1">Data Points</p>
              <p className="text-2xl font-bold text-teal-500">10K+</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-lg p-4 hover:border-navy-200/80 transition">
              <p className="text-sm text-gray-600 mb-1">Updated</p>
              <p className="text-2xl font-bold text-navy-700">Daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Industry News Section - Top of page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-12">
        <NewsSection 
          query="residential construction homebuilder housing" 
          title="🏠 Residential Construction Industry News"
          limit={8}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional Search/Filter Bar */}
        {!loading && builders.length > 0 && (
          <div className="mb-10">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-navy-700/20 to-teal-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition" />
              <div className="relative bg-white rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl hover:border-navy-200/50 transition backdrop-blur-sm">
                <Search className="absolute left-6 top-4 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter by name or ticker (optional)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-transparent text-gray-900 placeholder:text-gray-500 focus:outline-none text-lg"
                />
              </div>
            </div>
            {search && (
              <p className="mt-3 text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filtered.length}</span> of <span className="font-semibold text-gray-900">{builders.length}</span> builders
              </p>
            )}
          </div>
        )}

        {/* Builders Grid - Main showcase */}
        {loading ? (
          <div className="text-center py-32">
            <div className="inline-block">
              <div className="h-12 w-12 border-4 border-gray-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Loading builders...</p>
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <>
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {search ? `Search Results (${filtered.length})` : `All Builders (${builders.length})`}
              </h2>
              <p className="text-gray-600 mt-2">Click on any builder to view detailed financial analysis</p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {filtered.map((builder) => (
                <Link
                  key={builder.id}
                  href={`/builders/${builder.id}`}
                  className="group relative h-full"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-navy-700/10 to-teal-500/10 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  
                  {/* Card */}
                  <div className="relative bg-white border border-gray-200/50 rounded-xl p-6 shadow-md hover:shadow-2xl transition duration-500 backdrop-blur-sm hover:border-navy-200/50 h-full flex flex-col cursor-pointer">
                    {/* Top section */}
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-navy-700 transition mb-1">
                          {builder.name}
                        </h3>
                        <p className="text-sm font-semibold text-teal-500">{builder.ticker}</p>
                      </div>
                      
                      {/* Stock badge */}
                      {builder.stock && (
                        <div className="flex flex-col items-end gap-1 ml-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg border border-gray-200/50">
                          <p className="text-2xl font-bold text-gray-900">
                            ${builder.stock.price.toFixed(2)}
                          </p>
                          <div className={`flex items-center gap-1 text-sm font-semibold ${
                            builder.stock.change_percent >= 0
                              ? 'text-green-600 bg-green-50/50 px-2 py-0.5 rounded'
                              : 'text-red-600 bg-red-50/50 px-2 py-0.5 rounded'
                          }`}>
                            {builder.stock.change_percent > 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownRight className="w-3 h-3" />
                            )}
                            {Math.abs(builder.stock.change_percent).toFixed(2)}%
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Market Cap */}
                    {builder.stock && (
                      <div className="mb-4 p-4 bg-gradient-to-br from-navy-700/5 to-teal-500/5 border border-navy-200/30 rounded-lg">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Market Cap</p>
                        <p className="text-2xl font-bold text-navy-700 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-teal-500" />
                          {(builder.stock.market_cap / 1e9).toFixed(1)}B
                        </p>
                      </div>
                    )}

                    {/* Markets */}
                    {builder.markets && (
                      <div className="mt-auto pt-4 border-t border-gray-200/50">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Markets</p>
                        <div className="flex flex-wrap gap-2">
                          {builder.markets.slice(0, 3).map((market) => (
                            <span
                              key={market}
                              className="px-3 py-1.5 bg-gradient-to-r from-navy-700/10 to-teal-500/10 border border-navy-200/30 text-navy-700 text-xs font-semibold rounded-lg group-hover:border-navy-300/60 transition"
                            >
                              {market}
                            </span>
                          ))}
                          {builder.markets.length > 3 && (
                            <span className="px-3 py-1.5 bg-gray-100/50 border border-gray-300/30 text-gray-700 text-xs font-semibold rounded-lg">
                              +{builder.markets.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA hint */}
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center justify-between text-sm text-teal-500 group-hover:text-teal-600 font-medium">
                      <span>View details & analysis</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* No results state */
          <div className="text-center py-32">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-1">No builders found</p>
                <p className="text-gray-600">Try a different search term</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
