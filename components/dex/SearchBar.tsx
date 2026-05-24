"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageContext";

type SearchModel = {
  id: string;
  name: string;
  time: string;
  isOpenSource?: boolean;
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

export default function SearchBar() {
  const { t } = useLanguage();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [models, setModels] = useState<SearchModel[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchModel[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/dex/data/models_search.json")
      .then((response) => response.json())
      .then((data: SearchModel[]) => setModels(data))
      .catch(() => setModels([]));
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (!value) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    const matches = models
      .filter((model) => fuzzyMatch(value, model.name))
      .sort((a, b) => matchScore(value, b.name) - matchScore(value, a.name))
      .slice(0, 8);
    setSuggestions(matches);
    setActiveIndex(-1);
    setIsOpen(matches.length > 0);
  }, [models, query]);

  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  const search = useCallback(
    (name?: string) => {
      const value = name || query.trim();
      if (!value) return;
      setIsOpen(false);
      router.push(`/dex/models?q=${encodeURIComponent(value)}`);
    },
    [query, router]
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && isOpen) {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp" && isOpen) {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      search(activeIndex >= 0 ? suggestions[activeIndex].name : undefined);
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center bg-white/10 backdrop-blur border border-white/30 rounded-lg overflow-hidden focus-within:border-white/60">
        <svg className="w-5 h-5 text-white/60 ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={t.dex.modelSearch.searchPlaceholder}
          className="flex-1 min-w-0 bg-transparent text-white placeholder-white/50 px-3 py-3 outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => search()}
          className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors"
        >
          {t.dex.modelSearch.searchButton}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full inset-x-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50">
          {suggestions.map((model, index) => (
            <button
              key={model.id}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                search(model.name);
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left ${
                activeIndex === index ? "bg-primary-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="text-sm font-medium text-slate-800 truncate">{model.name}</span>
              <span className="flex items-center gap-2 shrink-0">
                {model.isOpenSource && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded">
                    {t.dex.modelSearch.openSource}
                  </span>
                )}
                <span className="text-xs text-slate-400">{model.time}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
