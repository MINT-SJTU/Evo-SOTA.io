'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ContactFooter from '@/components/ContactFooter';
import { useLanguage } from '@/lib/LanguageContext';

interface RoboCasa365Model {
    name: string;
    setting: string;
    paper_url: string | null;
    pub_date: string | null;
    is_opensource: boolean;
    opensource_url: string | null;
    is_rl?: boolean;
    atomic_seen: number | null;
    composite_seen: number | null;
    composite_unseen: number | null;
    average: number | null;
    note: string;
    rank: number;
    source: string;
    is_standard: boolean;
}

interface RoboCasa365Data {
    standard_opensource: RoboCasa365Model[];
    standard_closed: RoboCasa365Model[];
    non_standard: RoboCasa365Model[];
}

type SortKey = 'rank' | 'average' | 'date';
type ModelType = 'all' | 'sft' | 'rl';

export default function RoboCasa365Page() {
    const { locale } = useLanguage();
    const [data, setData] = useState<RoboCasa365Data | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showAllMetrics, setShowAllMetrics] = useState(false);
    const [includeClosed, setIncludeClosed] = useState(false);
    const [modelType, setModelType] = useState<ModelType>('sft');
    const [sortKey, setSortKey] = useState<SortKey>('rank');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const texts = {
        en: {
            title: 'RoboCasa365 Leaderboard',
            intro: 'RoboCasa365 evaluates generalist robot policies across atomic and composite household manipulation tasks, including unseen task compositions.',
            official: 'View Official RoboCasa365 Leaderboard',
            models: 'models',
            rank: 'Rank',
            model: 'Model',
            average: 'Average',
            date: 'Date',
            paper: 'Paper',
            code: 'Code',
            openSource: 'Open Source',
            standardModels: 'Standard Evaluation Models',
            showAllMetrics: 'Show All Metrics',
            compactView: 'Compact View',
            includeAll: 'Include All Models',
            openOnly: 'Open-Source Only',
            modelType: 'Model Type',
            sft: 'SFT Only',
            rl: 'RL Only',
            all: 'All Models',
            click: 'Click row for details',
            clickModel: 'Click model name for profile',
            note: 'Note',
            source: 'Source',
            noModels: 'No models found with the current filters.',
            metrics: 'Metric Descriptions',
            atomic: 'Atomic-Seen',
            atomicDesc: 'Seen atomic household manipulation tasks.',
            compositeSeen: 'Composite-Seen',
            compositeSeenDesc: 'Seen compositions of multiple atomic skills.',
            compositeUnseen: 'Composite-Unseen',
            compositeUnseenDesc: 'Unseen compositions measuring generalization.',
        },
        zh: {
            title: 'RoboCasa365 基准测试榜单',
            intro: 'RoboCasa365 在原子任务和组合式家庭操作任务上评估通用机器人策略，并包含未见任务组合以衡量泛化能力。',
            official: '查看 RoboCasa365 官方榜单',
            models: '个模型',
            rank: '排名',
            model: '模型',
            average: '平均值',
            date: '日期',
            paper: '论文',
            code: '代码',
            openSource: '开源',
            standardModels: '标准测试模型',
            showAllMetrics: '展开所有指标',
            compactView: '精简视图',
            includeAll: '显示全部模型',
            openOnly: '仅开源模型',
            modelType: '模型类型',
            sft: '仅 SFT',
            rl: '仅 RL',
            all: '全部模型',
            click: '点击行查看详情',
            clickModel: '点击模型名称查看档案',
            note: '备注',
            source: '数据来源',
            noModels: '当前筛选条件下没有模型。',
            metrics: '指标说明',
            atomic: 'Atomic-Seen',
            atomicDesc: '已见的原子级家庭操作任务。',
            compositeSeen: 'Composite-Seen',
            compositeSeenDesc: '由多个原子技能组成的已见组合任务。',
            compositeUnseen: 'Composite-Unseen',
            compositeUnseenDesc: '用于衡量泛化能力的未见组合任务。',
        },
    };
    const t = texts[locale];

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        if (type === 'rl' || type === 'sft') setModelType(type);
        if (params.get('filter') === 'all') setIncludeClosed(true);

        fetch('/data/robocasa365.json')
            .then(response => response.json())
            .then(setData)
            .catch(error => console.error('Error loading RoboCasa365 data:', error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!loading && window.location.hash) {
            document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [loading]);

    const displayData = useMemo(() => {
        if (!data) return [];
        let models = includeClosed
            ? [...data.standard_opensource, ...data.standard_closed]
            : [...data.standard_opensource];
        if (modelType === 'sft') models = models.filter(model => !model.is_rl);
        if (modelType === 'rl') models = models.filter(model => model.is_rl);
        models.sort((a, b) => (b.average ?? -1) - (a.average ?? -1));
        models = models.map((model, index) => ({ ...model, rank: index + 1 }));
        return [...models].sort((a, b) => {
            let comparison = 0;
            if (sortKey === 'rank') comparison = a.rank - b.rank;
            if (sortKey === 'average') comparison = (b.average ?? -1) - (a.average ?? -1);
            if (sortKey === 'date') comparison = (b.pub_date || '').localeCompare(a.pub_date || '');
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [data, includeClosed, modelType, sortKey, sortOrder]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortOrder(order => order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder(key === 'rank' ? 'asc' : 'desc');
        }
    };

    const toggleRow = (key: string) => {
        setExpandedRows(previous => {
            const next = new Set(previous);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    };

    const value = (score: number | null) => score === null ? '-' : `${score.toFixed(1)}%`;
    const sortArrow = (key: SortKey) => sortKey === key ? (sortOrder === 'asc' ? '↑' : '↓') : '';
    const rankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
        if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
        return 'bg-slate-50 text-slate-600 border-slate-200';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-7xl mx-auto animate-pulse">
                    <div className="h-10 bg-slate-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-8" />
                    <div className="h-96 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center gap-2 text-cyan-100 text-sm mb-4">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>/</span>
                        <span>RoboCasa365</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h1>
                    <p className="text-cyan-50 max-w-3xl mb-4">{t.intro}</p>
                    <a
                        href="https://robocasa.ai/leaderboard.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 rounded-lg text-sm"
                    >
                        🌐 {t.official}
                    </a>
                    <div className="mt-4">
                        <span className="px-3 py-1 bg-cyan-400 rounded-full text-sm">{displayData.length} {t.models}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => setShowAllMetrics(value => !value)}
                            className={`px-4 py-2 rounded-lg font-medium ${showAllMetrics ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'}`}
                        >
                            {showAllMetrics ? t.compactView : t.showAllMetrics}
                        </button>
                        <button
                            onClick={() => setIncludeClosed(value => !value)}
                            className={`px-4 py-2 rounded-lg font-medium ${includeClosed ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'}`}
                        >
                            {includeClosed ? t.includeAll : t.openOnly}
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-slate-600">{t.modelType}:</span>
                        <div className="inline-flex rounded-lg overflow-hidden border border-cyan-200">
                            {([
                                ['sft', t.sft],
                                ['rl', t.rl],
                                ['all', t.all],
                            ] as const).map(([type, label]) => (
                                <button
                                    key={type}
                                    onClick={() => setModelType(type)}
                                    className={`px-3 py-1.5 text-sm font-medium border-l first:border-l-0 border-cyan-200 ${modelType === type ? 'bg-cyan-600 text-white' : 'bg-white text-cyan-700 hover:bg-cyan-50'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1 mb-4 text-sm text-slate-500">
                    <span>💡 {t.click}</span>
                    <span>🔗 {t.clickModel}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-4">{t.standardModels}</h2>

                {displayData.length ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className={`w-full ${showAllMetrics ? 'min-w-[1050px]' : 'min-w-[760px]'}`}>
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th onClick={() => handleSort('rank')} className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer">{t.rank} <span className="text-cyan-600">{sortArrow('rank')}</span></th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{t.model}</th>
                                        <th onClick={() => handleSort('average')} className="px-4 py-3 text-center text-sm font-semibold text-slate-700 cursor-pointer">{t.average} <span className="text-cyan-600">{sortArrow('average')}</span></th>
                                        {showAllMetrics && (
                                            <>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.atomic}</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.compositeSeen}</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">{t.compositeUnseen}</th>
                                            </>
                                        )}
                                        <th onClick={() => handleSort('date')} className="px-4 py-3 text-left text-sm font-semibold text-slate-700 cursor-pointer">{t.date} <span className="text-cyan-600">{sortArrow('date')}</span></th>
                                        <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.paper}</th>
                                        <th className="px-2 py-3 text-center text-sm font-semibold text-slate-700">{t.code}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayData.map((model, index) => {
                                        const rowKey = `${model.name}-${model.setting || 'default'}-${index}`;
                                        return (
                                            <Fragment key={rowKey}>
                                                <tr
                                                    id={`model-row-${encodeURIComponent(model.name)}`}
                                                    onClick={() => toggleRow(rowKey)}
                                                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${expandedRows.has(rowKey) ? 'bg-cyan-50' : ''}`}
                                                >
                                                    <td className="px-4 py-3"><span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border ${rankStyle(model.rank)}`}>{model.rank}</span></td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Link href={`/models/${encodeURIComponent(model.name)}`} onClick={event => event.stopPropagation()} className="font-medium text-slate-800 hover:text-cyan-700 hover:underline">{model.name}</Link>
                                                            {model.is_opensource && <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">{t.openSource}</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{model.source || ''}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-mono text-lg font-semibold text-cyan-700">{value(model.average)}</td>
                                                    {showAllMetrics && (
                                                        <>
                                                            <td className="px-4 py-3 text-center font-mono text-slate-600">{value(model.atomic_seen)}</td>
                                                            <td className="px-4 py-3 text-center font-mono text-slate-600">{value(model.composite_seen)}</td>
                                                            <td className="px-4 py-3 text-center font-mono text-slate-600">{value(model.composite_unseen)}</td>
                                                        </>
                                                    )}
                                                    <td className="px-4 py-3 text-sm text-slate-600">{model.pub_date || '-'}</td>
                                                    <td className="px-2 py-3 text-center">{model.paper_url && <a href={model.paper_url} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()} className="text-cyan-700 hover:underline">📄 Link</a>}</td>
                                                    <td className="px-2 py-3 text-center">{model.opensource_url && <a href={model.opensource_url} target="_blank" rel="noopener noreferrer" onClick={event => event.stopPropagation()} className="text-slate-700 hover:underline">📦 {t.code}</a>}</td>
                                                </tr>
                                                {expandedRows.has(rowKey) && (
                                                    <tr className="bg-cyan-50 border-b border-slate-200">
                                                        <td colSpan={showAllMetrics ? 9 : 6} className="px-4 py-4">
                                                            <div className="ml-0 md:ml-12">
                                                                {!showAllMetrics && (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                                                        {[
                                                                            [t.atomic, model.atomic_seen],
                                                                            [t.compositeSeen, model.composite_seen],
                                                                            [t.compositeUnseen, model.composite_unseen],
                                                                            [t.average, model.average],
                                                                        ].map(([label, score]) => (
                                                                            <div key={String(label)} className="bg-white rounded-lg p-3 shadow-sm">
                                                                                <div className="text-xs text-cyan-700 mb-1">{label}</div>
                                                                                <div className="font-mono text-xl font-semibold text-cyan-800">{value(score as number | null)}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                {model.note && (
                                                                    <div className="mt-3 text-sm text-slate-600 space-y-1">
                                                                        <div><span className="font-medium">{t.note}:</span> {model.note}</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">{t.noModels}</div>
                )}

                <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">{t.metrics}</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div><span className="font-medium">{t.atomic}:</span> {t.atomicDesc}</div>
                        <div><span className="font-medium">{t.compositeSeen}:</span> {t.compositeSeenDesc}</div>
                        <div><span className="font-medium">{t.compositeUnseen}:</span> {t.compositeUnseenDesc}</div>
                    </div>
                </div>
                <ContactFooter />
            </main>
        </div>
    );
}
