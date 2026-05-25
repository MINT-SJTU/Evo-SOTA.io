'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import { LatexText } from '@/components/LatexText';

// ─── 类型定义 ───────────────────────────────────────────────
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

const BENCHMARK_DISPLAY_NAMES: Record<string, string> = {
    libero: 'LIBERO',
    libero_plus: 'LIBERO Plus',
    metaworld: 'Meta-World',
    calvin_abc_d: 'CALVIN ABC→D',
    calvin_abcd_d: 'CALVIN ABCD→D',
    calvin_d_d: 'CALVIN D→D',
    robochallenge: 'RoboChallenge',
    robocasa: 'RoboCasa-GR1-Tabletop',
    robotwin: 'RoboTwin 2.0',
};

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

function formatScore(key: string, score: number): string {
    if (['calvin_abc_d', 'calvin_abcd_d', 'calvin_d_d', 'robochallenge'].includes(key)) {
        return score.toFixed(2);
    }
    return score.toFixed(1);
}

function policySettingLabel(ps: number | null | undefined): string | null {
    if (ps === 1) return 'one policy for all 4 suites';
    if (ps === 2) return 'one policy per suite';
    return null;
}

// ─── 模型详情客户端组件 ──────────────────────────────────────
export function ModelDetailClient({ slug }: { slug: string }) {
    const { locale } = useLanguage();
    const [model, setModel] = useState<ModelEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [abstractExpanded, setAbstractExpanded] = useState(false);

    const modelName = decodeURIComponent(slug);

    useEffect(() => {
        fetch('/data/models_search.json')
            .then((r) => r.json())
            .then((data: ModelEntry[]) => {
                const found = data.find((m) => m.name === modelName);
                setModel(found || null);
            })
            .catch(() => setModel(null))
            .finally(() => setLoading(false));
    }, [modelName]);

    const zh = locale === 'zh';

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse text-slate-400 text-sm">Loading...</div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <div className="text-5xl">🤖</div>
                <p className="text-lg font-medium text-slate-700">
                    {zh ? `未找到模型 "${modelName}"` : `Model "${modelName}" not found`}
                </p>
                <Link
                    href="/models"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    {zh ? '返回模型搜索' : 'Back to Model Search'}
                </Link>
            </div>
        );
    }

    const hasBenchmarks = BENCHMARK_KEYS.some((k) => (model.benchmarks[k]?.length ?? 0) > 0);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                        <Link href="/models" className="text-slate-400 hover:text-white text-sm transition-colors">
                            ← {zh ? '返回模型搜索' : 'Back to Model Search'}
                        </Link>
                    </div>

                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">{model.name}</h1>
                            <div className="flex flex-wrap items-center gap-2">
                                {model.is_rl ? (
                                    <span className="px-2.5 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-full font-semibold border border-orange-500/30">
                                        RL
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full font-semibold border border-blue-500/30">
                                        SFT
                                    </span>
                                )}
                                {model.is_opensource && (
                                    <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-sm rounded-full font-semibold border border-emerald-500/30">
                                        {zh ? '开源' : 'Open Source'}
                                    </span>
                                )}
                                {model.pub_date && (
                                    <span className="text-slate-400 text-sm">📅 {model.pub_date}</span>
                                )}
                            </div>
                        </div>

                        {/* Links */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {model.paper_url && (
                                <a
                                    href={model.paper_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    📄 {zh ? '论文' : 'Paper'}
                                </a>
                            )}
                            {model.is_opensource && model.opensource_url && (
                                <a
                                    href={model.opensource_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                    </svg>
                                    {zh ? '代码' : 'Code'}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 主内容 */}
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

                {/* 论文信息（仅 Arxiv 时展示） */}
                {model.paper_title && (
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">📑</span>
                            {zh ? '论文信息' : 'Paper Info'}
                        </h2>

                        {/* 标题 */}
                        <h3 className="text-lg font-semibold text-slate-900 leading-snug mb-3">
                            <LatexText text={model.paper_title ?? ''} />
                        </h3>

                        {/* 作者 */}
                        {model.paper_authors && model.paper_authors.length > 0 && (
                            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                <span className="font-medium text-slate-700">{zh ? '作者：' : 'Authors: '}</span>
                                {model.paper_authors.join(', ')}
                            </p>
                        )}

                        {/* Abstract */}
                        {model.paper_abstract && (
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-1.5">
                                    {zh ? '摘要' : 'Abstract'}
                                </p>
                                <div className={`text-sm text-slate-600 leading-relaxed ${!abstractExpanded ? 'line-clamp-4' : ''}`}>
                                    <LatexText text={model.paper_abstract ?? ''} />
                                </div>
                                <button
                                    onClick={() => setAbstractExpanded(!abstractExpanded)}
                                    className="mt-2 text-xs text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                >
                                    {abstractExpanded
                                        ? (zh ? '收起' : 'Show less')
                                        : (zh ? '展开全文' : 'Show more')}
                                </button>
                            </div>
                        )}

                        {/* Arxiv 链接 */}
                        {model.paper_arxiv_id && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <a
                                    href={`https://arxiv.org/abs/${model.paper_arxiv_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    arxiv.org/abs/{model.paper_arxiv_id}
                                </a>
                            </div>
                        )}
                    </section>
                )}

                {/* Benchmark 成绩 */}
                <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-xl">🏆</span>
                        {zh ? 'Benchmark 成绩' : 'Benchmark Results'}
                    </h2>

                    {!hasBenchmarks ? (
                        <p className="text-sm text-slate-400 text-center py-8">
                            {zh ? '暂无 Benchmark 数据' : 'No benchmark data available'}
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {BENCHMARK_KEYS.filter((k) => (model.benchmarks[k]?.length ?? 0) > 0).map((key) => {
                                const entries = model.benchmarks[key];
                                const typeParam = model.is_rl ? 'rl' : 'sft';
                                const filterParam = model.is_opensource ? 'open' : 'all';
                                const href = `${BENCHMARK_HREFS[key]}?type=${typeParam}&filter=${filterParam}#model-row-${encodeURIComponent(model.name)}`;
                                const subLabels = DATA_LABELS[key] || {};

                                return (
                                    <div key={key} className="border border-slate-100 rounded-lg overflow-hidden">
                                        {/* Benchmark 标题行 */}
                                        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                                            <span className="text-xs font-semibold text-slate-700">
                                                {BENCHMARK_DISPLAY_NAMES[key] || key}
                                            </span>
                                            <Link
                                                href={href}
                                                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                {zh ? '查看榜单 →' : 'View Leaderboard →'}
                                            </Link>
                                        </div>

                                        {/* 各 setting 成绩 */}
                                        {entries.map((entry, idx) => (
                                            <div key={idx} className="px-3 py-2.5 border-b last:border-b-0 border-slate-50">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {entry.setting && entry.setting !== 'default' && (
                                                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                                                {entry.setting}
                                                            </span>
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
                                                    {key === 'libero' && (() => {
                                                        const ps = entry.data?.policy_setting as number | null | undefined;
                                                        const label = policySettingLabel(ps);
                                                        return label ? (
                                                            <span className="text-xs text-slate-400 italic">{label}</span>
                                                        ) : null;
                                                    })()}
                                                </div>

                                                {/* 子指标网格 */}
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

                                                {entry.note && (
                                                    <p className="text-xs text-slate-400 mt-1.5 italic">{entry.note}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
