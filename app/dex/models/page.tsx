"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

type SearchResult = {
  name: string;
  score: number;
  rank?: number;
  source?: string | null;
};

type SearchModel = {
  id: string;
  name: string;
  title: string;
  time: string;
  paper?: { label: string; url: string };
  project?: { label: string; url: string };
  isOpenSource?: boolean;
  benchmarks: Record<string, SearchResult>;
};

const fuzzyMatch = (query: string, target: string) => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.includes(q)) return true;
  let index = 0;
  for (const char of t) {
    if (char === q[index]) index += 1;
    if (index === q.length) return true;
  }
  return false;
};

const matchScore = (query: string, target: string) => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (q === t) return 100;
  if (t.startsWith(q)) return 80;
  if (t.includes(q)) return 60;
  return 20;
};

function DexModelsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [models, setModels] = useState<SearchModel[]>([]);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [openOnly, setOpenOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "name">("date");

  useEffect(() => {
    fetch("/dex/data/models_search.json")
      .then((response) => response.json())
      .then((data: SearchModel[]) => setModels(data))
      .catch(() => setModels([]));
  }, []);

  useEffect(() => {
    const currentQuery = searchParams.get("q") || "";
    setQuery(currentQuery);
    setInputValue(currentQuery);
  }, [searchParams]);

  const submitSearch = () => {
    const nextQuery = inputValue.trim();
    router.push(nextQuery ? `/dex/models?q=${encodeURIComponent(nextQuery)}` : "/dex/models");
  };

  const filteredModels = useMemo(() => {
    const search = query.trim();
    return models
      .filter((model) => (!search || fuzzyMatch(search, model.name)) && (!openOnly || model.isOpenSource))
      .sort((a, b) => {
        if (search) {
          const scoreDelta = matchScore(search, b.name) - matchScore(search, a.name);
          if (scoreDelta !== 0) return scoreDelta;
        }
        return sortBy === "name" ? a.name.localeCompare(b.name) : b.time.localeCompare(a.time);
      });
  }, [models, openOnly, query, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/dex" className="text-sm text-slate-400 hover:text-white transition-colors">
            {t.dex.modelSearch.backHome}
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">{t.dex.modelSearch.title}</h1>
          <p className="text-slate-400 mb-6">{t.dex.modelSearch.subtitle}</p>
          <div className="flex items-center bg-white/10 backdrop-blur border border-white/30 rounded-lg overflow-hidden focus-within:border-white/60">
            <svg className="w-5 h-5 text-white/60 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitSearch()}
              placeholder={t.dex.modelSearch.searchPlaceholder}
              className="flex-1 min-w-0 bg-transparent text-white placeholder-white/50 px-3 py-3 outline-none text-sm"
            />
            <button
              type="button"
              onClick={submitSearch}
              className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-sm font-medium transition-colors"
            >
              {t.dex.modelSearch.searchButton}
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={openOnly}
              onChange={(event) => setOpenOnly(event.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-600"
            />
            {t.dex.modelSearch.openSourceOnly}
          </label>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "date" | "name")}
              className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600"
            >
              <option value="date">{t.dex.modelSearch.sortByDate}</option>
              <option value="name">{t.dex.modelSearch.sortByName}</option>
            </select>
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-slate-800">{filteredModels.length}</span> {t.dex.modelSearch.results}
            </span>
          </div>
        </div>

        {filteredModels.length === 0 ? (
          <div className="text-center text-slate-600 py-16">
            <p className="font-medium">{t.dex.modelSearch.noResults}</p>
            <p className="text-sm text-slate-500 mt-1">{t.dex.modelSearch.noResultsHint}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredModels.map((model) => (
              <article key={model.id} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{model.name}</h2>
                      {model.isOpenSource && (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                          {t.dex.modelSearch.openSource}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{model.title}</p>
                    <p className="text-xs text-slate-500 mt-2">{model.time}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {model.paper && (
                      <a href={model.paper.url} target="_blank" rel="noreferrer" className="badge text-primary-600">
                        {t.dex.modelSearch.paper}
                      </a>
                    )}
                    {model.project && (
                      <a href={model.project.url} target="_blank" rel="noreferrer" className="badge text-primary-600">
                        {t.dex.modelSearch.project}
                      </a>
                    )}
                  </div>
                </div>

                <h3 className="text-xs uppercase text-slate-500 font-semibold mt-5 mb-2">{t.dex.modelSearch.scores}</h3>
                <div className="divide-y divide-slate-100 border-t border-slate-100">
                  {Object.entries(model.benchmarks).map(([benchmarkId, result]) => (
                    <div key={benchmarkId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div>
                        <Link href={`/dex/benchmarks/${benchmarkId}`} className="font-medium text-slate-800 hover:text-primary-600">
                          {result.name}
                        </Link>
                        {result.source && (
                          <p className="text-xs text-slate-500 mt-1">
                            {t.dex.modelSearch.source}: {result.source}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {result.rank && <span className="text-slate-500">#{result.rank}</span>}
                        <span className="font-mono font-semibold text-primary-600">{result.score.toFixed(2)}</span>
                        <Link href={`/dex/benchmarks/${benchmarkId}`} className="text-primary-600 hover:text-primary-700">
                          {t.dex.modelSearch.viewLeaderboard}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DexModelsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <DexModelsContent />
    </Suspense>
  );
}
