'use client';

import { useEffect, useState, useCallback } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { useLanguage } from '@/lib/LanguageContext';

interface DataPoint {
    name: string;
    date: number; // timestamp
    dateStr: string;
    score: number;
    benchmark: string;
    paper_url?: string;
}

interface LiberoModel {
    name: string;
    pub_date: string | null;
    average: number | null;
    paper_url?: string | null;
}

interface CalvinModel {
    name: string;
    pub_date: string | null;
    avg_len: number | null;
    paper_url?: string | null;
}

interface MetaworldModel {
    name: string;
    pub_date: string | null;
    average: number | null;
    paper_url?: string | null;
}

// 新的分类数据结构
interface CategorizedData<T> {
    standard_opensource: T[];
    standard_closed: T[];
    non_standard: T[];
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

// 自定义 Tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
                <p className="font-semibold text-slate-800">{data.name}</p>
                <p className="text-sm text-slate-600">{data.dateStr}</p>
                <p className="text-sm">
                    <span className={`font-medium ${data.benchmark === 'LIBERO' ? 'text-blue-600' :
                        data.benchmark === 'CALVIN' ? 'text-emerald-600' :
                            'text-purple-600'
                        }`}>
                        {data.benchmark}
                    </span>
                    : {data.score.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

export default function ProgressChart() {
    const { locale } = useLanguage();
    const [liberoData, setLiberoData] = useState<DataPoint[]>([]);
    const [calvinData, setCalvinData] = useState<DataPoint[]>([]);
    const [metaworldData, setMetaworldData] = useState<DataPoint[]>([]);
    const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(['LIBERO', 'CALVIN', 'Meta-World']);
    const [showTopOnly, setShowTopOnly] = useState(false);

    // 解析日期字符串为时间戳
    const parseDate = useCallback((dateStr: string): number => {
        const [year, month] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, 1).getTime();
    }, []);

    // 格式化日期显示
    const formatDate = useCallback((dateStr: string): string => {
        const [year, month] = dateStr.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    }, []);

    useEffect(() => {
        // 加载数据
        const loadData = async () => {
            try {
                // 使用 basePath
                const basePath = process.env.NODE_ENV === 'production' ? '/Evo-SOTA.io' : '';

                const [liberoRes, calvinRes, metaworldRes] = await Promise.all([
                    fetch(`${basePath}/data/libero.json`),
                    fetch(`${basePath}/data/calvin.json`),
                    fetch(`${basePath}/data/metaworld.json`)
                ]);

                const libero: CategorizedData<LiberoModel> = await liberoRes.json();
                const calvin: CalvinData = await calvinRes.json();
                const metaworld: CategorizedData<MetaworldModel> = await metaworldRes.json();

                // 合并所有分类的数据（standard_opensource, standard_closed, non_standard）
                const allLibero = [
                    ...libero.standard_opensource,
                    ...libero.standard_closed,
                    ...libero.non_standard
                ];

                // 处理 LIBERO 数据
                const liberoPoints: DataPoint[] = allLibero
                    .filter(m => m.average !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.average!,
                        benchmark: 'LIBERO',
                        paper_url: m.paper_url || undefined
                    }));

                // 合并 CALVIN ABC→D 所有分类
                const allCalvinAbcD = [
                    ...calvin.abc_d.standard_opensource,
                    ...calvin.abc_d.standard_closed,
                    ...calvin.abc_d.non_standard
                ];

                // 处理 CALVIN 数据 (使用 ABC→D 设置)
                const calvinPoints: DataPoint[] = allCalvinAbcD
                    .filter(m => m.avg_len !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.avg_len!,
                        benchmark: 'CALVIN',
                        paper_url: m.paper_url || undefined
                    }));

                // 合并所有分类的 Meta-World 数据
                const allMetaworld = [
                    ...metaworld.standard_opensource,
                    ...metaworld.standard_closed,
                    ...metaworld.non_standard
                ];

                // 处理 Meta-World 数据
                const metaworldPoints: DataPoint[] = allMetaworld
                    .filter(m => m.average !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.average!,
                        benchmark: 'Meta-World',
                        paper_url: m.paper_url || undefined
                    }));

                setLiberoData(liberoPoints);
                setCalvinData(calvinPoints);
                setMetaworldData(metaworldPoints);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [parseDate, formatDate]);

    // 获取显示的数据
    const getDisplayData = useCallback((data: DataPoint[]) => {
        if (!showTopOnly) return data;

        // 按时间分组，每个时间点只保留最高分
        const timeGroups = new Map<number, DataPoint>();
        data.forEach(point => {
            const existing = timeGroups.get(point.date);
            if (!existing || point.score > existing.score) {
                timeGroups.set(point.date, point);
            }
        });
        return Array.from(timeGroups.values());
    }, [showTopOnly]);

    // 计算X轴范围
    const allDates = [...liberoData, ...calvinData, ...metaworldData].map(d => d.date);
    const minDate = allDates.length ? Math.min(...allDates) : new Date(2023, 0, 1).getTime();
    const maxDate = allDates.length ? Math.max(...allDates) : new Date(2025, 11, 1).getTime();

    // X轴刻度格式化
    const formatXAxis = (timestamp: number) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth();
        if (month === 0 || month === 6) {
            return `${year}-${(month + 1).toString().padStart(2, '0')}`;
        }
        return '';
    };

    const toggleBenchmark = (benchmark: string) => {
        setSelectedBenchmarks(prev =>
            prev.includes(benchmark)
                ? prev.filter(b => b !== benchmark)
                : [...prev, benchmark]
        );
    };

    const texts = {
        en: {
            title: 'VLA Progress Over Time',
            subtitle: 'Tracking the evolution of Vision-Language-Action models across different benchmarks',
            showTopOnly: 'Show Top Performers Only',
            liberoDesc: 'LIBERO: Success Rate (%)',
            calvinDesc: 'CALVIN: Avg. Completed Tasks',
            metaworldDesc: 'Meta-World: Success Rate (%)',
            note: 'Note: CALVIN uses a different metric scale (0-5 tasks) compared to LIBERO and Meta-World (0-100%)',
        },
        zh: {
            title: 'VLA 发展历程',
            subtitle: '追踪视觉-语言-动作模型在不同基准测试上的演进',
            showTopOnly: '仅显示最佳表现',
            liberoDesc: 'LIBERO: 成功率 (%)',
            calvinDesc: 'CALVIN: 平均完成任务数',
            metaworldDesc: 'Meta-World: 成功率 (%)',
            note: '注：CALVIN 使用不同的指标尺度 (0-5 任务数)，与 LIBERO 和 Meta-World (0-100%) 不同',
        }
    };

    const t = texts[locale];

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        {t.title}
                    </h2>
                    <p className="text-slate-600">
                        {t.subtitle}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => toggleBenchmark('LIBERO')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('LIBERO')
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                                }`}
                        >
                            LIBERO
                        </button>
                        <button
                            onClick={() => toggleBenchmark('CALVIN')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('CALVIN')
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                                }`}
                        >
                            CALVIN
                        </button>
                        <button
                            onClick={() => toggleBenchmark('Meta-World')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('Meta-World')
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
                                }`}
                        >
                            Meta-World
                        </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showTopOnly}
                            onChange={(e) => setShowTopOnly(e.target.checked)}
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-600">{t.showTopOnly}</span>
                    </label>
                </div>

                {/* Charts Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* LIBERO & Meta-World Chart (共享Y轴尺度 0-100) */}
                    {(selectedBenchmarks.includes('LIBERO') || selectedBenchmarks.includes('Meta-World')) && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                {selectedBenchmarks.includes('LIBERO') && t.liberoDesc}
                                {selectedBenchmarks.includes('LIBERO') && selectedBenchmarks.includes('Meta-World') && ' & '}
                                {selectedBenchmarks.includes('Meta-World') && t.metaworldDesc}
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        dataKey="date"
                                        domain={[minDate, maxDate]}
                                        tickFormatter={formatXAxis}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="score"
                                        domain={[0, 100]}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                        label={{
                                            value: 'Success Rate (%)',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#64748b', fontSize: 12 }
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />

                                    {/* 参考线 - 重要里程碑 */}
                                    <ReferenceLine
                                        x={new Date(2024, 0, 1).getTime()}
                                        stroke="#94a3b8"
                                        strokeDasharray="5 5"
                                        label={{ value: '2024', fill: '#94a3b8', fontSize: 10 }}
                                    />
                                    <ReferenceLine
                                        x={new Date(2025, 0, 1).getTime()}
                                        stroke="#94a3b8"
                                        strokeDasharray="5 5"
                                        label={{ value: '2025', fill: '#94a3b8', fontSize: 10 }}
                                    />

                                    {selectedBenchmarks.includes('LIBERO') && (
                                        <Scatter
                                            name="LIBERO"
                                            data={getDisplayData(liberoData)}
                                            fill="#3b82f6"
                                            fillOpacity={0.7}
                                        />
                                    )}
                                    {selectedBenchmarks.includes('Meta-World') && (
                                        <Scatter
                                            name="Meta-World"
                                            data={getDisplayData(metaworldData)}
                                            fill="#a855f7"
                                            fillOpacity={0.7}
                                        />
                                    )}
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* CALVIN Chart (Y轴尺度 0-5) */}
                    {selectedBenchmarks.includes('CALVIN') && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                {t.calvinDesc}
                            </h3>
                            <ResponsiveContainer width="100%" height={350}>
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis
                                        type="number"
                                        dataKey="date"
                                        domain={[minDate, maxDate]}
                                        tickFormatter={formatXAxis}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                    />
                                    <YAxis
                                        type="number"
                                        dataKey="score"
                                        domain={[0, 5]}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        axisLine={{ stroke: '#cbd5e1' }}
                                        label={{
                                            value: 'Avg. Tasks',
                                            angle: -90,
                                            position: 'insideLeft',
                                            style: { fill: '#64748b', fontSize: 12 }
                                        }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />

                                    {/* 参考线 */}
                                    <ReferenceLine
                                        x={new Date(2024, 0, 1).getTime()}
                                        stroke="#94a3b8"
                                        strokeDasharray="5 5"
                                        label={{ value: '2024', fill: '#94a3b8', fontSize: 10 }}
                                    />
                                    <ReferenceLine
                                        x={new Date(2025, 0, 1).getTime()}
                                        stroke="#94a3b8"
                                        strokeDasharray="5 5"
                                        label={{ value: '2025', fill: '#94a3b8', fontSize: 10 }}
                                    />

                                    <Scatter
                                        name="CALVIN (ABC→D)"
                                        data={getDisplayData(calvinData)}
                                        fill="#10b981"
                                        fillOpacity={0.7}
                                    />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Note */}
                <p className="text-sm text-slate-500 text-center mt-6">
                    {t.note}
                </p>
            </div>
        </section>
    );
}
