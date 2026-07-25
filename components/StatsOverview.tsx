'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

type Model = Record<string, unknown> & {
    name: string;
    is_rl?: boolean;
};

interface Leader {
    name: string;
    score: number;
}

interface BenchmarkStat {
    id: string;
    name: string;
    count: number;
    sft: Leader;
    rl: Leader;
    decimals: number;
    suffix: string;
    badge: string;
    sftGradient: string;
    rlGradient: string;
}

interface StatsData {
    totalModels: number;
    benchmarks: BenchmarkStat[];
}

const benchmarkConfigs = [
    { id: 'robotwin', name: 'RoboTwin 2.0', path: '/data/robotwin2.json', metric: 'hard', gradient: 'amber', decimals: 1, suffix: '%' },
    { id: 'libero_plus', name: 'LIBERO Plus', path: '/data/liberoPlus.json', metric: 'total', gradient: 'orange', decimals: 1, suffix: '%' },
    { id: 'libero', name: 'LIBERO', path: '/data/libero.json', metric: 'average', gradient: 'blue', decimals: 1, suffix: '%' },
    { id: 'metaworld', name: 'Meta-World', path: '/data/metaworld.json', metric: 'average', gradient: 'purple', decimals: 1, suffix: '%' },
    { id: 'calvin', name: 'CALVIN (ABC→D)', path: '/data/calvin.json', metric: 'avg_len', gradient: 'emerald', decimals: 2, suffix: '' },
    { id: 'robochallenge', name: 'RoboChallenge', path: '/data/robochallenge.json', metric: 'score', gradient: 'teal', decimals: 2, suffix: '' },
    { id: 'robocasa365', name: 'RoboCasa365', path: '/data/robocasa365.json', metric: 'average', gradient: 'cyan', decimals: 1, suffix: '%' },
    { id: 'robocasa', name: 'RoboCasa-GR1-Tabletop', path: '/data/robocasa_gr1_tabletop.json', metric: 'avg_success_rate', gradient: 'rose', decimals: 1, suffix: '%' },
] as const;

const colorClasses: Record<string, { badge: string; sft: string; rl: string }> = {
    amber: { badge: 'bg-amber-100 text-amber-700', sft: 'from-amber-500 to-amber-600', rl: 'from-amber-400 to-amber-500' },
    orange: { badge: 'bg-orange-100 text-orange-700', sft: 'from-orange-500 to-orange-600', rl: 'from-orange-400 to-orange-500' },
    blue: { badge: 'bg-blue-100 text-blue-700', sft: 'from-blue-500 to-blue-600', rl: 'from-blue-400 to-blue-500' },
    purple: { badge: 'bg-purple-100 text-purple-700', sft: 'from-purple-500 to-purple-600', rl: 'from-purple-400 to-purple-500' },
    emerald: { badge: 'bg-emerald-100 text-emerald-700', sft: 'from-emerald-500 to-emerald-600', rl: 'from-emerald-400 to-emerald-500' },
    teal: { badge: 'bg-teal-100 text-teal-700', sft: 'from-teal-500 to-teal-600', rl: 'from-teal-400 to-teal-500' },
    cyan: { badge: 'bg-cyan-100 text-cyan-700', sft: 'from-cyan-500 to-cyan-600', rl: 'from-cyan-400 to-cyan-500' },
    rose: { badge: 'bg-rose-100 text-rose-700', sft: 'from-rose-500 to-rose-600', rl: 'from-rose-400 to-rose-500' },
};

export default function StatsOverview() {
    const { locale } = useLanguage();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [animationProgress, setAnimationProgress] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [summaryResponse, ...responses] = await Promise.all([
                    fetch('/data/data.json'),
                    ...benchmarkConfigs.map(config => fetch(config.path)),
                ]);
                const summary = await summaryResponse.json();
                const datasets = await Promise.all(responses.map(response => response.json()));

                const benchmarks = benchmarkConfigs.map((config, index): BenchmarkStat => {
                    const raw = config.id === 'calvin' ? datasets[index].abc_d : datasets[index];
                    const models: Model[] = raw.standard_opensource || [];
                    const getLeader = (isRl: boolean): Leader => {
                        const model = models.find(item => Boolean(item.is_rl) === isRl);
                        const score = model?.[config.metric];
                        return {
                            name: model?.name || 'N/A',
                            score: typeof score === 'number' ? score : 0,
                        };
                    };
                    const colors = colorClasses[config.gradient];
                    return {
                        id: config.id,
                        name: config.name,
                        count: models.length,
                        sft: getLeader(false),
                        rl: getLeader(true),
                        decimals: config.decimals,
                        suffix: config.suffix,
                        badge: colors.badge,
                        sftGradient: colors.sft,
                        rlGradient: colors.rl,
                    };
                });

                setStats({
                    totalModels: summary.total_unique_models || 0,
                    benchmarks,
                });
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        if (!stats) return;
        let frame = 0;
        const totalFrames = 60;
        const timer = setInterval(() => {
            frame += 1;
            setAnimationProgress(1 - Math.pow(1 - frame / totalFrames, 3));
            if (frame >= totalFrames) clearInterval(timer);
        }, 25);
        return () => clearInterval(timer);
    }, [stats]);

    const texts = {
        en: {
            totalModels: 'Total Models Tracked',
            benchmarks: 'Benchmarks',
            covering: 'Covering',
            yearsOfProgress: 'Years of VLA Progress',
            currentLeadersSft: 'Current Leaders (SFT only)',
            currentLeadersRl: 'Current Leaders (RL)',
        },
        zh: {
            totalModels: '追踪模型总数',
            benchmarks: '基准测试',
            covering: '涵盖',
            yearsOfProgress: '年 VLA 发展历程',
            currentLeadersSft: '当前领先模型（仅 SFT）',
            currentLeadersRl: '当前领先模型（RL）',
        }
    };
    const t = texts[locale];

    if (!stats) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-9 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="md:col-span-2 h-32 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse" />
                    ))}
                    <div className="md:col-span-3 h-32 bg-white rounded-xl shadow-sm border border-slate-200 animate-pulse" />
                </div>
            </section>
        );
    }

    const animatedTotal = Math.round(stats.totalModels * animationProgress);
    const formatScore = (leader: Leader, benchmark: BenchmarkStat) =>
        leader.score > 0 ? `${leader.score.toFixed(benchmark.decimals)}${benchmark.suffix}` : '-';

    const LeaderGrid = ({ type }: { type: 'sft' | 'rl' }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {stats.benchmarks.map(benchmark => {
                const leader = benchmark[type];
                return (
                    <div
                        key={`${type}-${benchmark.id}`}
                        className={`min-w-0 bg-gradient-to-br ${type === 'sft' ? benchmark.sftGradient : benchmark.rlGradient} text-white rounded-xl p-3 shadow-lg`}
                    >
                        <div className="text-xs opacity-80 mb-1 truncate">{benchmark.name}</div>
                        <div className="font-bold text-sm truncate">{leader.name}</div>
                        <div className="text-lg font-mono mt-1">{formatScore(leader, benchmark)}</div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-9 gap-6">
                    <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="text-4xl font-bold text-primary-600 mb-1">{animatedTotal}</div>
                        <div className="text-slate-600 text-sm">{t.totalModels}</div>
                    </div>
                    <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="text-4xl font-bold text-purple-600 mb-1">8</div>
                        <div className="text-slate-600 text-sm">{t.benchmarks}</div>
                    </div>
                    <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="text-4xl font-bold text-emerald-600 mb-1">3+</div>
                        <div className="text-slate-600 text-sm">{t.yearsOfProgress}</div>
                    </div>
                    <div className="md:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="text-sm text-slate-600 mb-2">{t.covering}</div>
                        <div className="flex flex-wrap items-center gap-1 text-[10px]">
                            {stats.benchmarks.map(benchmark => (
                                <span key={benchmark.id} className={`px-1.5 py-0.5 rounded-full font-medium ${benchmark.badge}`}>
                                    {benchmark.name.replace(' (ABC→D)', '')}: {Math.round(benchmark.count * animationProgress)}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">🏆 {t.currentLeadersSft}</h3>
                    <LeaderGrid type="sft" />
                </div>
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">🚀 {t.currentLeadersRl}</h3>
                    <LeaderGrid type="rl" />
                </div>
            </div>
        </section>
    );
}
