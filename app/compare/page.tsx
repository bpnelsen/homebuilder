'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { TrendingUp, TrendingDown, X } from 'lucide-react';

// Use environment variables with fallback values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L7gJaRj4UpH8UtsyC0GDHQ_6MV10N4u';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Compare() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [stocks, setStocks] = useState<Record<string, any>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all builders
        const { data: builderData } = await supabase.from('builders').select('*').order('name');
        setBuilders(builderData || []);

        // Fetch stock prices for all builders
        if (builderData && builderData.length > 0) {
          const stockPromises = builderData.map((builder) =>
            supabase
              .from('stock_prices')
              .select('*')
              .eq('builder_id', builder.id)
              .order('created_at', { ascending: false })
              .limit(1)
          );

          const stockResults = await Promise.all(stockPromises);
          const stockMap: Record<string, any> = {};

          stockResults.forEach((result, index) => {
            if (result.data && result.data.length > 0) {
              stockMap[builderData[index].id] = result.data[0];
            }
          });

          setStocks(stockMap);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleBuilder = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const selectedBuilders = builders.filter((b) => selected.includes(b.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-700 via-navy-600 to-teal-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">Compare Home Builders</h1>
          <p className="text-lg opacity-90">Select multiple builders to see side-by-side comparison</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Builder Selection */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Builders</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading builders...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {builders.map((builder) => (
                <button
                  key={builder.id}
                  onClick={() => toggleBuilder(builder.id)}
                  className={`p-4 rounded-lg border-2 transition transform hover:scale-105 ${
                    selected.includes(builder.id)
                      ? 'border-navy-700 bg-navy-50 shadow-lg ring-2 ring-navy-300'
                      : 'border-gray-200 bg-white hover:border-navy-200'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{builder.name}</p>
                  <p className="text-lg font-bold text-navy-600">{builder.ticker}</p>
                  {stocks[builder.id] && (
                    <p className="text-sm text-gray-600 mt-2">
                      ${stocks[builder.id].price?.toFixed(2) || 'N/A'}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selectedBuilders.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-navy-700 to-teal-600 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Metric</th>
                    {selectedBuilders.map((builder) => (
                      <th key={builder.id} className="px-6 py-4 text-left font-semibold">
                        <Link href={`/builders/${builder.id}`} className="hover:opacity-80 transition">
                          {builder.name}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Ticker Row */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Ticker</td>
                    {selectedBuilders.map((builder) => (
                      <td key={builder.id} className="px-6 py-4 text-gray-700">
                        <span className="inline-block px-3 py-1 bg-navy-100 text-navy-700 rounded font-semibold">
                          {builder.ticker}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Stock Price Row */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Stock Price</td>
                    {selectedBuilders.map((builder) => {
                      const stock = stocks[builder.id];
                      return (
                        <td key={builder.id} className="px-6 py-4">
                          {stock ? (
                            <div>
                              <p className="text-lg font-bold text-gray-900">
                                ${stock.price?.toFixed(2) || 'N/A'}
                              </p>
                              {stock.change_percent && (
                                <p
                                  className={`text-sm font-semibold flex items-center gap-1 ${
                                    stock.change_percent > 0 ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {stock.change_percent > 0 ? (
                                    <TrendingUp className="w-4 h-4" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4" />
                                  )}
                                  {Math.abs(stock.change_percent).toFixed(2)}%
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500">No data</p>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Market Cap Row */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Market Cap</td>
                    {selectedBuilders.map((builder) => {
                      const stock = stocks[builder.id];
                      return (
                        <td key={builder.id} className="px-6 py-4 text-gray-700">
                          {stock && stock.market_cap
                            ? `$${(stock.market_cap / 1e9).toFixed(2)}B`
                            : 'No data'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Markets Row */}
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">Markets</td>
                    {selectedBuilders.map((builder) => (
                      <td key={builder.id} className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {builder.markets?.map((market: string) => (
                            <span
                              key={market}
                              className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded"
                            >
                              {market}
                            </span>
                          )) || <p className="text-gray-500">N/A</p>}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Clear Selection */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setSelected([])}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition"
              >
                <X className="w-4 h-4" /> Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {selectedBuilders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <p className="text-xl text-gray-600 mb-2">No builders selected</p>
            <p className="text-gray-500">Select 2 or more builders above to compare their metrics and performance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
