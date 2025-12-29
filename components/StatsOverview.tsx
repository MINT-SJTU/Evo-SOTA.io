'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';

interface StatsData {
    totalModels: number;
    liberoModels: number;
    calvinModels: number;
    metaworldModels: number;
    latestYear: string;
    topLibero: { name: string; score: number };
    topCalvin: { name: string; score: number };
    topMetaworld: { name: string; score: number };
}

export default function StatsOverview() {
    const { locale } = useLanguage();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [animatedValues, setAnimatedValues] = useState({
        totalModels: 0,
        liberoModels: 0,
        calvinModels: 0,
        metaworldModels: 0,
    });

    useEffect(() => {
        const loadStats = async () => {
            try {
                const basePath = process.env.NODE_ENV === 'production' ? '/Evo-SOTA.io' : '';

                const [liberoRes, calvinRes, metaworldRes] = await Promise.all([
                    fetch(`${basePath}/data/libero.json`),
                    fetch(`${basePath}/data/calvin.json`),
                    fetch(`${basePath}/data/metaworld.json`)
                ]);

                const libero = await liberoRes.json();
                const calvin = await calvinRes.json();
                const metaworld = await metaworldRes.json();

                // 计算统计数据 - 使用标准开源模型数量
                const liberoCount = libero.standard_opensource?.length || 0;
                const calvinCount = calvin.abc_d?.standard_opensource?.length || 0;
                const metaworldCount = metaworld.standard_opensource?.length || 0;

                // 获取第一名
                const topLiberoModel = libero.standard_opensource?.[0];
                const topCalvinModel = calvin.abc_d?.standard_opensource?.[0];
                const topMetaworldModel = metaworld.standard_opensource?.[0];

                const newStats: StatsData = {
                    totalModels: liberoCount + calvinCount + metaworldCount,
                    liberoModels: liberoCount,
                    calvinModels: calvinCount,
                    metaworldModels: metaworldCount,
                    latestYear: '2025',
                    topLibero: { name: topLiberoModel?.name || 'N/A', score: topLiberoModel?.average || 0 },
                    topCalvin: { name: topCalvinModel?.name || 'N/A', score: topCalvinModel?.avg_len || 0 },
                    topMetaworld: { name: topMetaworldModel?.name || 'N/A', score: topMetaworldModel?.average || 0 },
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
                        calvinModels: Math.round(newStats.calvinModels * easeOut),
                        metaworldModels: Math.round(newStats.metaworldModels * easeOut),
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
            currentLeaders: 'Current Leaders',
        },
        zh: {
            totalModels: '追踪模型总数',
            benchmarks: '基准测试',
            covering: '涵盖',
            yearsOfProgress: '年 VLA 发展历程',
            currentLeaders: '当前领先模型',
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
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-primary-600 mb-1">
                            {animatedValues.totalModels}+
                        </div>
                        <div className="text-slate-600 text-sm">{t.totalModels}</div>
                    </div>

                    {/* Benchmarks */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-emerald-600 mb-1">3</div>
                        <div className="text-slate-600 text-sm">{t.benchmarks}</div>
                    </div>

                    {/* Years */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-4xl font-bold text-purple-600 mb-1">3+</div>
                        <div className="text-slate-600 text-sm">{t.yearsOfProgress}</div>
                    </div>

                    {/* Distribution */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="text-sm text-slate-600 mb-2">{t.covering}</div>
                        <div className="flex items-center space-x-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                LIBERO: {animatedValues.liberoModels}
                            </span>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                CALVIN: {animatedValues.calvinModels}
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">
                                Meta-World: {animatedValues.metaworldModels}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Current Leaders */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">
                        🏆 {t.currentLeaders}
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">LIBERO</div>
                            <div className="font-bold text-lg">{stats.topLibero.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topLibero.score}%</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">CALVIN (ABC→D)</div>
                            <div className="font-bold text-lg">{stats.topCalvin.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topCalvin.score.toFixed(2)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="text-xs opacity-80 mb-1">Meta-World</div>
                            <div className="font-bold text-lg">{stats.topMetaworld.name}</div>
                            <div className="text-2xl font-mono mt-1">{stats.topMetaworld.score}%</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
