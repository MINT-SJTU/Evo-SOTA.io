'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import ContactFooter from '@/components/ContactFooter';

interface CalvinModel {
    name: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    is_rl?: boolean;
    inst1: number | null;
    inst2: number | null;
    inst3: number | null;
    inst4: number | null;
    inst5: number | null;
    avg_len: number | null;
    source: string;
    is_standard: boolean;
    note: string;
    rank: number;
}

interface CalvinSettingData {
    standard_opensource: CalvinModel[];
    standard_closed: CalvinModel[];
    non_standard: CalvinModel[];
}

interface CalvinData {
    abc_d: CalvinSettingData;
    abcd_d: CalvinSettingData;
    d_d: CalvinSettingData;
}

type CalvinSetting = 'abc_d' | 'abcd_d' | 'd_d';

export default function CalvinPage() {
    const { locale } = useLanguage();
    const [data, setData] = useState<CalvinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSetting, setActiveSetting] = useState<CalvinSetting>('abc_d');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showAllMetrics, setShowAllMetrics] = useState(false);
    const [showClosedSource, setShowClosedSource] = useState(false);
    const [showAppendix, setShowAppendix] = useState(true);
    const [sortBy, setSortBy] = useState<'rank' | 'avg_len' | 'date'>('rank');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [modelTypeFilter, setModelTypeFilter] = useState<'all' | 'sft' | 'rl'>('sft');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const filter = params.get('filter');
        if (type === 'rl') setModelTypeFilter('rl');
        else if (type === 'sft') setModelTypeFilter('sft');
        if (filter === 'all') setShowClosedSource(true);
    }, []);

    const texts = {
        en: {
            title: 'CALVIN Benchmark Leaderboard',
            benchmarkIntro: 'CALVIN is a benchmark for learning long-horizon language-conditioned tasks in a tabletop manipulation environment.',
            benchmarkLink: 'View Benchmark Repository',
            models: 'models',
            showAllMetrics: 'Show All Metrics',
            hideMetrics: 'Compact View',
            rank: 'Rank',
            model: 'Model',
            date: 'Date',
            paper: 'Paper',
            github: 'Code',
            clickToExpand: 'Click row to expand details',
            clickModelName: 'Click model name to view detailed model information',
            metrics: 'Task completion rate (1-5 consecutive tasks)',
            setting: 'Setting',
            settingDesc: {
                abc_d: 'ABC→D: Train on environments A,B,C; Test on D (Main)',
                abcd_d: 'ABCD→D: Train on all environments; Test on D',
                d_d: 'D→D: Train and test on environment D',
            },
            showAllModels: 'Include All Models',
            openSourceOnly: 'Open-Source Only',
            appendix: 'Appendix: Non-Standard Evaluation',
            appendixDesc: 'Models below did not follow the standard evaluation protocol. Results may not be directly comparable.',
            showAppendix: 'Show Appendix',
            hideAppendix: 'Hide Appendix',
            standardModels: 'Standard Evaluation Models',
            opensource: 'Open Source',
            note: 'Note',
            modelTypeLabel: 'Model Type',
            modelTypeAll: 'All Models',
            modelTypeSft: 'SFT Only',
            modelTypeRl: 'RL Only',
        },
        zh: {
            title: 'CALVIN 基准测试榜单',
            benchmarkIntro: 'CALVIN 是一个在桌面操作环境中学习长视野语言条件任务的基准。',
            benchmarkLink: '查看 Benchmark 仓库',
            models: '个模型',
            showAllMetrics: '展开所有指标',
            hideMetrics: '紧凑视图',
            rank: '排名',
            model: '模型',
            date: '日期',
            paper: '论文',
            github: '代码',
            clickToExpand: '点击行展开详情',
            clickModelName: '点击模型名称查看详细模型信息',
            metrics: '任务完成率（1-5 连续任务）',
            setting: '设置',
            settingDesc: {
                abc_d: 'ABC→D: 在环境 A,B,C 训练；在 D 测试（主榜单）',
                abcd_d: 'ABCD→D: 在所有环境训练；在 D 测试',
                d_d: 'D→D: 在环境 D 训练和测试',
            },
            showAllModels: '显示全部模型',
            openSourceOnly: '仅开源模型',
            appendix: '附录：非标准测试',
            appendixDesc: '以下模型未遵循标准评估协议，结果可能无法直接比较。',
            showAppendix: '显示附录',
            hideAppendix: '隐藏附录',
            standardModels: '标准测试模型',
            opensource: '开源',
            note: '备注',
            modelTypeLabel: '模型类型',
            modelTypeAll: '全部模型',
            modelTypeSft: '仅 SFT',
            modelTypeRl: '仅 RL',
        }
    };

    const t = texts[locale];

    const settingLabels: Record<CalvinSetting, string> = {
        abc_d: 'ABC→D',
        abcd_d: 'ABCD→D',
        d_d: 'D→D',
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/data/calvin.json`);
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!loading && window.location.hash) {
            const id = decodeURIComponent(window.location.hash.slice(1));
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [loading]);

    const toggleRow = (key: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedRows(newExpanded);
    };

    const handleSort = (key: 'rank' | 'avg_len' | 'date') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder(key === 'rank' ? 'asc' : 'desc');
        }
    };

    const sortData = (models: CalvinModel[]) => {
        return [...models].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'rank') {
                comparison = a.rank - b.rank;
            } else if (sortBy === 'avg_len') {
                comparison = (b.avg_len || 0) - (a.avg_len || 0);
            } else if (sortBy === 'date') {
                comparison = (b.pub_date || '').localeCompare(a.pub_date || '');
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    // 模型类型过滤
    const applyModelTypeFilter = (models: CalvinModel[]) => {
        if (modelTypeFilter === 'all') return models;
        if (modelTypeFilter === 'sft') return models.filter(m => !m.is_rl);
        return models.filter(m => m.is_rl === true);
    };

    const getCurrentSettingData = (): CalvinSettingData | null => {
        if (!data) return null;
        return data[activeSetting];
    };

    // 合并标准测试数据
    const getDisplayData = () => {
        const settingData = getCurrentSettingData();
        if (!settingData) return [];
        let models = [...settingData.standard_opensource];
        if (showClosedSource) {
            models = [...models, ...settingData.standard_closed];
        }
        // 应用模型类型过滤
        models = applyModelTypeFilter(models);
        // 重新排名
        models.sort((a, b) => (b.avg_len || 0) - (a.avg_len || 0));
        return models.map((m, i) => ({ ...m, rank: i + 1 }));
    };

    const displayData = sortData(getDisplayData());
    const settingData = getCurrentSettingData();
    const appendixData = settingData ? sortData(applyModelTypeFilter(settingData.non_standard).map((m, i) => ({ ...m, rank: i + 1 }))) : [];

    const formatValue = (value: number | null, decimals: number = 2): string => {
        if (value === null) return '-';
        return value.toFixed(decimals);
    };

    const formatPercent = (value: number | null): string => {
        if (value === null) return '-';
        return (value * 100).toFixed(1) + '%';
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const renderTable = (models: CalvinModel[], isAppendix: boolean = false) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className={`${isAppendix ? 'bg-amber-50' : 'bg-slate-50'} border-b border-slate-200`}>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('rank')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.rank}
                                    {sortBy === 'rank' && (
                                        <span className="text-emerald-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                {t.model}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('avg_len')}
                            >
                                <div className="flex items-center gap-1">
                                    Avg. Len.
                                    {sortBy === 'avg_len' && (
                                        <span className="text-emerald-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            {showAllMetrics && (
                                <>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task 1</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task 2</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task 3</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task 4</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Task 5</th>
                                </>
                            )}
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.date}
                                    {sortBy === 'date' && (
                                        <span className="text-emerald-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.paper}</th>
                            <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.github}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model, idx) => {
                            const rowKey = `${isAppendix ? 'appendix' : 'main'}-${activeSetting}-${model.name}-${idx}`;
                            return (
                                <>
                                    <tr
                                        key={rowKey}
                                        id={`model-row-${encodeURIComponent(model.name)}`}
                                        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${expandedRows.has(rowKey) ? 'bg-emerald-50' : ''
                                            }`}
                                        onClick={() => toggleRow(rowKey)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankStyle(model.rank)}`}>
                                                {model.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/models/${encodeURIComponent(model.name)}`} className="font-medium text-slate-800 hover:text-primary-600 hover:underline" onClick={e => e.stopPropagation()}>{model.name}</Link>
                                                {model.is_opensource && (
                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                        {t.opensource}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{model.source}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-lg font-semibold text-emerald-600">
                                                {formatValue(model.avg_len)}
                                            </span>
                                        </td>
                                        {showAllMetrics && (
                                            <>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatPercent(model.inst1)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatPercent(model.inst2)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatPercent(model.inst3)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatPercent(model.inst4)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatPercent(model.inst5)}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-3 text-slate-600 text-sm">{model.pub_date || '-'}</td>
                                        <td className="px-2 py-3 text-right">
                                            {model.paper_url && (
                                                <a
                                                    href={model.paper_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-emerald-600 hover:text-emerald-800 hover:underline text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📄 Link
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-2 py-3 text-right">
                                            {model.opensource_url && (
                                                <a
                                                    href={model.opensource_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-slate-600 hover:text-slate-800 hover:underline text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📦 {t.github}
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded Details Row */}
                                    {expandedRows.has(rowKey) && (
                                        <tr key={`${rowKey}-expanded`} className="bg-emerald-50 border-b border-slate-200">
                                            <td colSpan={showAllMetrics ? 11 : 6} className="px-4 py-4">
                                                <div className="ml-12 space-y-4">
                                                    {/* Sub-metrics */}
                                                    {!showAllMetrics && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-700 mb-3">{t.metrics}</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                                {[1, 2, 3, 4, 5].map(i => (
                                                                    <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                                                                        <div className="text-xs text-slate-500 mb-1">Task {i}</div>
                                                                        <div className="font-mono text-lg font-semibold text-slate-800">
                                                                            {formatPercent(model[`inst${i}` as keyof CalvinModel] as number | null)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Links */}
                                                    <div className="flex items-center gap-4">
                                                        {model.opensource_url && (
                                                            <a
                                                                href={model.opensource_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                                                </svg>
                                                                {t.github}
                                                            </a>
                                                        )}
                                                        {model.paper_url && (
                                                            <a
                                                                href={model.paper_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                📄 {t.paper}
                                                            </a>
                                                        )}
                                                    </div>
                                                    {/* Note for non-standard */}
                                                    {isAppendix && model.note && (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                            <span className="text-sm font-medium text-amber-800">{t.note}: </span>
                                                            <span className="text-sm text-amber-700">{model.note}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3 mb-8"></div>
                        <div className="h-96 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-emerald-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span>CALVIN</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
                    <p className="text-emerald-100 max-w-3xl mb-4">{t.benchmarkIntro}</p>
                    <a
                        href="https://github.com/mees/calvin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        {t.benchmarkLink}
                    </a>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="px-3 py-1 bg-emerald-500 rounded-full text-sm">
                            {displayData.length} {t.models}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Setting Tabs */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">{t.setting}</h3>
                    <div className="flex flex-wrap gap-2">
                        {(['abc_d', 'abcd_d', 'd_d'] as CalvinSetting[]).map((setting) => (
                            <button
                                key={setting}
                                onClick={() => {
                                    setActiveSetting(setting);
                                    setExpandedRows(new Set());
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeSetting === setting
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                    }`}
                            >
                                {settingLabels[setting]}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                        {t.settingDesc[activeSetting]}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowAllMetrics(!showAllMetrics)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showAllMetrics
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                        >
                            {showAllMetrics ? t.hideMetrics : t.showAllMetrics}
                        </button>
                        <button
                            onClick={() => setShowClosedSource(!showClosedSource)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showClosedSource
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                        >
                            {showClosedSource ? t.showAllModels : t.openSourceOnly}
                        </button>
                    </div>
                    {/* Model Type Filter - 靠右 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{t.modelTypeLabel}:</span>
                        <div className="inline-flex rounded-lg overflow-hidden border border-emerald-200">
                            <button
                                onClick={() => setModelTypeFilter('sft')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${modelTypeFilter === 'sft'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                {t.modelTypeSft}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('rl')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-emerald-200 ${modelTypeFilter === 'rl'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                {t.modelTypeRl}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-emerald-200 ${modelTypeFilter === 'all'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                                    }`}
                            >
                                {t.modelTypeAll}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-0.5 mb-4 text-sm text-slate-500">
                    <span>💡 {t.clickToExpand}</span>
                    <span>🔗 {t.clickModelName}</span>
                </div>

                {/* Main Table */}
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t.standardModels}</h2>
                {renderTable(displayData)}

                {/* Metrics Legend */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Metrics Description</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div><span className="font-medium">Task 1-5:</span> Completion rate for 1-5 consecutive tasks</div>
                        <div><span className="font-medium">Avg. Len.:</span> Average number of tasks completed in sequence</div>
                        <div><span className="font-medium">Setting:</span> Training/Testing environment configuration</div>
                    </div>
                </div>

                {/* Appendix Section - 暂时注释掉，可能在未来更新中启用
                {appendixData.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-amber-800">{t.appendix}</h2>
                            <button
                                onClick={() => setShowAppendix(!showAppendix)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${showAppendix
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
                                    }`}
                            >
                                {showAppendix ? t.hideAppendix : t.showAppendix} ({appendixData.length})
                            </button>
                        </div>
                        {showAppendix && (
                            <>
                                <p className="text-sm text-amber-700 mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    ⚠️ {t.appendixDesc}
                                </p>
                                {renderTable(appendixData, true)}
                            </>
                        )}
                    </div>
                )}
                */}

                {/* Contact Footer */}
                <ContactFooter />
            </div>
        </div>
    );
}
