'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';
import ContactFooter from '@/components/ContactFooter';

// 1. 定义符合你要求的新数据结构
interface RoboCasaModel {
    name: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    avg_success_rate: number | null;
    note: string;
    rank: number;
    source: string;
    is_standard: boolean;
}

interface RoboCasaData {
    standard_opensource: RoboCasaModel[];
    standard_closed: RoboCasaModel[];
    non_standard: RoboCasaModel[];
}

export default function RoboCasaPage() {
    const { locale } = useLanguage();
    const [data, setData] = useState<RoboCasaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showClosedSource, setShowClosedSource] = useState(false);
    const [sortBy, setSortBy] = useState<'rank' | 'avg_success_rate' | 'date'>('rank');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const texts = {
        en: {
            title: 'RoboCasa-GR1-Tabletop Leaderboard',
            benchmarkIntro: 'RoboCasa-GR1-Tabletop is a benchmark built upon the RoboCasa simulation framework by GR00T-N1.5, tailored for GR-1 tabletop tasks, enabling the evaluation of generalist robotic policies in diverse household tasks.',
            benchmarkLink: 'View RoboCasa Website', // 建议替换为真实官网
            models: 'models',
            rank: 'Rank',
            model: 'Model',
            score: 'Average Success Rate',
            date: 'Date',
            paper: 'Paper',
            github: 'Code',
            clickToExpand: 'Click row to expand details',
            showAllModels: 'Include All Models',
            openSourceOnly: 'Open-Source Only',
            standardModels: 'Standard Evaluation Models',
            opensource: 'Open Source',
            note: 'Note',
            metricDesc: {
                score: 'Average success rate across all evaluation tasks',
            }
        },
        zh: {
            title: 'RoboCasa-GR1-Tabletop 基准测试榜单',
            benchmarkIntro: 'RoboCasa-GR1-Tabletop 是 GR00T-N1.5 基于 RoboCasa 仿真框架构建的基准测试，专为 GR-1 桌面任务定制，旨在评估通用机器人在多样化家庭任务中的策略。',
            benchmarkLink: '访问 RoboCasa 官网',
            models: '个模型',
            rank: '排名',
            model: '模型',
            score: '平均成功率',
            date: '日期',
            paper: '论文',
            github: '代码',
            clickToExpand: '点击行展开详情',
            showAllModels: '显示全部模型',
            openSourceOnly: '仅开源模型',
            standardModels: '标准测试模型',
            opensource: '开源',
            note: '备注',
            metricDesc: {
                score: '所有评估任务的平均成功率',
            }
        }
    };

    const t = texts[locale];

    useEffect(() => {
        const loadData = async () => {
            try {
                // 3. 确保你的 JSON 文件名为 robocasa_gr1_tabletop.json
                const res = await fetch(`/data/robocasa_gr1_tabletop.json`);
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

    const handleSort = (key: 'rank' | 'avg_success_rate' | 'date') => {
        if (sortBy === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortOrder(key === 'rank' ? 'asc' : 'desc');
        }
    };

    const sortData = (models: RoboCasaModel[]) => {
        return [...models].sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'rank') {
                comparison = a.rank - b.rank;
            } else if (sortBy === 'avg_success_rate') {
                comparison = (b.avg_success_rate || 0) - (a.avg_success_rate || 0);
            } else if (sortBy === 'date') {
                comparison = (b.pub_date || '').localeCompare(a.pub_date || '');
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    };

    const getDisplayData = () => {
        if (!data) return [];
        let models: RoboCasaModel[] = [...data.standard_opensource];
        if (showClosedSource) {
            models = [...models, ...data.standard_closed];
        }
        // 默认按分数降序
        models.sort((a, b) => (b.avg_success_rate || 0) - (a.avg_success_rate || 0));
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

    const renderTable = (models: RoboCasaModel[]) => (
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
                                        <span className="text-rose-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                {t.model}
                            </th>
                            <th
                                className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                                onClick={() => handleSort('avg_success_rate')}
                            >
                                <div className="flex items-center gap-1">
                                    {t.score}
                                    {sortBy === 'avg_success_rate' && (
                                        <span className="text-rose-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
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
                                        <span className="text-rose-600">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                                    )}
                                </div>
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{t.paper}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {models.map((model, idx) => {
                            const rowKey = `main-${model.name}-${idx}`;
                            return (
                                <>
                                    <tr
                                        key={rowKey}
                                        className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${expandedRows.has(rowKey) ? 'bg-rose-50' : ''}`}
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
                                            <span className="font-mono text-lg font-semibold text-rose-600">
                                                {formatValue(model.avg_success_rate)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 text-sm">{model.pub_date || '-'}</td>
                                        <td className="px-4 py-3">
                                            {model.paper_url && (
                                                <a
                                                    href={model.paper_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-rose-600 hover:text-rose-800 hover:underline text-sm"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📄 Link
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedRows.has(rowKey) && (
                                        <tr key={`${rowKey}-expanded`} className="bg-rose-50 border-b border-slate-200">
                                            <td colSpan={5} className="px-4 py-4">
                                                <div className="ml-12 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-rose-100 rounded-lg p-3 shadow-sm">
                                                            <div className="text-xs text-rose-600 mb-1">{t.score}</div>
                                                            <div className="font-mono text-xl font-semibold text-rose-700">
                                                                {formatValue(model.avg_success_rate)}
                                                            </div>
                                                        </div>
                                                        {model.note && (
                                                            <div className="bg-white rounded-lg p-3 shadow-sm">
                                                                <div className="text-xs text-slate-500 mb-1">{t.note}</div>
                                                                <div className="text-sm text-slate-700">
                                                                    {model.note}
                                                                </div>
                                                            </div>
                                                        )}
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
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition-colors"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                📄 {t.paper}
                                                            </a>
                                                        )}
                                                    </div>
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
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-rose-200 text-sm mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span>RoboCasa</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
                    <p className="text-rose-100 max-w-3xl mb-4">{t.benchmarkIntro}</p>
                    <a
                        href="https://github.com/robocasa/robocasa-gr1-tabletop-tasks"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-rose-400 hover:bg-rose-300 rounded-lg text-sm transition-colors"
                    >
                        🌐 {t.benchmarkLink}
                    </a>
                    <div className="mt-4 flex items-center gap-4">
                        <span className="px-3 py-1 bg-rose-400 rounded-full text-sm">
                            {displayData.length} {t.models}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowClosedSource(!showClosedSource)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${showClosedSource
                                ? 'bg-purple-600 text-white'
                                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
                                }`}
                        >
                            {showClosedSource ? t.showAllModels : t.openSourceOnly}
                        </button>
                    </div>
                </div>

                <p className="text-sm text-slate-500 mb-4">{t.clickToExpand}</p>

                <h2 className="text-xl font-bold text-slate-800 mb-4">{t.standardModels}</h2>
                {displayData.length > 0 ? (
                    renderTable(displayData)
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                        {locale === 'en' ? 'No models found with current filters.' : '当前筛选条件下没有模型。'}
                    </div>
                )}

                <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                        {locale === 'en' ? 'Metrics Description' : '指标说明'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div><span className="font-medium">{t.score}:</span> {t.metricDesc.score}</div>
                    </div>
                </div>

                <ContactFooter />
            </div>
        </div>
    );
}
