'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import ContactFooter from '@/components/ContactFooter';

interface RobotwinModel {
    name: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    is_rl?: boolean;
    easy: number | null;
    hard: number | null;
    note: string;
    rank: number;
    source: string;
    is_standard: boolean;
}

interface RobotwinData {
    standard_opensource: RobotwinModel[];
    standard_closed: RobotwinModel[];
    non_standard: RobotwinModel[];
}

export default function RobotwinPage() {
    const { locale } = useLanguage();
    const [data, setData] = useState<RobotwinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showClosedSource, setShowClosedSource] = useState(false);
    const [evalSetting, setEvalSetting] = useState<'easy' | 'hard'>('hard');
    const [sortBy, setSortBy] = useState<'rank' | 'easy' | 'hard' | 'date'>('rank');
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
            title: 'RoboTwin 2.0 Leaderboard',
            benchmarkIntro: 'RoboTwin 2.0 is a Scalable Data Generator and Benchmark with Strong Domain Randomization for Robust Bimanual Robotic Manipulation.',
            benchmarkLink: 'View RoboTwin GitHub',
            models: 'models',
            rank: 'Rank',
            model: 'Model',
            easy: 'Easy',
            hard: 'Hard',
            date: 'Date',
            paper: 'Paper',
            github: 'Code',
            clickToExpand: 'Click row to expand details',
            showAllModels: 'Include All Models',
            openSourceOnly: 'Open-Source Only',
            standardModels: 'Standard Evaluation Models',
            opensource: 'Open Source',
            note: 'Note',
            modelTypeLabel: 'Model Type',
            modelTypeAll: 'All Models',
            modelTypeSft: 'SFT Only',
            modelTypeRl: 'RL Only',
            evalSettings: 'Evaluation Setting',
            evalNoteEasy: 'Easy: clean environment without distractors.',
            evalNoteHard: 'Hard: domain-randomized with clutter, lighting variations, texture changes, and height perturbations.',
        },
        zh: {
            title: 'RoboTwin 2.0 基准测试榜单',
            benchmarkIntro: 'RoboTwin 2.0 是一个可扩展的数据生成器和基准测试，具有强大的域随机化，用于鲁棒的双臂机器人操作。',
            benchmarkLink: '查看 RoboTwin GitHub',
            models: '个模型',
            rank: '排名',
            model: '模型',
            easy: 'Easy',
            hard: 'Hard',
            date: '日期',
            paper: '论文',
            github: '代码',
            clickToExpand: '点击行展开详情',
            showAllModels: '显示全部模型',
            openSourceOnly: '仅开源模型',
            standardModels: '标准测试模型',
            opensource: '开源',
            note: '备注',
            modelTypeLabel: '模型类型',
            modelTypeAll: '全部模型',
            modelTypeSft: '仅 SFT',
            modelTypeRl: '仅 RL',
            evalSettings: '评测设置',
            evalNoteEasy: 'Easy：干净环境，无干扰物。',
            evalNoteHard: 'Hard：域随机化环境，含杂乱物品、光照变化、纹理变化和高度扰动。',
        }
    };

    const t = texts[locale];

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch('/data/robotwin2.json');
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

    const handleSort = (key: 'rank' | 'easy' | 'hard' | 'date') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder(key === 'rank' ? 'asc' : 'desc');
        }
    };

    const sortData = (models: RobotwinModel[]) => {
        return [...models].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'rank') {
                comparison = a.rank - b.rank;
            } else if (sortBy === 'easy') {
                comparison = (b.easy || 0) - (a.easy || 0);
            } else if (sortBy === 'hard') {
                comparison = (b.hard || 0) - (a.hard || 0);
            } else if (sortBy === 'date') {
                comparison = (b.pub_date || '').localeCompare(a.pub_date || '');
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    const applyModelTypeFilter = (models: RobotwinModel[]) => {
        if (modelTypeFilter === 'all') return models;
        if (modelTypeFilter === 'sft') return models.filter(m => !m.is_rl);
        return models.filter(m => m.is_rl === true);
    };

    const getDisplayData = () => {
        if (!data) return [];
        let models: RobotwinModel[] = [...data.standard_opensource];
        if (showClosedSource) {
            models = [...models, ...data.standard_closed];
        }
        models = applyModelTypeFilter(models);
        const primaryKey = evalSetting === 'easy' ? 'easy' : 'hard';
        models.sort((a, b) => (b[primaryKey] || 0) - (a[primaryKey] || 0));
        return models.map((m, i) => ({ ...m, rank: i + 1 }));
    };

    const displayData = sortData(getDisplayData());

    const formatValue = (value: number | null): string => {
        if (value === null) return '-';
        return `${value.toFixed(1)}%`;
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const renderTable = (models: RobotwinModel[]) => (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('rank')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.rank}
                                    {sortBy === 'rank' && (
                                        <span className="text-amber-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                {t.model}
                            </th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-slate-100 ${evalSetting === 'easy' ? 'text-amber-600' : 'text-slate-700'}`}
                                onClick={() => handleSort('easy')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.easy}
                                    {sortBy === 'easy' && (
                                        <span className="text-amber-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className={`px-4 py-3 text-left text-sm font-semibold cursor-pointer hover:bg-slate-100 ${evalSetting === 'hard' ? 'text-amber-600' : 'text-slate-700'}`}
                                onClick={() => handleSort('hard')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.hard}
                                    {sortBy === 'hard' && (
                                        <span className="text-amber-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.date}
                                    {sortBy === 'date' && (
                                        <span className="text-amber-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.paper}</th>
                            <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.github}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model, idx) => {
                            const rowKey = `main-${model.name}-${idx}`;
                            return (
                                <>
                                    <tr
                                        key={rowKey}
                                        id={`model-row-${encodeURIComponent(model.name)}`}
                                        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${expandedRows.has(rowKey) ? 'bg-amber-50' : ''}`}
                                        onClick={() => toggleRow(rowKey)}
                                    >
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${getRankStyle(model.rank)}`}>
                                                {model.rank}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-800">{model.name}</span>
                                                {model.is_opensource && (
                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                        {t.opensource}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{model.source || ''}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-lg font-semibold ${evalSetting === 'easy' ? 'text-amber-600' : 'text-slate-500'}`}>
                                                {formatValue(model.easy)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-lg font-semibold ${evalSetting === 'hard' ? 'text-amber-600' : 'text-slate-500'}`}>
                                                {formatValue(model.hard)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-sm">{model.pub_date || '-'}</td>
                                        <td className="px-2 py-3 text-right">
                                            {model.paper_url && (
                                                <a
                                                    href={model.paper_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-amber-600 hover:text-amber-800 hover:underline text-sm"
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
                                    {expandedRows.has(rowKey) && (
                                        <tr key={`${rowKey}-expanded`} className="bg-amber-50 border-b border-slate-200">
                                            <td colSpan={7} className="px-4 py-4">
                                                <div className="ml-12 space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="bg-amber-100 rounded-lg p-3 shadow-sm">
                                                            <div className="text-xs text-amber-600 mb-1">Easy</div>
                                                            <div className="font-mono text-xl font-semibold text-amber-700">
                                                                {formatValue(model.easy)}
                                                            </div>
                                                        </div>
                                                        <div className="bg-amber-200 rounded-lg p-3 shadow-sm">
                                                            <div className="text-xs text-amber-700 mb-1">Hard</div>
                                                            <div className="font-mono text-xl font-semibold text-amber-800">
                                                                {formatValue(model.hard)}
                                                            </div>
                                                        </div>
                                                    </div>
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
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                📄 {t.paper}
                                                            </a>
                                                        )}
                                                    </div>
                                                    {model.note && (
                                                        <div className="bg-white border border-amber-200 rounded-lg p-3">
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
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-amber-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span>RoboTwin 2.0</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
                    <p className="text-amber-100 max-w-3xl mb-4">{t.benchmarkIntro}</p>
                    <a
                        href="https://github.com/robotwin-Platform/RoboTwin"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 rounded-lg text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        {t.benchmarkLink}
                    </a>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="px-3 py-1 bg-amber-400 rounded-full text-sm">
                            {displayData.length} {t.models}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowClosedSource(!showClosedSource)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showClosedSource
                                ? 'bg-amber-600 text-white'
                                : 'bg-white text-amber-600 border border-amber-200 hover:bg-amber-50'
                                }`}
                        >
                            {showClosedSource ? t.showAllModels : t.openSourceOnly}
                        </button>
                    </div>
                    {/* Model Type Filter */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{t.modelTypeLabel}:</span>
                        <div className="inline-flex rounded-lg overflow-hidden border border-amber-200">
                            <button
                                onClick={() => setModelTypeFilter('sft')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${modelTypeFilter === 'sft'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                                    }`}
                            >
                                {t.modelTypeSft}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('rl')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-amber-200 ${modelTypeFilter === 'rl'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                                    }`}
                            >
                                {t.modelTypeRl}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-amber-200 ${modelTypeFilter === 'all'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                                    }`}
                            >
                                {t.modelTypeAll}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-4">{t.clickToExpand}</p>

                {/* Standard Models heading + Easy/Hard toggle on same line */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <h2 className="text-xl font-bold text-slate-800">{t.standardModels}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{t.evalSettings}:</span>
                        <div className="inline-flex rounded-lg overflow-hidden border border-amber-200">
                            <button
                                onClick={() => setEvalSetting('easy')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${evalSetting === 'easy'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                                    }`}
                            >
                                Easy
                            </button>
                            <button
                                onClick={() => setEvalSetting('hard')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-amber-200 ${evalSetting === 'hard'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white text-amber-600 hover:bg-amber-50'
                                    }`}
                            >
                                Hard
                            </button>
                        </div>
                    </div>
                </div>

                {displayData.length > 0 ? (
                    renderTable(displayData)
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                        {locale === 'en' ? 'No models found with current filters.' : '当前筛选条件下没有模型。'}
                    </div>
                )}

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="text-sm font-semibold text-amber-800 mb-2">{t.evalSettings}</h3>
                    <p className="text-sm text-amber-700">{t.evalNoteEasy}</p>
                    <p className="text-sm text-amber-700">{t.evalNoteHard}</p>
                </div>

                <ContactFooter />
            </div>
        </div>
    );
}
