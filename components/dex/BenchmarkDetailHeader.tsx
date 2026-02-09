'use client';

import { shiftHslLightness } from "@/lib/dex/colors";
import { useLanguage } from "@/lib/LanguageContext";
import { Benchmark } from "@/types/dex/leaderboard";
import Link from "next/link";

export default function BenchmarkDetailHeader({
  benchmark,
  modelCount
}: {
  benchmark: Benchmark;
  modelCount: number;
}) {
  const { t } = useLanguage();
  const accent = benchmark.color || "#2563eb";
  const localizedDescription = t.dex.benchmarkDescriptions[benchmark.id] || benchmark.description;

  return (
    <div
      className="text-white py-12 px-4"
      style={{
        background: `linear-gradient(90deg, ${accent}, ${shiftHslLightness(accent, -10)})`
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
          <Link href="/dex" className="hover:text-white transition-colors">{t.dex.benchmarkDetail.home}</Link>
          <span>/</span>
          <span>{benchmark.name}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{benchmark.name} {t.dex.benchmarkDetail.leaderboardSuffix}</h1>
        <p className="text-white/80 max-w-3xl mb-4">{localizedDescription}</p>
        {benchmark.links.length > 0 && (
          <a
            href={benchmark.links[0].url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
          >
            {t.dex.benchmarkDetail.viewRepo}
          </a>
        )}
        <div className="mt-4 flex items-center gap-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
            {modelCount} {t.dex.benchmarkDetail.models}
          </span>
        </div>
      </div>
    </div>
  );
}
