'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_L7gJaRj4UpH8UtsyC0GDHQ_6MV10N4u';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const GROSS_MARGINS: Record<string, Record<number, { homeMargin: number; revenue: string; netIncome: string; deliveries: string }>> = {
  LEN: {
    2025: { homeMargin: 21.6, revenue: '$35.2B', netIncome: '$4.32B', deliveries: '72,171' },
    2024: { homeMargin: 22.4, revenue: '$34.2B', netIncome: '$4.62B', deliveries: '73,096' },
    2023: { homeMargin: 23.8, revenue: '$32.3B', netIncome: '$4.52B', deliveries: '66,455' },
    2022: { homeMargin: 26.2, revenue: '$27.3B', netIncome: '$4.72B', deliveries: '59,152' },
  },
  DHI: {
    2025: { homeMargin: 22.1, revenue: '$36.8B', netIncome: '$4.77B', deliveries: '86,421' },
    2024: { homeMargin: 23.2, revenue: '$35.5B', netIncome: '$4.75B', deliveries: '86,952' },
    2023: { homeMargin: 24.8, revenue: '$33.5B', netIncome: '$5.86B', deliveries: '82,935' },
    2022: { homeMargin: 27.4, revenue: '$28.4B', netIncome: '$5.21B', deliveries: '73,822' },
  },
  KBH: {
    2025: { homeMargin: 20.4, revenue: '$6.6B', netIncome: '$576M', deliveries: '13,295' },
    2024: { homeMargin: 21.1, revenue: '$6.4B', netIncome: '$603M', deliveries: '13,127' },
    2023: { homeMargin: 22.5, revenue: '$5.8B', netIncome: '$688M', deliveries: '12,471' },
    2022: { homeMargin: 25.8, revenue: '$7.5B', netIncome: '$846M', deliveries: '14,506' },
  },
  TOL: {
    2025: { homeMargin: 24.5, revenue: '$10.9B', netIncome: '$1.38B', deliveries: '11,156' },
    2024: { homeMargin: 25.8, revenue: '$10.3B', netIncome: '$1.42B', deliveries: '10,636' },
    2023: { homeMargin: 27.2, revenue: '$9.99B', netIncome: '$1.37B', deliveries: '10,167' },
    2022: { homeMargin: 29.1, revenue: '$9.0B', netIncome: '$1.22B', deliveries: '9,541' },
  },
  PHM: {
    2025: { homeMargin: 25.2, revenue: '$17.1B', netIncome: '$2.81B', deliveries: '32,727' },
    2024: { homeMargin: 27.1, revenue: '$16.4B', netIncome: '$2.79B', deliveries: '31,485' },
    2023: { homeMargin: 29.4, revenue: '$15.6B', netIncome: '$2.81B', deliveries: '29,585' },
    2022: { homeMargin: 31.2, revenue: '$13.3B', netIncome: '$2.65B', deliveries: '26,569' },
  },
  NVR: {
    2025: { homeMargin: 23.8, revenue: '$9.7B', netIncome: '$1.56B', deliveries: '21,253' },
    2024: { homeMargin: 25.0, revenue: '$9.4B', netIncome: '$1.50B', deliveries: '20,730' },
    2023: { homeMargin: 26.4, revenue: '$9.0B', netIncome: '$1.50B', deliveries: '19,785' },
    2022: { homeMargin: 28.2, revenue: '$8.7B', netIncome: '$1.69B', deliveries: '19,912' },
  },
  TPH: {
    2025: { homeMargin: 19.8, revenue: '$4.2B', netIncome: '$390M', deliveries: '6,783' },
    2024: { homeMargin: 20.6, revenue: '$4.0B', netIncome: '$380M', deliveries: '6,541' },
    2023: { homeMargin: 22.1, revenue: '$3.6B', netIncome: '$395M', deliveries: '6,315' },
    2022: { homeMargin: 25.0, revenue: '$5.9B', netIncome: '$651M', deliveries: '8,676' },
  },
  CVCO: {
    2025: { homeMargin: 22.8, revenue: '$2.0B', netIncome: '$180M', deliveries: '7,100' },
    2024: { homeMargin: 23.4, revenue: '$1.9B', netIncome: '$169M', deliveries: '6,800' },
    2023: { homeMargin: 24.1, revenue: '$1.8B', netIncome: '$147M', deliveries: '6,500' },
    2022: { homeMargin: 25.6, revenue: '$1.7B', netIncome: '$157M', deliveries: '6,200' },
  },
  LGIH: {
    2025: { homeMargin: 18.2, revenue: '$2.3B', netIncome: '$155M', deliveries: '7,810' },
    2024: { homeMargin: 19.8, revenue: '$2.2B', netIncome: '$172M', deliveries: '7,589' },
    2023: { homeMargin: 21.5, revenue: '$2.1B', netIncome: '$218M', deliveries: '7,301' },
    2022: { homeMargin: 24.8, revenue: '$2.6B', netIncome: '$310M', deliveries: '7,918' },
  },
};

export default function ComparePage() {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2025);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('builders').select('*').order('name');
      if (data) {
        const withStock = await Promise.all(
          data.map(async (b) => {
            const { data: s } = await supabase
              .from('stock_prices')
              .select('price,market_cap,change_percent')
              .eq('builder_id', b.id)
              .order('date', { ascending: false })
              .limit(1)
              .single();
            return { ...b, stock: s || undefined };
          })
        );
        setBuilders(withStock);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const years = [2025, 2024, 2023, 2022];

  const comparison = builders
    .map((b) => ({ ...b, margins: GROSS_MARGINS[b.ticker] || {} }))
    .sort((a, b) => (b.margins[selectedYear]?.homeMargin || 0) - (a.margins[selectedYear]?.homeMargin || 0));

  const maxMargin = Math.max(...comparison.map((b) => b.margins[selectedYear]?.homeMargin || 0));

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-3 sm:mb-4 transition text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">Builder Comparison</h1>
          </div>
          <p className="text-sm sm:text-base text-slate-300">Gross margins and key financial data across all homebuilders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Year selector */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
                selectedYear === y
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-teal-300'
              }`}
            >
              FY{y}
            </button>
          ))}
        </div>

        {/* Gross Margin Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6">
            📊 Gross Margin — FY{selectedYear}
          </h2>
          <div className="space-y-3 sm:space-y-4">
            {comparison.map((builder, i) => {
              const m = builder.margins[selectedYear];
              if (!m) return null;
              return (
                <div key={builder.id}>
                  {/* Mobile layout */}
                  <div className="sm:hidden">
                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{builder.ticker}</span>
                        <span className="text-gray-400 text-xs ml-2">{builder.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{m.homeMargin}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${m.homeMargin >= 25 ? 'bg-green-500' : m.homeMargin >= 22 ? 'bg-teal-500' : 'bg-orange-500'}`}
                        style={{ width: `${Math.min((m.homeMargin / (maxMargin * 1.1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                      <span>Rev: {m.revenue}</span>
                      <span>NI: {m.netIncome}</span>
                    </div>
                  </div>
                  {/* Desktop layout */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2">
                      <span className="font-bold text-gray-900">{builder.ticker}</span>
                      <span className="text-xs text-gray-400 ml-1">#{i + 1}</span>
                    </div>
                    <div className="col-span-6">
                      <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${m.homeMargin >= 25 ? 'bg-green-500' : m.homeMargin >= 22 ? 'bg-teal-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min((m.homeMargin / (maxMargin * 1.1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="col-span-1 text-right font-bold text-gray-900">{m.homeMargin}%</div>
                    <div className="col-span-3 text-right text-xs text-gray-500 space-x-4">
                      <span>Rev: <span className="font-semibold text-gray-700">{m.revenue}</span></span>
                      <span>NI: <span className="font-semibold text-gray-700">{m.netIncome}</span></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Comparison — Mobile Cards */}
        <div className="sm:hidden space-y-3 mb-6">
          <h2 className="text-base font-bold text-gray-900">📋 FY{selectedYear} Details</h2>
          {comparison.map((builder) => {
            const m = builder.margins[selectedYear];
            const mPrev = builder.margins[selectedYear - 1];
            const delta = m && mPrev ? m.homeMargin - mPrev.homeMargin : null;
            if (!m) return null;
            return (
              <Link key={builder.id} href={`/builders/${builder.id}`} className="block bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-gray-900">{builder.name}</div>
                    <div className="text-xs text-gray-400">{builder.ticker}</div>
                  </div>
                  {builder.stock && (
                    <div className="text-right">
                      <div className="font-bold text-gray-900">${builder.stock.price.toFixed(2)}</div>
                      <div className={`text-xs font-medium ${builder.stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {builder.stock.change_percent >= 0 ? '▲' : '▼'}{Math.abs(builder.stock.change_percent).toFixed(1)}%
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">Revenue</div>
                    <div className="font-semibold text-gray-800 text-sm">{m.revenue}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">Net Income</div>
                    <div className="font-semibold text-gray-800 text-sm">{m.netIncome}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase">Margin</div>
                    <div className={`font-bold text-sm ${m.homeMargin >= 25 ? 'text-green-600' : m.homeMargin >= 22 ? 'text-teal-600' : 'text-orange-600'}`}>
                      {m.homeMargin}%
                      {delta !== null && (
                        <span className="text-[10px] ml-1">{delta >= 0 ? '↑' : '↓'}{Math.abs(delta).toFixed(1)}pp</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Full Comparison — Desktop Table */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">📋 Full Comparison — FY{selectedYear}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Builder</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Price</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Chg</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Mkt Cap</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Revenue</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Net Inc</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Margin</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Deliveries</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-600 uppercase text-xs">Trend</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((builder) => {
                  const m = builder.margins[selectedYear];
                  const mPrev = builder.margins[selectedYear - 1];
                  const marginDelta = m && mPrev ? m.homeMargin - mPrev.homeMargin : null;
                  return (
                    <tr key={builder.id} className="border-b border-gray-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <Link href={`/builders/${builder.id}`} className="font-semibold text-gray-900 hover:text-teal-600 transition">{builder.name}</Link>
                        <div className="text-xs text-gray-400">{builder.ticker}</div>
                      </td>
                      <td className="text-right px-3 py-3 font-semibold text-gray-900">{builder.stock ? `$${builder.stock.price.toFixed(2)}` : '—'}</td>
                      <td className="text-right px-3 py-3">
                        {builder.stock ? (
                          <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded ${builder.stock.change_percent >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {builder.stock.change_percent >= 0 ? '▲' : '▼'}{Math.abs(builder.stock.change_percent).toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="text-right px-3 py-3 font-semibold text-gray-900">{builder.stock ? `$${(builder.stock.market_cap / 1e9).toFixed(1)}B` : '—'}</td>
                      <td className="text-right px-3 py-3 text-gray-700">{m?.revenue || '—'}</td>
                      <td className="text-right px-3 py-3 font-semibold text-gray-900">{m?.netIncome || '—'}</td>
                      <td className="text-right px-3 py-3">
                        <span className={`font-bold ${(m?.homeMargin || 0) >= 25 ? 'text-green-600' : (m?.homeMargin || 0) >= 22 ? 'text-teal-600' : 'text-orange-600'}`}>
                          {m?.homeMargin ? `${m.homeMargin}%` : '—'}
                        </span>
                      </td>
                      <td className="text-right px-3 py-3 text-gray-700">{m?.deliveries || '—'}</td>
                      <td className="text-right px-3 py-3">
                        {marginDelta !== null ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${marginDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {marginDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {marginDelta >= 0 ? '+' : ''}{marginDelta.toFixed(1)}pp
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4-Year Trend — Mobile Cards */}
        <div className="sm:hidden mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">📈 4-Year Margin Trend</h2>
          <div className="space-y-2">
            {comparison.map((builder) => {
              const m25 = builder.margins[2025]?.homeMargin;
              const m22 = builder.margins[2022]?.homeMargin;
              const delta = m25 && m22 ? m25 - m22 : null;
              return (
                <div key={builder.id} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 text-sm">{builder.ticker}</span>
                    {delta !== null && (
                      <span className={`text-xs font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {delta >= 0 ? '+' : ''}{delta.toFixed(1)}pp
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-center text-xs">
                    {years.map((y) => (
                      <div key={y} className="bg-gray-50 rounded py-1">
                        <div className="text-[9px] text-gray-400">FY{String(y).slice(2)}</div>
                        <div className={`font-semibold ${builder.margins[y]?.homeMargin >= 25 ? 'text-green-600' : 'text-gray-700'}`}>
                          {builder.margins[y]?.homeMargin ? `${builder.margins[y].homeMargin}%` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4-Year Trend — Desktop Table */}
        <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">📈 4-Year Gross Margin Trend (FY2022–FY2025)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Builder</th>
                {years.map((y) => (
                  <th key={y} className="text-right px-4 py-3 font-semibold text-gray-600">FY{y}</th>
                ))}
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Change</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((builder) => {
                const margins = years.map((y) => builder.margins[y]?.homeMargin);
                const delta = margins[0] && margins[3] ? margins[0] - margins[3] : null;
                return (
                  <tr key={builder.id} className="border-b border-gray-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3"><span className="font-semibold text-gray-900">{builder.ticker}</span></td>
                    {years.map((y) => (
                      <td key={y} className="text-right px-4 py-3">
                        <span className={`font-medium ${(builder.margins[y]?.homeMargin || 0) >= 25 ? 'text-green-600' : (builder.margins[y]?.homeMargin || 0) >= 22 ? 'text-teal-600' : 'text-orange-600'}`}>
                          {builder.margins[y]?.homeMargin ? `${builder.margins[y].homeMargin}%` : '—'}
                        </span>
                      </td>
                    ))}
                    <td className="text-right px-4 py-3">
                      {delta !== null ? (
                        <span className={`font-bold ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}pp
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
