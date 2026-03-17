'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

interface ModelEntry {
    name: string;
    pub_date: string | null;
    is_rl: boolean;
    is_opensource: boolean;
}

// 简单模糊匹配：连续字符都能在目标中找到（按顺序）
function fuzzyMatch(query: string, target: string): boolean {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t.includes(q)) return true;
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
        if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
}

// 计算匹配得分（用于排序）
function matchScore(query: string, target: string): number {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;
    return 20; // fuzzy
}

export default function SearchBar() {
    const { t } = useLanguage();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<ModelEntry[]>([]);
    const [allModels, setAllModels] = useState<ModelEntry[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 加载模型列表
    useEffect(() => {
        fetch('/data/models_search.json')
            .then(r => r.json())
            .then((data: ModelEntry[]) => setAllModels(data))
            .catch(() => { });
    }, []);

    // 模糊搜索过滤
    useEffect(() => {
        const q = query.trim();
        if (!q) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        const matched = allModels
            .filter(m => fuzzyMatch(q, m.name))
            .sort((a, b) => matchScore(q, b.name) - matchScore(q, a.name))
            .slice(0, 8);
        setSuggestions(matched);
        setShowDropdown(matched.length > 0);
        setActiveIndex(-1);
    }, [query, allModels]);

    // 点击外部关闭
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigate = useCallback((name?: string) => {
        const q = name || query.trim();
        if (!q) return;
        setShowDropdown(false);
        router.push(`/models?q=${encodeURIComponent(q)}`);
    }, [query, router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) {
            if (e.key === 'Enter') navigate();
            return;
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0) {
                navigate(suggestions[activeIndex].name);
            } else {
                navigate();
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
            <div className="flex items-center bg-white/10 backdrop-blur border border-white/30 rounded-xl overflow-hidden focus-within:border-white/60 focus-within:bg-white/15 transition-all">
                <svg className="w-5 h-5 text-white/60 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim() && suggestions.length > 0 && setShowDropdown(true)}
                    placeholder={t.home.searchPlaceholder}
                    className="flex-1 bg-transparent text-white placeholder-white/50 px-3 py-3 outline-none text-sm"
                />
                <button
                    onClick={() => navigate()}
                    className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors flex-shrink-0"
                >
                    {t.home.searchButton}
                </button>
            </div>

            {/* 下拉建议 */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    {suggestions.map((model, idx) => (
                        <button
                            key={model.name}
                            onMouseDown={e => { e.preventDefault(); navigate(model.name); }}
                            onMouseEnter={() => setActiveIndex(idx)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${idx === activeIndex ? 'bg-primary-50' : 'hover:bg-slate-50'
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="text-slate-800 text-sm font-medium truncate">{model.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                {model.is_rl && (
                                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">RL</span>
                                )}
                                {model.is_opensource && (
                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Open</span>
                                )}
                                {model.pub_date && (
                                    <span className="text-slate-400 text-xs">{model.pub_date}</span>
                                )}
                            </div>
                        </button>
                    ))}
                    {/* 底部跳转到搜索页 */}
                    <button
                        onMouseDown={e => { e.preventDefault(); navigate(); }}
                        className="w-full px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 text-left border-t border-slate-100 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Search for &ldquo;{query}&rdquo;
                    </button>
                </div>
            )}
        </div>
    );
}
