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
    is_opensource?: boolean;
}

interface LiberoModel {
    name: string;
    pub_date: string | null;
    average: number | null;
    paper_url?: string | null;
    is_opensource?: boolean;
}

interface CalvinModel {
    name: string;
    pub_date: string | null;
    avg_len: number | null;
    paper_url?: string | null;
    is_opensource?: boolean;
}

interface MetaworldModel {
    name: string;
    pub_date: string | null;
    average: number | null;
    paper_url?: string | null;
    is_opensource?: boolean;
}

interface LiberoPlusModel {
    name: string;
    pub_date: string | null;
    total: number | null;
    paper_url?: string | null;
    is_opensource?: boolean;
}

interface RoboChallengeModel {
    name: string;
    pub_date: string | null;
    score: number | null;
    paper_url?: string | null;
    is_opensource?: boolean;
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

// LIBERO Plus 的分类数据结构
interface LiberoPlusCategorizedData {
    standard_opensource: LiberoPlusModel[];
    standard_opensource_mixsft: LiberoPlusModel[];
    standard_closed: LiberoPlusModel[];
    standard_closed_mixsft: LiberoPlusModel[];
    non_standard: LiberoPlusModel[];
    non_standard_mixsft: LiberoPlusModel[];
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
                        data.benchmark === 'LIBERO Plus' ? 'text-orange-600' :
                            data.benchmark === 'CALVIN' ? 'text-emerald-600' :
                                data.benchmark === 'RoboChallenge' ? 'text-teal-600' :
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
    const [liberoPlusData, setLiberoPlusData] = useState<DataPoint[]>([]);
    const [calvinData, setCalvinData] = useState<DataPoint[]>([]);
    const [metaworldData, setMetaworldData] = useState<DataPoint[]>([]);
    const [robochallengeData, setRobochallengeData] = useState<DataPoint[]>([]);
    const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(['LIBERO', 'LIBERO Plus', 'Meta-World', 'CALVIN', 'RoboChallenge']);
    const [showTopOnly, setShowTopOnly] = useState(false);
    const [showOpenSourceOnly, setShowOpenSourceOnly] = useState(false);

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
                const [liberoRes, liberoPlusRes, calvinRes, metaworldRes, robochallengeRes] = await Promise.all([
                    fetch(`/data/libero.json`),
                    fetch(`/data/liberoPlus.json`),
                    fetch(`/data/calvin.json`),
                    fetch(`/data/metaworld.json`),
                    fetch(`/data/robochallenge.json`)
                ]);

                const libero: CategorizedData<LiberoModel> = await liberoRes.json();
                const liberoPlus: LiberoPlusCategorizedData = await liberoPlusRes.json();
                const calvin: CalvinData = await calvinRes.json();
                const metaworld: CategorizedData<MetaworldModel> = await metaworldRes.json();
                const robochallenge: CategorizedData<RoboChallengeModel> = await robochallengeRes.json();

                // 只使用标准模型数据（standard_opensource + standard_closed）
                const standardLibero = [
                    ...libero.standard_opensource.map(m => ({ ...m, is_opensource: true })),
                    ...libero.standard_closed.map(m => ({ ...m, is_opensource: false }))
                ];

                // 处理 LIBERO 数据
                const liberoPoints: DataPoint[] = standardLibero
                    .filter(m => m.average !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.average!,
                        benchmark: 'LIBERO',
                        paper_url: m.paper_url || undefined,
                        is_opensource: m.is_opensource
                    }));

                // 处理 LIBERO Plus 数据
                const standardLiberoPlus = [
                    ...(liberoPlus.standard_opensource || []).map(m => ({ ...m, is_opensource: true })),
                    ...(liberoPlus.standard_opensource_mixsft || []).map(m => ({ ...m, is_opensource: true })),
                    ...(liberoPlus.standard_closed || []).map(m => ({ ...m, is_opensource: false })),
                    ...(liberoPlus.standard_closed_mixsft || []).map(m => ({ ...m, is_opensource: false }))
                ];
                const liberoPlusPoints: DataPoint[] = standardLiberoPlus
                    .filter(m => m.total !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.total!,
                        benchmark: 'LIBERO Plus',
                        paper_url: m.paper_url || undefined,
                        is_opensource: m.is_opensource
                    }));

                // 只使用 CALVIN ABC→D 标准模型
                const standardCalvinAbcD = [
                    ...calvin.abc_d.standard_opensource.map(m => ({ ...m, is_opensource: true })),
                    ...calvin.abc_d.standard_closed.map(m => ({ ...m, is_opensource: false }))
                ];

                // 处理 CALVIN 数据 (使用 ABC→D 设置)
                const calvinPoints: DataPoint[] = standardCalvinAbcD
                    .filter(m => m.avg_len !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.avg_len!,
                        benchmark: 'CALVIN',
                        paper_url: m.paper_url || undefined,
                        is_opensource: m.is_opensource
                    }));

                // 只使用 Meta-World 标准模型
                const standardMetaworld = [
                    ...metaworld.standard_opensource.map(m => ({ ...m, is_opensource: true })),
                    ...metaworld.standard_closed.map(m => ({ ...m, is_opensource: false }))
                ];

                // 处理 Meta-World 数据
                const metaworldPoints: DataPoint[] = standardMetaworld
                    .filter(m => m.average !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.average!,
                        benchmark: 'Meta-World',
                        paper_url: m.paper_url || undefined,
                        is_opensource: m.is_opensource
                    }));

                // 只使用 RoboChallenge 标准模型
                const standardRobochallenge = [
                    ...(robochallenge.standard_opensource || []).map(m => ({ ...m, is_opensource: true })),
                    ...(robochallenge.standard_closed || []).map(m => ({ ...m, is_opensource: false }))
                ];

                // 处理 RoboChallenge 数据
                const robochallengePoints: DataPoint[] = standardRobochallenge
                    .filter(m => m.score !== null && m.pub_date)
                    .map(m => ({
                        name: m.name,
                        date: parseDate(m.pub_date!),
                        dateStr: formatDate(m.pub_date!),
                        score: m.score!,
                        benchmark: 'RoboChallenge',
                        paper_url: m.paper_url || undefined,
                        is_opensource: m.is_opensource
                    }));

                setLiberoData(liberoPoints);
                setLiberoPlusData(liberoPlusPoints);
                setCalvinData(calvinPoints);
                setMetaworldData(metaworldPoints);
                setRobochallengeData(robochallengePoints);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [parseDate, formatDate]);

    // 获取显示的数据
    const getDisplayData = useCallback((data: DataPoint[]) => {
        let filteredData = data;

        // 筛选开源模型
        if (showOpenSourceOnly) {
            filteredData = filteredData.filter(point => point.is_opensource === true);
        }

        if (!showTopOnly) return filteredData;

        // 按时间分组，每个时间点只保留最高分
        const timeGroups = new Map<number, DataPoint>();
        filteredData.forEach(point => {
            const existing = timeGroups.get(point.date);
            if (!existing || point.score > existing.score) {
                timeGroups.set(point.date, point);
            }
        });
        return Array.from(timeGroups.values());
    }, [showTopOnly, showOpenSourceOnly]);

    // 计算X轴范围
    const allDates = [...liberoData, ...liberoPlusData, ...calvinData, ...metaworldData, ...robochallengeData].map(d => d.date);
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
            showOpenSourceOnly: 'Open-Source Models Only',
            liberoDesc: 'LIBERO: Success Rate (%)',
            liberoPlusDesc: 'LIBERO Plus: Success Rate (%)',
            calvinDesc: 'CALVIN: Avg. Completed Tasks',
            metaworldDesc: 'Meta-World: Success Rate (%)',
            robochallengeDesc: 'RoboChallenge: Score',
            note: 'Note: CALVIN uses a different metric scale (0-5 tasks) compared to LIBERO, LIBERO Plus and Meta-World (0-100%)',
        },
        zh: {
            title: 'VLA 发展历程',
            subtitle: '追踪视觉-语言-动作模型在不同基准测试上的演进',
            showTopOnly: '仅显示最佳表现',
            showOpenSourceOnly: '仅显示开源模型',
            liberoDesc: 'LIBERO: 成功率 (%)',
            liberoPlusDesc: 'LIBERO Plus: 成功率 (%)',
            calvinDesc: 'CALVIN: 平均完成任务数',
            metaworldDesc: 'Meta-World: 成功率 (%)',
            robochallengeDesc: 'RoboChallenge: 分数',
            note: '注：CALVIN 使用不同的指标尺度 (0-5 任务数)，与 LIBERO、LIBERO Plus 和 Meta-World (0-100%) 不同',
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
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => toggleBenchmark('LIBERO Plus')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('LIBERO Plus')
                                ? 'bg-orange-600 text-white shadow-md'
                                : 'bg-white text-orange-600 border border-orange-200 hover:bg-orange-50'
                                }`}
                        >
                            LIBERO Plus
                        </button>
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
                            onClick={() => toggleBenchmark('Meta-World')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('Meta-World')
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
                                }`}
                        >
                            Meta-World
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
                            onClick={() => toggleBenchmark('RoboChallenge')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedBenchmarks.includes('RoboChallenge')
                                ? 'bg-teal-600 text-white shadow-md'
                                : 'bg-white text-teal-600 border border-teal-200 hover:bg-teal-50'
                                }`}
                        >
                            RoboChallenge
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
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showOpenSourceOnly}
                            onChange={(e) => setShowOpenSourceOnly(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-600">{t.showOpenSourceOnly}</span>
                    </label>
                </div>

                {/* Charts Grid - 支持1-5张图的动态布局 */}
                {(() => {
                    const activeCharts = [];
                    if (selectedBenchmarks.includes('LIBERO Plus')) activeCharts.push('LIBERO Plus');
                    if (selectedBenchmarks.includes('LIBERO')) activeCharts.push('LIBERO');
                    if (selectedBenchmarks.includes('Meta-World')) activeCharts.push('Meta-World');
                    if (selectedBenchmarks.includes('CALVIN')) activeCharts.push('CALVIN');
                    if (selectedBenchmarks.includes('RoboChallenge')) activeCharts.push('RoboChallenge');
                    const chartCount = activeCharts.length;

                    // 根据图表数量决定布局
                    // 1张图：居中，占2/3宽度
                    // 2张图：并排居中，各占约1/2宽度
                    // 3张图：品字形（上2下1居中）
                    // 4张图：田字形 2x2
                    // 5张图：2+2+1，最后一张居中
                    const getGridClass = () => {
                        if (chartCount === 1) return 'flex justify-center';
                        if (chartCount === 2) return 'grid grid-cols-1 lg:grid-cols-2 gap-6';
                        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
                    };

                    const renderChart = (benchmark: string, index: number) => {
                        // 对于3张图的情况，第3张图需要居中显示
                        // 对于5张图的情况，第5张图需要居中显示
                        const isLastInOdd = (chartCount === 3 && index === 2) || (chartCount === 5 && index === 4);
                        const chartWrapperClass = isLastInOdd
                            ? 'md:col-span-2 flex justify-center'
                            : '';
                        // 根据图表数量设置宽度
                        // 1张图：占页面2/3宽度（使用内联style）
                        // 2-4张图：grid自动处理
                        const chartStyle = chartCount === 1
                            ? { width: '66.67%', minWidth: '400px' }
                            : undefined;
                        const chartClass = isLastInOdd
                            ? 'w-full md:w-1/2'
                            : 'w-full';

                        if (benchmark === 'LIBERO') {
                            return (
                                <div key="libero" className={chartWrapperClass} style={chartStyle}>
                                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                            {t.liberoDesc}
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
                                                    name="LIBERO"
                                                    data={getDisplayData(liberoData)}
                                                    fill="#3b82f6"
                                                    fillOpacity={0.7}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        if (benchmark === 'LIBERO Plus') {
                            return (
                                <div key="liberoplus" className={chartWrapperClass} style={chartStyle}>
                                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                            {t.liberoPlusDesc}
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
                                                    name="LIBERO Plus"
                                                    data={getDisplayData(liberoPlusData)}
                                                    fill="#f97316"
                                                    fillOpacity={0.7}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        if (benchmark === 'Meta-World') {
                            return (
                                <div key="metaworld" className={chartWrapperClass} style={chartStyle}>
                                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                            {t.metaworldDesc}
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
                                                    name="Meta-World"
                                                    data={getDisplayData(metaworldData)}
                                                    fill="#a855f7"
                                                    fillOpacity={0.7}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        if (benchmark === 'CALVIN') {
                            return (
                                <div key="calvin" className={chartWrapperClass} style={chartStyle}>
                                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
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
                                </div>
                            );
                        }
                        if (benchmark === 'RoboChallenge') {
                            return (
                                <div key="robochallenge" className={chartWrapperClass} style={chartStyle}>
                                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4">
                                            {t.robochallengeDesc}
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
                                                    domain={[0, 'auto']}
                                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                                    axisLine={{ stroke: '#cbd5e1' }}
                                                    label={{
                                                        value: 'Score',
                                                        angle: -90,
                                                        position: 'insideLeft',
                                                        style: { fill: '#64748b', fontSize: 12 }
                                                    }}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
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
                                                    name="RoboChallenge"
                                                    data={getDisplayData(robochallengeData)}
                                                    fill="#14b8a6"
                                                    fillOpacity={0.7}
                                                />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    };

                    return (
                        <div className={getGridClass()}>
                            {activeCharts.map((benchmark, index) => renderChart(benchmark, index))}
                        </div>
                    );
                })()}

                {/* Note */}
                <p className="text-sm text-slate-500 text-center mt-6">
                    {t.note}
                </p>
            </div>
        </section>
    );
}
