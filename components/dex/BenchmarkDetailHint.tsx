'use client';

import { useLanguage } from "@/lib/LanguageContext";

export default function BenchmarkDetailHint() {
  const { t } = useLanguage();

  return (
    <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {t.dex.benchmarkDetail.expandHint}
    </div>
  );
}
