'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { LatexText } from '@/components/LatexText';

// ─── 类型定义 ────────────────────────────────────────────────
interface BenchmarkEntry {
    setting: string;
    score: number | null;
    is_standard: boolean;
    note: string;
    rank?: number;
    data: Record<string, number | null>;
}

interface ModelEntry {
    name: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    is_rl: boolean;
    settings: string[];
    benchmarks: Record<string, BenchmarkEntry[]>;
    paper_arxiv_id: string | null;
    paper_title: string | null;
    paper_authors: string[] | null;
    paper_abstract: string | null;
}

// ─── 常量 ────────────────────────────────────────────────────
const BENCHMARK_KEYS = [
    'libero',
    'libero_plus',
    'metaworld',
    'calvin_abc_d',
    'calvin_abcd_d',
    'calvin_d_d',
    'robochallenge',
    'robocasa',
    'robotwin',
] as const;

const BENCHMARK_HREFS: Record<string, string> = {
    libero: '/benchmarks/libero',
    libero_plus: '/benchmarks/liberoplus',
    metaworld: '/benchmarks/metaworld',
    calvin_abc_d: '/benchmarks/calvin',
    calvin_abcd_d: '/benchmarks/calvin',
    calvin_d_d: '/benchmarks/calvin',
    robochallenge: '/benchmarks/robochallenge',
    robocasa: '/benchmarks/robocasa_gr1_tabletop',
    robotwin: '/benchmarks/robotwin2',
};

// 用于子指标的人类可读标签
const DATA_LABELS: Record<string, Record<string, string>> = {
    libero: { spatial: 'Spatial', object: 'Object', goal: 'Goal', long: 'Long', libero_90: 'LIBERO-90', average: 'Average' },
    libero_plus: { camera: 'Camera', robot: 'Robot', language: 'Language', light: 'Light', background: 'Background', noise: 'Noise', layout: 'Layout', total: 'Total' },
    metaworld: { easy: 'Easy', medium: 'Medium', hard: 'Hard', very_hard: 'Very Hard', average: 'Average' },
    calvin_abc_d: { inst1: 'Inst1', inst2: 'Inst2', inst3: 'Inst3', inst4: 'Inst4', inst5: 'Inst5', avg_len: 'Avg. Len.' },
    calvin_abcd_d: { inst1: 'Inst1', inst2: 'Inst2', inst3: 'Inst3', inst4: 'Inst4', inst5: 'Inst5', avg_len: 'Avg. Len.' },
    calvin_d_d: { inst1: 'Inst1', inst2: 'Inst2', inst3: 'Inst3', inst4: 'Inst4', inst5: 'Inst5', avg_len: 'Avg. Len.' },
    robochallenge: { score: 'Score', success_rate: 'Success Rate' },
    robocasa: { avg_success_rate: 'Avg. Success Rate' },
    robotwin: { easy: 'Easy', hard: 'Hard' },
};

// 模糊匹配
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

function matchScore(query: string, target: string): number {
    const q = query.toLowerCase();
    const t = target.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 60;
    return 20;
}

// policy_setting 角落标签（仅 LIBERO 用）
function policySettingLabel(ps: number | null | undefined): string | null {
    if (ps === 1) return 'one policy for all 4 suites';
    if (ps === 2) return 'one policy per suite';
    return null;
}

// 格式化分数
function formatScore(key: string, score: number): string {
    if (['calvin_abc_d', 'calvin_abcd_d', 'calvin_d_d', 'robochallenge'].includes(key)) {
        return score.toFixed(2);
    }
    return score.toFixed(1);
}

// ─── ModelCard（提取到顶层，避免父组件重渲染时重新定义导致滚动跳顶）───
interface ModelCardProps {
    model: ModelEntry;
    isExpanded: boolean;
    onToggle: (name: string) => void;
    benchmarkName: (key: string) => string;
    locale: string;
    msOpenSource: string;
    msPaper: string;
    msCode: string;
    msNoBenchmarks: string;
    msBenchmarkResults: string;
}

function ModelCard({ model, isExpanded, onToggle, benchmarkName, locale, msOpenSource, msPaper, msCode, msNoBenchmarks, msBenchmarkResults }: ModelCardProps) {
    const hasBenchmarks = BENCHMARK_KEYS.some(k => (model.benchmarks[k]?.length ?? 0) > 0);
    const benchmarkCount = BENCHMARK_KEYS.filter(k => (model.benchmarks[k]?.length ?? 0) > 0).length;
    const [abstractExpanded, setAbstractExpanded] = useState(false);
    const zh = locale === 'zh';

    // 问题1 修复：使用普通 div + onClick，避免 button 的默认提交行为导致滚动重置
    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(model.name);
    };

    return (
        <div
            id={`model-${encodeURIComponent(model.name)}`}
            className={`bg-white rounded-xl border transition-all ${isExpanded ? 'border-primary-300 shadow-md' : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'}`}
        >
            {/* 卡片头部 —— 用 div 代替 button，彻底避免页面跳顶 */}
            <div
                className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
                onClick={handleToggle}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <Link
                            href={`/models/${encodeURIComponent(model.name)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-base font-bold text-slate-900 hover:text-primary-600 truncate transition-colors"
                        >
                            {model.name}
                        </Link>
                        {model.is_rl ? (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full font-semibold flex-shrink-0">RL</span>
                        ) : (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold flex-shrink-0">SFT</span>
                        )}
                        {model.is_opensource && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-semibold flex-shrink-0">{msOpenSource}</span>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {model.pub_date && <span>📅 {model.pub_date}</span>}
                        <span>🏆 {benchmarkCount} benchmark{benchmarkCount !== 1 ? 's' : ''}</span>
                        {model.settings.length > 0 && (
                            <span>⚙️ {model.settings.join(', ')}</span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {model.paper_url && (
                        <a
                            href={model.paper_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 text-xs rounded-lg font-medium transition-colors"
                        >
                            {msPaper}
                        </a>
                    )}
                    {model.is_opensource && model.opensource_url && (
                        <a
                            href={model.opensource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-600 text-xs rounded-lg font-medium transition-colors"
                        >
                            {msCode}
                        </a>
                    )}
                    <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {/* 快速成绩预览（未展开时） */}
            {!isExpanded && hasBenchmarks && (
                <div className="px-5 pb-4 flex flex-wrap gap-2">
                    {BENCHMARK_KEYS.filter(k => (model.benchmarks[k]?.length ?? 0) > 0).map(key => {
                        const entries = model.benchmarks[key];
                        const best = entries.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a), entries[0]);
                        return (
                            <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs text-slate-500">{benchmarkName(key)}</span>
                                <span className="text-xs font-bold text-slate-800">
                                    {best.score != null ? formatScore(key, best.score) : '—'}
                                </span>
                                {best.rank != null && (
                                    <span className="text-xs text-slate-400">#{best.rank}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 展开详情 */}
            {isExpanded && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">

                    {/* 论文信息（仅有 paper_title 时显示） */}
                    {model.paper_title && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                            <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                <span>📑</span>
                                {zh ? '论文信息' : 'Paper Info'}
                            </h4>
                            <p className="text-sm font-semibold text-slate-800 leading-snug mb-1.5">
                                <LatexText text={model.paper_title} />
                            </p>
                            {model.paper_authors && model.paper_authors.length > 0 && (
                                <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                    <span className="font-medium">{zh ? '作者：' : 'Authors: '}</span>
                                    {model.paper_authors.join(', ')}
                                </p>
                            )}
                            {model.paper_abstract && (
                                <div>
                                    <div className={`text-xs text-slate-600 leading-relaxed ${!abstractExpanded ? 'line-clamp-3' : ''}`}>
                                        <LatexText text={model.paper_abstract} />
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setAbstractExpanded(!abstractExpanded); }}
                                        className="mt-1 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                    >
                                        {abstractExpanded ? (zh ? '收起' : 'Show less') : (zh ? '展开摘要' : 'Show abstract')}
                                    </button>
                                </div>
                            )}
                            {model.paper_arxiv_id && (
                                <a
                                    href={`https://arxiv.org/abs/${model.paper_arxiv_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    arxiv.org/abs/{model.paper_arxiv_id}
                                </a>
                            )}
                        </div>
                    )}

                    {!hasBenchmarks ? (
                        <p className="text-sm text-slate-400 text-center py-4">{msNoBenchmarks}</p>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-700">{msBenchmarkResults}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {BENCHMARK_KEYS.filter(k => (model.benchmarks[k]?.length ?? 0) > 0).map(key => {
                                    const entries = model.benchmarks[key];
                                    // 根据 is_rl 和 is_opensource 决定跳转时的 filter 参数
                                    const typeParam = model.is_rl ? 'rl' : 'sft';
                                    const filterParam = model.is_opensource ? 'open' : 'all';
                                    const href = `${BENCHMARK_HREFS[key]}?type=${typeParam}&filter=${filterParam}#model-row-${encodeURIComponent(model.name)}`;
                                    const subLabels = DATA_LABELS[key] || {};
                                    return (
                                        <div key={key} className="border border-slate-100 rounded-lg overflow-hidden">
                                            {/* benchmark 标题行 */}
                                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                                                <span className="text-xs font-semibold text-slate-700">{benchmarkName(key)}</span>
                                                <a
                                                    href={href}
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                                >
                                                    {locale === 'zh' ? '查看榜单 →' : 'View Leaderboard →'}
                                                </a>
                                            </div>
                                            {/* 各 setting 成绩 */}
                                            {entries.map((entry, idx) => (
                                                <div key={idx} className="px-3 py-2.5 border-b last:border-b-0 border-slate-50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            {entry.setting && entry.setting !== 'default' && (
                                                                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{entry.setting}</span>
                                                            )}
                                                            {entry.rank != null && (
                                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                                    entry.rank === 2 ? 'bg-slate-100 text-slate-600' :
                                                                        entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-slate-50 text-slate-500'
                                                                    }`}>
                                                                    #{entry.rank}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {/* policy_setting 角落小字，仅 libero 显示 */}
                                                        {key === 'libero' && (() => {
                                                            const ps = entry.data?.policy_setting as number | null | undefined;
                                                            const label = policySettingLabel(ps);
                                                            return label ? (
                                                                <span className="text-xs text-slate-400 italic">{label}</span>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                    {/* 子指标网格：过滤掉 policy_setting */}
                                                    <div className="grid grid-cols-3 gap-1">
                                                        {Object.entries(entry.data)
                                                            .filter(([dk, v]) => v != null && typeof v === 'number' && dk !== 'policy_setting')
                                                            .map(([dk, dv]) => (
                                                                <div key={dk} className="text-center">
                                                                    <div className="text-xs text-slate-400">{subLabels[dk] || dk}</div>
                                                                    <div className={`text-sm font-semibold ${dk === 'average' || dk === 'total' || dk === 'avg_len' || dk === 'avg_success_rate' || dk === 'score'
                                                                        ? 'text-primary-600'
                                                                        : 'text-slate-700'
                                                                        }`}>
                                                                        {typeof dv === 'number' ? formatScore(key, dv as number) : '—'}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── 搜索页内容（使用 useSearchParams 需要放在 Suspense 内）───
function ModelsPageContent() {
    const { t, locale } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const ms = t.modelSearch;

    const [allModels, setAllModels] = useState<ModelEntry[]>([]);
    const [query, setQuery] = useState('');
    const [displayQuery, setDisplayQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'sft' | 'rl'>('all');
    const [openFilter, setOpenFilter] = useState(false);  // 问题2：默认显示开源
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
    const [suggestions, setSuggestions] = useState<ModelEntry[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set()); // 问题6：改为 Set 支持多选
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 加载数据
    useEffect(() => {
        fetch('/data/models_search.json')
            .then(r => r.json())
            .then((data: ModelEntry[]) => setAllModels(data))
            .catch(() => { });
    }, []);

    // 从 URL 参数初始化搜索词
    useEffect(() => {
        const q = searchParams.get('q') || '';
        setDisplayQuery(q);
        setQuery(q);
        if (q) setExpandedModels(new Set());
    }, [searchParams]);

    // 实时建议（输入框）
    useEffect(() => {
        const q = displayQuery.trim();
        if (!q || q.length < 1) { setSuggestions([]); setShowDropdown(false); return; }
        const matched = allModels
            .filter(m => fuzzyMatch(q, m.name))
            .sort((a, b) => matchScore(q, b.name) - matchScore(q, a.name))
            .slice(0, 8);
        setSuggestions(matched);
        setShowDropdown(matched.length > 0);
        setActiveIndex(-1);
    }, [displayQuery, allModels]);

    // 点击外部关闭建议
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const doSearch = useCallback((name?: string) => {
        const q = name || displayQuery.trim();
        setShowDropdown(false);
        if (!q) {
            setQuery('');
            router.push('/models');
            return;
        }
        setQuery(q);
        setDisplayQuery(q);
        router.push(`/models?q=${encodeURIComponent(q)}`);
        // 如果精确匹配，自动展开
        const exact = allModels.find(m => m.name.toLowerCase() === q.toLowerCase());
        if (exact) setExpandedModels(new Set([exact.name]));
    }, [displayQuery, allModels, router]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown) {
            if (e.key === 'Enter') doSearch();
            return;
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, -1)); }
        else if (e.key === 'Enter') { e.preventDefault(); activeIndex >= 0 ? doSearch(suggestions[activeIndex].name) : doSearch(); }
        else if (e.key === 'Escape') setShowDropdown(false);
    };

    // ─── 过滤+排序结果 ──────────────────────────────────────
    const filteredModels = allModels
        .filter(m => {
            const qMatch = !query.trim() || fuzzyMatch(query.trim(), m.name);
            const typeMatch =
                typeFilter === 'all' ? true :
                    typeFilter === 'rl' ? m.is_rl :
                        !m.is_rl;
            const openMatch = !openFilter || m.is_opensource;
            return qMatch && typeMatch && openMatch;
        })
        .sort((a, b) => {
            if (query.trim()) {
                const diff = matchScore(query.trim(), b.name) - matchScore(query.trim(), a.name);
                if (diff !== 0) return diff;
            }
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return (b.pub_date || '').localeCompare(a.pub_date || '');
        });

    const benchmarkName = (key: string) => (ms as Record<string, string>)[key] || key;

    // ─── 渲染单个模型卡片 ────────────────────────────────────
    const handleToggle = (name: string) => {
        setExpandedModels(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* 顶部 Hero */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-2">
                        <Link href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
                            ← {locale === 'zh' ? '返回首页' : 'Back to Home'}
                        </Link>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{ms.title}</h1>
                    <p className="text-slate-400 mb-6">{ms.subtitle}</p>

                    {/* 搜索框 */}
                    <div ref={containerRef} className="relative">
                        <div className="flex items-center bg-white/10 backdrop-blur border border-white/30 rounded-xl overflow-hidden focus-within:border-white/60 focus-within:bg-white/15 transition-all">
                            <svg className="w-5 h-5 text-white/60 ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={inputRef}
                                type="text"
                                value={displayQuery}
                                onChange={e => setDisplayQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => displayQuery.trim() && suggestions.length > 0 && setShowDropdown(true)}
                                placeholder={ms.searchPlaceholder}
                                className="flex-1 bg-transparent text-white placeholder-white/50 px-3 py-3.5 outline-none text-sm"
                                autoFocus
                            />
                            {displayQuery && (
                                <button
                                    onClick={() => { setDisplayQuery(''); setQuery(''); setShowDropdown(false); router.push('/models'); }}
                                    className="px-3 text-white/60 hover:text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => doSearch()}
                                className="px-5 py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium transition-colors flex-shrink-0"
                            >
                                {locale === 'zh' ? '搜索' : 'Search'}
                            </button>
                        </div>
                        <p className="text-xs text-white/40 mt-2 ml-1">{ms.searchHint}</p>

                        {/* 实时建议下拉 */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                                {suggestions.map((model, idx) => (
                                    <button
                                        key={model.name}
                                        onMouseDown={e => { e.preventDefault(); doSearch(model.name); }}
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
                                            {model.is_rl && <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-medium">RL</span>}
                                            {model.is_opensource && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Open</span>}
                                            {model.pub_date && <span className="text-slate-400 text-xs">{model.pub_date}</span>}
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onMouseDown={e => { e.preventDefault(); doSearch(); }}
                                    className="w-full px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 text-left border-t border-slate-100 flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                    {locale === 'zh' ? `搜索 "${displayQuery}"` : `Search for "${displayQuery}"`}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 主内容区 */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* 筛选工具栏 */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* 类型筛选 */}
                        <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white">
                            {(['all', 'sft', 'rl'] as const).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setTypeFilter(f)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${typeFilter === f
                                        ? 'bg-primary-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {f === 'all' ? ms.filterAll : f === 'sft' ? ms.filterSft : ms.filterRl}
                                </button>
                            ))}
                        </div>
                        {/* 开源筛选 */}
                        <button
                            onClick={() => setOpenFilter(!openFilter)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${openFilter
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {ms.filterOpen}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 排序 */}
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as 'date' | 'name')}
                            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-600 outline-none cursor-pointer"
                        >
                            <option value="date">{ms.sortByDate}</option>
                            <option value="name">{ms.sortByName}</option>
                        </select>
                        {/* 结果计数 */}
                        <span className="text-sm text-slate-500">
                            <span className="font-semibold text-slate-800">{filteredModels.length}</span>
                            {' '}{ms.resultsCount}
                        </span>
                    </div>
                </div>

                {/* 无结果提示 */}
                {filteredModels.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-5xl mb-4">🔍</div>
                        <p className="text-lg font-medium text-slate-700 mb-1">
                            {ms.noResults} &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-sm text-slate-500">{ms.noResultsHint}</p>
                    </div>
                )}

                {/* 模型卡片列表 */}
                <div className="space-y-3">
                    {filteredModels.map(model => (
                        <ModelCard
                            key={model.name}
                            model={model}
                            isExpanded={expandedModels.has(model.name)}
                            onToggle={handleToggle}
                            benchmarkName={benchmarkName}
                            locale={locale}
                            msOpenSource={ms.openSource}
                            msPaper={ms.paper}
                            msCode={ms.code}
                            msNoBenchmarks={ms.noBenchmarks}
                            msBenchmarkResults={ms.benchmarkResults}
                        />
                    ))}
                </div>

                {/* 底部统计 */}
                {allModels.length > 0 && (
                    <p className="text-center text-xs text-slate-400 mt-8">
                        {allModels.length} {ms.modelsTotal}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── 页面导出（包裹 Suspense）────────────────────────────────
export default function ModelsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
            </div>
        }>
            <ModelsPageContent />
        </Suspense>
    );
}
