'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import ContactFooter from '@/components/ContactFooter';

interface LiberoPlusModel {
    name: string;
    base_name?: string;
    setting?: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    is_rl: boolean;
    camera: number | null;
    robot: number | null;
    language: number | null;
    light: number | null;
    background: number | null;
    noise: number | null;
    layout: number | null;
    total: number | null;
    source: string;
    is_standard: boolean;
    note: string;
    rank: number;
}

interface LiberoPlusData {
    standard_opensource: LiberoPlusModel[];
    standard_closed: LiberoPlusModel[];
    non_standard: LiberoPlusModel[];
}

export default function LiberoPlusPage() {
    const { locale } = useLanguage();
    const [data, setData] = useState<LiberoPlusData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showAllMetrics, setShowAllMetrics] = useState(false);
    const [showClosedSource, setShowClosedSource] = useState(false);
    const [showAppendix, setShowAppendix] = useState(true);
    const [sortBy, setSortBy] = useState<'rank' | 'total' | 'date'>('rank');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [modelTypeFilter, setModelTypeFilter] = useState<'all' | 'sft' | 'rl'>('sft');

    const texts = {
        en: {
            title: 'LIBERO Plus Benchmark Leaderboard',
            benchmarkIntro: 'LIBERO Plus is an extended benchmark testing robustness across 7 perturbation dimensions: Camera, Robot, Language, Light, Background, Noise, and Layout.',
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
            metrics: 'Robustness Metrics',
            showAllModels: 'Include All Models',
            openSourceOnly: 'Open-Source Only',
            appendix: 'Appendix: Non-Standard Evaluation',
            appendixDesc: 'Models below did not follow the standard evaluation protocol. Results may not be directly comparable.',
            showAppendix: 'Show Appendix',
            hideAppendix: 'Hide Appendix',
            standardModels: 'Standard Evaluation Models',
            opensource: 'Open Source',
            note: 'Note',
            total: 'Total',
            modelTypeLabel: 'Model Type',
            modelTypeAll: 'All Models',
            modelTypeSft: 'SFT Only',
            modelTypeRl: 'RL Only',
        },
        zh: {
            title: 'LIBERO Plus 基准测试榜单',
            benchmarkIntro: 'LIBERO Plus 是一个扩展基准测试，测试模型在 7 个扰动维度上的鲁棒性：相机、机器人、语言、光照、背景、噪声和布局。',
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
            metrics: '鲁棒性指标',
            showAllModels: '显示全部模型',
            openSourceOnly: '仅开源模型',
            appendix: '附录：非标准测试',
            appendixDesc: '以下模型未遵循标准评估协议，结果可能无法直接比较。',
            showAppendix: '显示附录',
            hideAppendix: '隐藏附录',
            standardModels: '标准测试模型',
            opensource: '开源',
            note: '备注',
            total: '总分',
            modelTypeLabel: '模型类型',
            modelTypeAll: '全部模型',
            modelTypeSft: '仅 SFT',
            modelTypeRl: '仅 RL',
        }
    };

    const t = texts[locale];

    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch(`/data/liberoPlus.json`);
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

    const toggleRow = (key: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(key)) {
            newExpanded.delete(key);
        } else {
            newExpanded.add(key);
        }
        setExpandedRows(newExpanded);
    };

    const handleSort = (key: 'rank' | 'total' | 'date') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder(key === 'rank' ? 'asc' : 'desc');
        }
    };

    const sortData = (models: LiberoPlusModel[]) => {
        return [...models].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'rank') {
                comparison = a.rank - b.rank;
            } else if (sortBy === 'total') {
                comparison = (b.total || 0) - (a.total || 0);
            } else if (sortBy === 'date') {
                comparison = (b.pub_date || '').localeCompare(a.pub_date || '');
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    const applyModelTypeFilter = (models: LiberoPlusModel[]) => {
        if (modelTypeFilter === 'all') return models;
        if (modelTypeFilter === 'sft') return models.filter((model) => !model.is_rl);
        if (modelTypeFilter === 'rl') return models.filter((model) => model.is_rl);
        return models;
    };

    const getDisplayData = () => {
        if (!data) return [];
        let models: LiberoPlusModel[] = [...data.standard_opensource];
        if (showClosedSource) {
            models = [...models, ...data.standard_closed];
        }
        models = applyModelTypeFilter(models);
        models.sort((a, b) => (b.total || 0) - (a.total || 0));
        return models.map((m, i) => ({ ...m, rank: i + 1 }));
    };

    const displayData = sortData(getDisplayData());
    const appendixData = data ? sortData(applyModelTypeFilter(data.non_standard)) : [];

    const formatValue = (value: number | null | undefined): string => {
        if (value === null || value === undefined) return '-';
        return value.toFixed(1);
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    const renderTable = (models: LiberoPlusModel[], isAppendix: boolean = false) => (
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
                                        <span className="text-orange-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                {t.model}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('total')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.total}
                                    {sortBy === 'total' && (
                                        <span className="text-orange-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            {showAllMetrics && (
                                <>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Camera</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Robot</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Language</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Light</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Background</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Noise</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Layout</th>
                                </>
                            )}
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('date')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.date}
                                    {sortBy === 'date' && (
                                        <span className="text-orange-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{t.paper}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model, idx) => {
                            const rowKey = `${isAppendix ? 'appendix' : 'main'}-${model.name}-${idx}`;
                            return (
                                <React.Fragment key={rowKey}>
                                    <tr
                                        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${expandedRows.has(rowKey) ? 'bg-orange-50' : ''
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
                                                <span className="font-medium text-slate-800">{model.name}</span>
                                                {model.is_opensource && (
                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                                        {t.opensource}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-slate-500">{model.source}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-lg font-semibold text-orange-600">
                                                {formatValue(model.total)}
                                            </span>
                                        </td>
                                        {showAllMetrics && (
                                            <>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.camera)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.robot)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.language)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.light)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.background)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.noise)}</td>
                                                <td className="px-4 py-3 font-mono text-slate-600">{formatValue(model.layout)}</td>
                                            </>
                                        )}
                                        <td className="px-4 py-3 text-slate-600 text-sm">{model.pub_date || '-'}</td>
                                        <td className="px-4 py-3">
                                            {model.paper_url && (
                                                <a
                                                    href={model.paper_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-orange-600 hover:text-orange-800 hover:underline text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📄 Link
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                    {/* Expanded Details Row */}
                                    {expandedRows.has(rowKey) && (
                                        <tr key={`${rowKey}-expanded`} className="bg-orange-50 border-b border-slate-200">
                                            <td colSpan={showAllMetrics ? 12 : 5} className="px-4 py-4">
                                                <div className="ml-12 space-y-4">
                                                    {/* Sub-metrics */}
                                                    {!showAllMetrics && (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-slate-700 mb-3">{t.metrics}</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Camera</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.camera)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Robot</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.robot)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Language</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.language)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Light</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.light)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Background</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.background)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Noise</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.noise)}
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                    <div className="text-xs text-slate-500 mb-1">Layout</div>
                                                                    <div className="font-mono text-lg font-semibold text-slate-800">
                                                                        {formatValue(model.layout)}
                                                                    </div>
                                                                </div>
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
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
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
                                </React.Fragment>
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
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        <div className="h-64 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-orange-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span>LIBERO Plus</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
                    <p className="text-orange-100 max-w-3xl mb-4">{t.benchmarkIntro}</p>
                    <a
                        href="https://github.com/sylvestf/LIBERO-plus"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 rounded-lg text-sm transition-colors"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                        </svg>
                        {t.benchmarkLink}
                    </a>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="px-3 py-1 bg-orange-500 rounded-full text-sm">
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
                            onClick={() => setShowAllMetrics(!showAllMetrics)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showAllMetrics
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
                                }`}
                        >
                            {showAllMetrics ? t.hideMetrics : t.showAllMetrics}
                        </button>
                        <button
                            onClick={() => setShowClosedSource(!showClosedSource)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showClosedSource
                                ? 'bg-orange-600 text-white'
                                : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
                                }`}
                        >
                            {showClosedSource ? t.showAllModels : t.openSourceOnly}
                        </button>
                    </div>

                    {/* Model Type Filter - 靠右 */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{t.modelTypeLabel}:</span>
                        <div className="inline-flex rounded-lg overflow-hidden border border-orange-200">
                            <button
                                onClick={() => setModelTypeFilter('sft')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all ${modelTypeFilter === 'sft'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-orange-600 hover:bg-orange-50'
                                    }`}
                            >
                                {t.modelTypeSft}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('rl')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-orange-200 ${modelTypeFilter === 'rl'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-orange-600 hover:bg-orange-50'
                                    }`}
                            >
                                {t.modelTypeRl}
                            </button>
                            <button
                                onClick={() => setModelTypeFilter('all')}
                                className={`px-3 py-1.5 text-sm font-medium transition-all border-l border-orange-200 ${modelTypeFilter === 'all'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-orange-600 hover:bg-orange-50'
                                    }`}
                            >
                                {t.modelTypeAll}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hint */}
                <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.clickToExpand}
                </div>

                {/* Standard Models Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">{t.standardModels}</h2>
                    {renderTable(displayData)}
                </div>

                {/* Non-Standard Models Appendix */}
                {appendixData.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-amber-800">{t.appendix}</h2>
                            <button
                                onClick={() => setShowAppendix(!showAppendix)}
                                className="text-sm text-amber-600 hover:text-amber-800"
                            >
                                {showAppendix ? t.hideAppendix : t.showAppendix}
                            </button>
                        </div>
                        {showAppendix && (
                            <>
                                <p className="text-sm text-amber-700 mb-4">{t.appendixDesc}</p>
                                {renderTable(appendixData, true)}
                            </>
                        )}
                    </div>
                )}

                {/* Contact Footer */}
                <div className="mt-12">
                    <ContactFooter />
                </div>
            </div>
        </div>
    );
}
