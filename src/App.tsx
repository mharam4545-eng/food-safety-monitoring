/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  ExternalLink,
  FileText,
  AlertCircle,
  ChevronRight,
  Clock,
  ShieldCheck,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MfdsItem } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [items, setItems] = useState<MfdsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/mfds');
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data: MfdsItem[] = await response.json();
      setItems(data);
      setLastUpdated(new Date().toLocaleTimeString('ko-KR'));
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categories = ["법령/고시", "입법/행정예고"] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">식품안전 법령 모니터링</h1>
              <p className="text-xs text-slate-500 font-medium">품질 연구원 전용 전문 정보 시스템</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                최근 업데이트: {lastUpdated}
              </div>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all",
                "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-sm hover:shadow-md active:scale-95"
              )}
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              {loading ? "조회 중..." : "실시간 조회"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats / Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">데이터 출처</p>
              <p className="text-sm font-bold text-slate-700">식품의약품안전처 공식자료</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">모니터링 대상</p>
              <p className="text-sm font-bold text-slate-700">법령, 고시, 행정예고</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">검색 기준</p>
              <p className="text-sm font-bold text-slate-700">식품 관련 최신 변동 사항</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {categories.map((category) => (
            <div key={category} className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  {category}
                </h2>
                <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">
                  {items.filter(i => i.category === category).length}건
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={`skeleton-${i}`} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-slate-50 rounded w-full mb-2"></div>
                        <div className="h-3 bg-slate-50 rounded w-5/6"></div>
                      </div>
                    ))
                  ) : (
                    items
                      .filter(item => item.category === category)
                      .map((item, idx) => (
                        <motion.div
                          key={item.url + idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-default"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                              {item.date}
                            </span>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-slate-500 leading-relaxed mb-4">
                            {item.summary}
                          </p>
                          <div className="flex items-center justify-end">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-bold text-slate-400 flex items-center gap-1 hover:text-emerald-600 transition-colors"
                            >
                              상세보기 <ChevronRight className="w-3 h-3" />
                            </a>
                          </div>
                        </motion.div>
                      ))
                  )}
                </AnimatePresence>

                {!loading && items.filter(i => i.category === category).length === 0 && (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                    <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">조회된 정보가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            본 시스템은 식품의약품안전처의 공개 자료를 기반으로 하며, 실시간 검색 기술을 활용합니다.
          </p>
          <p className="text-[10px] text-slate-300 mt-2">
            © 2025 Food Safety Monitoring System for Quality Researchers
          </p>
        </div>
      </footer>
    </div>
  );
}
