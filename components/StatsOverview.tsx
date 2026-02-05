'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface StatsData {
    totalModels: number;
    liberoModels: number;
    liberoPlusModels: number;
    calvinModels: number;
    metaworldModels: number;
    robochallengeModels: number;
    robocasaModels: number;
    latestYear: string;
    // SFT Leaders
    topLiberoSft: { name: string; score: number };
    topLiberoPlusSft: { name: string; score: number };
    topCalvinSft: { name: string; score: number };
    topMetaworldSft: { name: string; score: number };
    topRobochallengeSft: { name: string; score: number };
    topRobocasaSft: { name: string; score: number };
    // RL Leaders
    topLiberoRl: { name: string; score: number };
    topLiberoPlusRl: { name: string; score: number };
    topCalvinRl: { name: string; score: number };
    topMetaworldRl: { name: string; score: number };
    topRobochallengeRl: { name: string; score: number };
    topRobocasaRl: { name: string; score: number };
}

export default function StatsOverview() {
    const { locale } = useLanguage();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [animatedValues, setAnimatedValues] = useState({
        totalModels: 0,
        liberoModels: 0,
        liberoPlusModels: 0,
        calvinModels: 0,
        metaworldModels: 0,
        robochallengeModels: 0,
        robocasaModels: 0,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [liberoRes, liberoPlusRes, calvinRes, metaworldRes, robochallengeRes, robocasaRes] = await Promise.all([
                    fetch(`/data/libero.json`),
                    fetch(`/data/liberoPlus.json`),
                    fetch(`/data/calvin.json`),
                    fetch(`/data/metaworld.json`),
                    fetch(`/data/robochallenge.json`),
                    fetch(`/data/robocasa_gr1_tabletop.json`)
                ]);

                const libero = await liberoRes.json();
                const liberoPlus = await liberoPlusRes.json();
                const calvin = await calvinRes.json();
                const metaworld = await metaworldRes.json();
                const robochallenge = await robochallengeRes.json();
                const robocasa = await robocasaRes.json();

                // 计算统计数据 - 使用标准开源模型数量
                const liberoCount = libero.standard_opensource?.length || 0;
                const liberoPlusCount = (liberoPlus.standard_opensource?.length || 0) + (liberoPlus.standard_opensource_mixsft?.length || 0);
                const calvinCount = calvin.abc_d?.standard_opensource?.length || 0;
                const metaworldCount = metaworld.standard_opensource?.length || 0;
                const robochallengeCount = robochallenge.standard_opensource?.length || 0;
                const robocasaCount = robocasa.standard_opensource?.length || 0;

                // 辅助函数：获取 SFT 和 RL 模型的 top 1
                const getTopByType = (models: any[], scoreKey: string) => {
                    const sftModels = models?.filter((m: any) => !m.is_rl) || [];
                    const rlModels = models?.filter((m: any) => m.is_rl) || [];
                    return {
                        sft: sftModels[0] || null,
                        rl: rlModels[0] || null
                    };
                };

                // 获取各 benchmark 的 SFT 和 RL top 1
                const liberoTop = getTopByType(libero.standard_opensource, 'average');
                const liberoPlusTop = getTopByType(liberoPlus.standard_opensource, 'total');
                const calvinTop = getTopByType(calvin.abc_d?.standard_opensource, 'avg_len');
                const metaworldTop = getTopByType(metaworld.standard_opensource, 'average');
                const robochallengeTop = getTopByType(robochallenge.standard_opensource, 'score');
                const robocasaTop = getTopByType(robocasa.standard_opensource, 'avg_success_rate');

                const newStats: StatsData = {
                    totalModels: liberoCount + liberoPlusCount + calvinCount + metaworldCount + robochallengeCount + robocasaCount,
                    liberoModels: liberoCount,
                    liberoPlusModels: liberoPlusCount,
                    calvinModels: calvinCount,
                    metaworldModels: metaworldCount,
                    robochallengeModels: robochallengeCount,
                    robocasaModels: robocasaCount,
                    latestYear: '2025',
                    // SFT Leaders
                    topLiberoSft: { name: liberoTop.sft?.name || 'N/A', score: liberoTop.sft?.average || 0 },
                    topLiberoPlusSft: { name: liberoPlusTop.sft?.name || 'N/A', score: liberoPlusTop.sft?.total || 0 },
                    topCalvinSft: { name: calvinTop.sft?.name || 'N/A', score: calvinTop.sft?.avg_len || 0 },
                    topMetaworldSft: { name: metaworldTop.sft?.name || 'N/A', score: metaworldTop.sft?.average || 0 },
                    topRobochallengeSft: { name: robochallengeTop.sft?.name || 'N/A', score: robochallengeTop.sft?.score || 0 },
                    topRobocasaSft: { name: robocasaTop.sft?.name || 'N/A', score: robocasaTop.sft?.avg_success_rate || 0 },
                    // RL Leaders
                    topLiberoRl: { name: liberoTop.rl?.name || 'N/A', score: liberoTop.rl?.average || 0 },
                    topLiberoPlusRl: { name: liberoPlusTop.rl?.name || 'N/A', score: liberoPlusTop.rl?.total || 0 },
                    topCalvinRl: { name: calvinTop.rl?.name || 'N/A', score: calvinTop.rl?.avg_len || 0 },
                    topMetaworldRl: { name: metaworldTop.rl?.name || 'N/A', score: metaworldTop.rl?.average || 0 },
                    topRobochallengeRl: { name: robochallengeTop.rl?.name || 'N/A', score: robochallengeTop.rl?.score || 0 },
                    topRobocasaRl: { name: robocasaTop.rl?.name || 'N/A', score: robocasaTop.rl?.avg_success_rate || 0 },
                };

                setStats(newStats);

                // 数字动画效果
                const duration = 1500;
                const steps = 60;
                const stepDuration = duration / steps;

                let currentStep = 0;
                const interval = setInterval(() => {
                    currentStep++;
                    const progress = currentStep / steps;
                    const easeOut = 1 - Math.pow(1 - progress, 3);

                    setAnimatedValues({
                        totalModels: Math.round(newStats.totalModels * easeOut),
                        liberoModels: Math.round(newStats.liberoModels * easeOut),
                        liberoPlusModels: Math.round(newStats.liberoPlusModels * easeOut),
                        calvinModels: Math.round(newStats.calvinModels * easeOut),
                        metaworldModels: Math.round(newStats.metaworldModels * easeOut),
                        robochallengeModels: Math.round(newStats.robochallengeModels * easeOut),
                        robocasaModels: Math.round(newStats.robocasaModels * easeOut),
                    });

                    if (currentStep >= steps) {
                        clearInterval(interval);
                    }
                }, stepDuration);

                return () => clearInterval(interval);
            } catch (error) {
                console.error('Error loading stats:', error);
            }
        };

        loadStats();
    }, []);

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
            currentLeadersSft: '当前领先模型 (SFT only)',
            currentLeadersRl: '当前领先模型 (RL)',
        }
    };

    const t = texts[locale];

    if (!stats) {
        return (
            <section className="py-12 px-4 sm:px-6 lg:px-8">
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
            </section>
        );
    }

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Total Models */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col items-start justify-center">
                        <div className="text-4xl font-bold text-primary-600 mb-1">
                            {animatedValues.totalModels}+
                        </div>
                        <div className="text-slate-600 text-sm">{t.totalModels}</div>
                    </div>

                    {/* Benchmarks */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col items-start justify-center">
                        <div className="text-4xl font-bold text-purple-600 mb-1">6</div>
                        <div className="text-slate-600 text-sm">{t.benchmarks}</div>
                    </div>

                    {/* Years */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col items-start justify-center">
                        <div className="text-4xl font-bold text-emerald-600 mb-1">3+</div>
                        <div className="text-slate-600 text-sm">{t.yearsOfProgress}</div>
                    </div>

                    {/* Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-sm text-slate-600 mb-2">{t.covering}</div>
                        <div className="flex flex-wrap items-center gap-1" style={{ fontSize: '10px' }}>
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                                LIBERO: {animatedValues.liberoModels}
                            </span>
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">
                                LIBERO Plus: {animatedValues.liberoPlusModels}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1" style={{ fontSize: '10px' }}>
                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium">
                                Meta-World: {animatedValues.metaworldModels}
                            </span>
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                CALVIN: {animatedValues.calvinModels}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1" style={{ fontSize: '10px' }}>
                            <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                                RoboChallenge: {animatedValues.robochallengeModels}
                            </span>
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded-full font-medium">
                                RoboCasa-GR1: {animatedValues.robocasaModels}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Current Leaders - SFT */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                        🏆 {t.currentLeadersSft}
                    </h3>
                    <div className="grid md:grid-cols-6 gap-4">
                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">LIBERO Plus</div>
                            <div className="font-bold text-lg truncate">{stats.topLiberoPlusSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topLiberoPlusSft.score}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">LIBERO</div>
                            <div className="font-bold text-lg truncate">{stats.topLiberoSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topLiberoSft.score}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">Meta-World</div>
                            <div className="font-bold text-lg truncate">{stats.topMetaworldSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topMetaworldSft.score}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">CALVIN (ABC→D)</div>
                            <div className="font-bold text-lg truncate">{stats.topCalvinSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topCalvinSft.score.toFixed(2)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">RoboChallenge</div>
                            <div className="font-bold text-lg truncate">{stats.topRobochallengeSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topRobochallengeSft.score}</div>
                        </div>
                        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">RoboCasa-GR1-Tabletop</div>
                            <div className="font-bold text-lg truncate">{stats.topRobocasaSft.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topRobocasaSft.score}%</div>
                        </div>
                    </div>
                </div>

                {/* Current Leaders - RL */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                        🚀 {t.currentLeadersRl}
                    </h3>
                    <div className="grid md:grid-cols-6 gap-4">
                        <div className="bg-gradient-to-br from-orange-400 to-orange-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">LIBERO Plus</div>
                            <div className="font-bold text-lg truncate">{stats.topLiberoPlusRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topLiberoPlusRl.score > 0 ? `${stats.topLiberoPlusRl.score}%` : '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-400 to-blue-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">LIBERO</div>
                            <div className="font-bold text-lg truncate">{stats.topLiberoRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topLiberoRl.score > 0 ? `${stats.topLiberoRl.score}%` : '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-400 to-purple-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">Meta-World</div>
                            <div className="font-bold text-lg truncate">{stats.topMetaworldRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topMetaworldRl.score > 0 ? `${stats.topMetaworldRl.score}%` : '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-400 to-emerald-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">CALVIN (ABC→D)</div>
                            <div className="font-bold text-lg truncate">{stats.topCalvinRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topCalvinRl.score > 0 ? stats.topCalvinRl.score.toFixed(2) : '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-teal-400 to-teal-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">RoboChallenge</div>
                            <div className="font-bold text-lg truncate">{stats.topRobochallengeRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topRobochallengeRl.score > 0 ? stats.topRobochallengeRl.score : '-'}</div>
                        </div>
                        <div className="bg-gradient-to-br from-rose-400 to-rose-500 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">RoboCasa-GR1-Tabletop</div>
                            <div className="font-bold text-lg truncate">{stats.topRobocasaRl.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topRobocasaRl.score > 0 ? `${stats.topRobocasaRl.score}%` : '-'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
