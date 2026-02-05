'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/LanguageContext';
import ContactFooter from '@/components/ContactFooter';

// 动态导入图表组件，避免 SSR 问题
const ProgressChart = dynamic(() => import('@/components/ProgressChart'), {
    ssr: false,
    loading: () => (
        <div className="py-16 px-4 bg-slate-50">
            <div className="max-w-7xl mx-auto text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-8"></div>
                    <div className="h-96 bg-slate-200 rounded"></div>
                </div>
            </div>
        </div>
    ),
});

const StatsOverview = dynamic(() => import('@/components/StatsOverview'), {
    ssr: false,
    loading: () => (
        <div className="py-12 px-4 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
                            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    ),
});

interface SummaryData {
    libero: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
    libero_plus: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
    calvin: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
    metaworld: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
    robochallenge: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
    robocasa: {
        total_models: number;
        standard_opensource_count: number;
        top_5: { name: string; score: number; rank: number }[];
        top_5_sft: { name: string; score: number; rank: number }[];
        top_5_rl: { name: string; score: number; rank: number }[];
    };
}

interface NewsItem {
    date: string;
    content_en: string;
    content_zh: string;
}

export default function Home() {
    const { t, locale } = useLanguage();
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [newsData, setNewsData] = useState<NewsItem[]>([]);
    const [includeRlModels, setIncludeRlModels] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [summaryRes, newsRes] = await Promise.all([
                    fetch(`/data/data.json`),
                    fetch(`/data/updateNews.json`)
                ]);
                const summaryJson = await summaryRes.json();
                const newsJson = await newsRes.json();
                setSummaryData(summaryJson);
                setNewsData(newsJson.news || []);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    // 格式化新闻内容：榜单用粗体+蓝色，模型用斜体+紫色
    const formatNewsContent = (content: string) => {
        // 榜单列表（需要粗体和蓝色）
        const benchmarks = ['RoboChallenge', 'RoboCasa-GR1-Tabletop', 'LIBERO Plus', 'LIBERO', 'Meta-World', 'CALVIN', 'Libero Plus', 'Libero', 'Calvin'];
        // 模型列表（需要斜体和紫色）
        const models = [
            'DeepThinkVLA', 'Dadu-Corki', 'RoboTron Mani', 'CronusVLA', 'InstructVLA', 'InternVLA-M1', 'ACoT-VLA',
            'OpenVLA', 'Pi0', 'RIPT', 'NORA-1.5', 'Being-H0.5', 'EO-1', 'DreamVLA', 'Rlinf-VLA', 'pi-RL', 'UnifoLM-VLA-0'
        ];

        let formattedContent = content;

        // 先处理榜单
        benchmarks.forEach(benchmark => {
            const regex = new RegExp(`(${benchmark})`, 'g');
            formattedContent = formattedContent.replace(
                regex,
                '<span class="font-bold text-amber-700">$1</span>'
            );
        });

        // 再处理模型
        models.forEach(model => {
            const regex = new RegExp(`(${model})`, 'g');
            formattedContent = formattedContent.replace(
                regex,
                '<span class="italic text-amber-700">$1</span>'
            );
        });

        return formattedContent;
    };

    // 格式化分数：根据不同 benchmark 使用不同小数位数
    // CALVIN, RoboChallenge: 两位小数
    // LIBERO, Meta-World, LIBERO Plus, RoboCasa-GR1-Tabletop: 一位小数
    const formatScore = (score: number, benchmarkId: string): string => {
        const twoDecimalBenchmarks = ['calvin', 'robochallenge'];
        const decimals = twoDecimalBenchmarks.includes(benchmarkId) ? 2 : 1;
        return score.toFixed(decimals);
    };

    // 构建 benchmarks 数据 - 顺序: libero plus, libero, metaworld, calvin, robochallenge
    // 根据 includeRlModels 选择数据源
    const getTopModels = (benchmark: keyof SummaryData) => {
        if (!summaryData) return [];
        const data = summaryData[benchmark];
        if (includeRlModels) {
            return data.top_5?.map(m => ({ rank: m.rank, name: m.name, score: m.score })) || [];
        }
        return data.top_5_sft?.map(m => ({ rank: m.rank, name: m.name, score: m.score })) || [];
    };

    // 第一行: libero, metaworld, calvin
    const firstRowBenchmarks = [
        {
            id: 'libero',
            name: t.benchmarkDesc.libero.name,
            description: t.benchmarkDesc.libero.description,
            metric: t.benchmarkDesc.libero.metric,
            modelCount: summaryData?.libero.standard_opensource_count || 0,
            topModels: getTopModels('libero'),
            color: 'blue',
        },
        {
            id: 'metaworld',
            name: t.benchmarkDesc.metaworld.name,
            description: t.benchmarkDesc.metaworld.description,
            metric: t.benchmarkDesc.metaworld.metric,
            modelCount: summaryData?.metaworld.standard_opensource_count || 0,
            topModels: getTopModels('metaworld'),
            color: 'purple',
        },
        {
            id: 'calvin',
            name: t.benchmarkDesc.calvin.name,
            description: t.benchmarkDesc.calvin.description,
            metric: t.benchmarkDesc.calvin.metric,
            modelCount: summaryData?.calvin.standard_opensource_count || 0,
            topModels: getTopModels('calvin'),
            color: 'green',
        },
    ];

    // 第二行: libero plus, robochallenge, robocasa
    const secondRowBenchmarks = [
        {
            id: 'liberoplus',
            name: t.benchmarkDesc.liberoPlus.name,
            description: t.benchmarkDesc.liberoPlus.description,
            metric: t.benchmarkDesc.liberoPlus.metric,
            modelCount: summaryData?.libero_plus.standard_opensource_count || 0,
            topModels: getTopModels('libero_plus'),
            color: 'orange',
        },
        {
            id: 'robochallenge',
            name: t.benchmarkDesc.robochallenge?.name || 'RoboChallenge',
            description: t.benchmarkDesc.robochallenge?.description || 'Real-world robotic manipulation benchmark',
            metric: t.benchmarkDesc.robochallenge?.metric || 'Score',
            modelCount: summaryData?.robochallenge?.standard_opensource_count || 0,
            topModels: getTopModels('robochallenge'),
            color: 'teal',
        },
        {
            id: 'robocasa_gr1_tabletop',
            name: t.benchmarkDesc.robocasa?.name || 'RoboCasa-GR1-Tabletop',
            description: t.benchmarkDesc.robocasa?.description || 'Tabletop manipulation tasks benchmark based on RoboCasa',
            metric: t.benchmarkDesc.robocasa?.metric || 'Average Success Rate (%)',
            modelCount: summaryData?.robocasa?.standard_opensource_count || 0,
            topModels: getTopModels('robocasa'),
            color: 'rose',
        },
    ];

    const colorClasses = {
        blue: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-600',
            badge: 'bg-blue-100 text-blue-800',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
        orange: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-600',
            badge: 'bg-orange-100 text-orange-800',
            button: 'bg-orange-600 hover:bg-orange-700',
        },
        green: {
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
            text: 'text-emerald-600',
            badge: 'bg-emerald-100 text-emerald-800',
            button: 'bg-emerald-600 hover:bg-emerald-700',
        },
        purple: {
            bg: 'bg-purple-50',
            border: 'border-purple-200',
            text: 'text-purple-600',
            badge: 'bg-purple-100 text-purple-800',
            button: 'bg-purple-600 hover:bg-purple-700',
        },
        teal: {
            bg: 'bg-teal-50',
            border: 'border-teal-200',
            text: 'text-teal-600',
            badge: 'bg-teal-100 text-teal-800',
            button: 'bg-teal-600 hover:bg-teal-700',
        },
        rose: {
            bg: 'bg-rose-50',
            border: 'border-rose-200',
            text: 'text-rose-600',
            badge: 'bg-rose-100 text-rose-800',
            button: 'bg-rose-600 hover:bg-rose-700',
        },
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        {t.home.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 mb-6">
                        {t.home.subtitle}
                    </p>
                    <p className="text-slate-400 max-w-3xl mx-auto mb-8">
                        {t.home.description}
                    </p>
                    <div className="flex justify-center space-x-4 mb-6">
                        <Link
                            href="/benchmarks/libero"
                            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
                        >
                            {t.home.viewLeaderboard}
                        </Link>
                        <Link
                            href="/methodology"
                            className="px-6 py-3 border border-slate-500 hover:border-slate-400 rounded-lg font-medium transition-colors"
                        >
                            {t.common.learnMore}
                        </Link>
                    </div>
                    {/* Star CTA */}
                    <div className="mt-4">
                        <a
                            href="https://github.com/MINT-SJTU/Evo-SOTA.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            ⭐ {t.home.starUs || 'Star us on GitHub if you find this useful!'}
                        </a>
                    </div>
                </div>
            </section>

            {/* Update News - 浅黄色背景，从 JSON 文件读取 */}
            <div className="bg-amber-50 border-y border-amber-200 py-4 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-start gap-4">
                        <span className="text-sm font-bold text-amber-800 whitespace-nowrap flex items-center gap-1 pt-0.5">
                            📢 {locale === 'zh' ? '最近更新' : 'Latest Updates'}
                        </span>
                        <div className="flex flex-col gap-1 text-sm">
                            {newsData.slice(0, 5).map((news, index) => {
                                const content = locale === 'zh' ? news.content_zh : news.content_en;
                                const formattedContent = formatNewsContent(content);
                                return (
                                    <div key={index} className="text-amber-900">
                                        <span className="font-medium text-amber-700">
                                            {news.date.replace('-', '-')}
                                        </span>{' '}
                                        <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <StatsOverview />

            {/* Benchmark Cards */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {t.nav.benchmarks}
                        </h2>
                        {/* RL Models Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">
                                {locale === 'zh' ? '包含 RL 模型' : 'Include RL Models'}
                            </span>
                            <button
                                onClick={() => setIncludeRlModels(!includeRlModels)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeRlModels ? 'bg-primary-600' : 'bg-slate-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeRlModels ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* 第一行: LIBERO, MetaWorld, CALVIN */}
                    <div className="flex justify-center gap-5 mb-5 flex-wrap">
                        {firstRowBenchmarks.map((benchmark) => {
                            const colors = colorClasses[benchmark.color as keyof typeof colorClasses];
                            return (
                                <div
                                    key={benchmark.id}
                                    className={`w-80 rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden card-hover`}
                                >
                                    {/* Card Header */}
                                    <div className="p-6 border-b border-slate-200 bg-white">
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <h3 className={`text-xl font-bold ${colors.text} min-h-[3.5rem] flex items-center flex-1 min-w-0 leading-tight`}>
                                                {benchmark.name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge} whitespace-nowrap flex-shrink-0 mt-1`}>
                                                {benchmark.modelCount} {t.home.models}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 h-10">
                                            {benchmark.description}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {t.home.primaryMetric}: {benchmark.metric}
                                        </p>
                                    </div>

                                    {/* Top Models */}
                                    <div className="p-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                            {t.home.topPerformers}
                                        </h4>
                                        <div className="space-y-2">
                                            {benchmark.topModels.map((model) => (
                                                <div
                                                    key={model.rank}
                                                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${model.rank === 1
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : model.rank === 2
                                                                    ? 'bg-gray-100 text-gray-600'
                                                                    : model.rank === 3
                                                                        ? 'bg-orange-100 text-orange-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                            {model.rank}
                                                        </span>
                                                        <span className="font-medium text-slate-800 text-sm">
                                                            {model.name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-semibold text-sm ${colors.text}`}>
                                                        {formatScore(model.score, benchmark.id)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 pt-0">
                                        <Link
                                            href={`/benchmarks/${benchmark.id}`}
                                            className={`block w-full text-center py-2 rounded-lg text-white font-medium transition-colors ${colors.button}`}
                                        >
                                            {t.home.viewLeaderboard}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* 第二行: LIBERO Plus, RoboChallenge, RoboCasa-GR1_tabletop */}
                    <div className="flex justify-center gap-5 flex-wrap">
                        {secondRowBenchmarks.map((benchmark) => {
                            const colors = colorClasses[benchmark.color as keyof typeof colorClasses];
                            return (
                                <div
                                    key={benchmark.id}
                                    className={`w-80 rounded-xl border-2 ${colors.border} ${colors.bg} overflow-hidden card-hover`}
                                >
                                    {/* Card Header */}
                                    <div className="p-6 border-b border-slate-200 bg-white">
                                        <div className="flex items-start justify-between mb-2 gap-2">
                                            <h3 className={`text-xl font-bold ${colors.text} min-h-[3.5rem] flex items-center flex-1 min-w-0 leading-tight`}>
                                                {benchmark.name}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge} whitespace-nowrap flex-shrink-0 mt-1`}>
                                                {benchmark.modelCount} {t.home.models}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-2 h-10">
                                            {benchmark.description}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            {t.home.primaryMetric}: {benchmark.metric}
                                        </p>
                                    </div>

                                    {/* Top Models */}
                                    <div className="p-4">
                                        <h4 className="text-sm font-semibold text-slate-700 mb-3">
                                            {t.home.topPerformers}
                                        </h4>
                                        <div className="space-y-2">
                                            {benchmark.topModels.map((model) => (
                                                <div
                                                    key={model.rank}
                                                    className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <span
                                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${model.rank === 1
                                                                ? 'bg-yellow-100 text-yellow-700'
                                                                : model.rank === 2
                                                                    ? 'bg-gray-100 text-gray-600'
                                                                    : model.rank === 3
                                                                        ? 'bg-orange-100 text-orange-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                                }`}
                                                        >
                                                            {model.rank}
                                                        </span>
                                                        <span className="font-medium text-slate-800 text-sm">
                                                            {model.name}
                                                        </span>
                                                    </div>
                                                    <span className={`font-semibold text-sm ${colors.text}`}>
                                                        {formatScore(model.score, benchmark.id)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 pt-0">
                                        <Link
                                            href={`/benchmarks/${benchmark.id}`}
                                            className={`block w-full text-center py-2 rounded-lg text-white font-medium transition-colors ${colors.button}`}
                                        >
                                            {t.home.viewLeaderboard}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Progress Chart Section */}
            <ProgressChart />

            {/* Contact Footer */}
            <div className="max-w-7xl mx-auto px-4">
                <ContactFooter />
            </div>
        </div>
    );
}