"use client";

import { useMemo, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Benchmark, LeaderboardData } from "@/types/dex/leaderboard";
import { toHsla } from "@/lib/dex/colors";
import { useLanguage } from "@/lib/LanguageContext";

type DataPoint = {
  id: string;
  name: string;
  date: number;
  dateStr: string;
  score: number;
  benchmarkId: Benchmark["id"];
  benchmarkName: string;
  color: string;
  isOpenSource?: boolean;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseScore = (value: string | null | undefined) => {
  if (!value) return null;
  const match = String(value).match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return null;
  return Number(match[0]);
};

const parseYearMonth = (time?: string | null) => {
  if (!time) return null;
  const match = String(time).match(/^(\d{4})\.(\d{1,2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return null;
  const date = new Date(year, monthIndex, 1);
  return {
    timestamp: date.getTime(),
    label: `${monthNames[monthIndex]} ${year}`
  };
};

const CustomTooltip = ({
  active,
  payload
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 max-w-xs">
      <p className="font-semibold text-slate-800">{data.name}</p>
      <p className="text-sm text-slate-600">{data.dateStr}</p>
      <p className="text-sm">
        <span className="font-medium" style={{ color: data.color }}>
          {data.benchmarkName}
        </span>
        : {data.score.toFixed(2)}
      </p>
    </div>
  );
};

export default function ProgressChart({ data }: { data: LeaderboardData }) {
  const { t } = useLanguage();
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(
    data.benchmarks.map((benchmark) => benchmark.id)
  );
  const [showTopOnly, setShowTopOnly] = useState(false);
  const [showOpenSourceOnly, setShowOpenSourceOnly] = useState(false);

  const allPoints = useMemo(() => {
    const points: DataPoint[] = [];
    data.methods.forEach((method) => {
      const timeInfo = parseYearMonth(method.time);
      if (!timeInfo) return;
      data.benchmarks.forEach((benchmark) => {
        const raw = method.benchmarks?.[benchmark.id]?.values?.[benchmark.meanColumnId];
        const score = parseScore(raw);
        if (score === null) return;
        points.push({
          id: `${method.id}-${benchmark.id}`,
          name: method.shortName,
          date: timeInfo.timestamp,
          dateStr: timeInfo.label,
          score,
          benchmarkId: benchmark.id,
          benchmarkName: benchmark.name,
          color: benchmark.color || "#3b82f6",
          isOpenSource: method.isOpenSource
        });
      });
    });
    return points;
  }, [data]);

  const pointsByBenchmark = useMemo(() => {
    const map = new Map<Benchmark["id"], DataPoint[]>();
    allPoints.forEach((point) => {
      const list = map.get(point.benchmarkId);
      if (list) {
        list.push(point);
      } else {
        map.set(point.benchmarkId, [point]);
      }
    });
    return map;
  }, [allPoints]);

  const getDisplayData = (points: DataPoint[]) => {
    let filtered = points;
    if (showOpenSourceOnly) {
      filtered = filtered.filter((point) => point.isOpenSource);
    }
    if (!showTopOnly) return filtered;
    const timeGroups = new Map<number, DataPoint>();
    filtered.forEach((point) => {
      const existing = timeGroups.get(point.date);
      if (!existing || point.score > existing.score) {
        timeGroups.set(point.date, point);
      }
    });
    return Array.from(timeGroups.values());
  };

  const allDates = allPoints.map((point) => point.date);
  const minDate = allDates.length ? Math.min(...allDates) : new Date(2020, 0, 1).getTime();
  const maxDate = allDates.length ? Math.max(...allDates) : new Date(2026, 11, 1).getTime();

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth();
    if (month === 0 || month === 6) {
      return `${year}-${String(month + 1).padStart(2, "0")}`;
    }
    return "";
  };

  const toggleBenchmark = (benchmarkId: string) => {
    setSelectedBenchmarks((prev) =>
      prev.includes(benchmarkId) ? prev.filter((item) => item !== benchmarkId) : [...prev, benchmarkId]
    );
  };

  const activeBenchmarks = data.benchmarks.filter((benchmark) => selectedBenchmarks.includes(benchmark.id));

  const getGridClass = (count: number) => {
    if (count === 1) return "flex justify-center";
    if (count === 2) return "grid grid-cols-1 lg:grid-cols-2 gap-6";
    return "grid grid-cols-1 md:grid-cols-2 gap-6";
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">{t.dex.progressChart.title}</h2>
          <p className="text-slate-600">
            {t.dex.progressChart.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {data.benchmarks.map((benchmark) => {
              const active = selectedBenchmarks.includes(benchmark.id);
              const accent = benchmark.color || "#3b82f6";
              return (
                <button
                  key={benchmark.id}
                  onClick={() => toggleBenchmark(benchmark.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all border"
                  style={
                    active
                      ? { backgroundColor: accent, borderColor: accent, color: "white" }
                      : { backgroundColor: "white", borderColor: toHsla(accent, 0.3), color: accent }
                  }
                >
                  {benchmark.name}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showTopOnly}
              onChange={(event) => setShowTopOnly(event.target.checked)}
              className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            />
            <span className="text-sm text-slate-600">{t.dex.progressChart.showTopOnly}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOpenSourceOnly}
              onChange={(event) => setShowOpenSourceOnly(event.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
            />
            <span className="text-sm text-slate-600">{t.dex.progressChart.openSourceOnly}</span>
          </label>
        </div>

        {(() => {
          const chartCount = activeBenchmarks.length;
          return (
            <div className={getGridClass(chartCount)}>
              {activeBenchmarks.map((benchmark, index) => {
                const points = pointsByBenchmark.get(benchmark.id) || [];
                const dataPoints = getDisplayData(points);
                const isLastInOdd =
                  (chartCount === 3 && index === 2) || (chartCount === 5 && index === 4);
                const chartWrapperClass = isLastInOdd ? "md:col-span-2 flex justify-center" : "";
                const chartStyle = chartCount === 1 ? { width: "66.67%", minWidth: "400px" } : undefined;
                const chartClass = isLastInOdd ? "w-full md:w-1/2" : "w-full";
                const meanLabel =
                  benchmark.columns.find((col) => col.id === benchmark.meanColumnId)?.label || t.dex.progressChart.meanFallback;

                return (
                  <div key={benchmark.id} className={chartWrapperClass} style={chartStyle}>
                    <div className={`bg-white rounded-xl p-6 shadow-sm border border-slate-200 ${chartClass}`}>
                      <h3 className="text-lg font-semibold text-slate-700 mb-4">
                        {benchmark.name}: {meanLabel}
                      </h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            type="number"
                            dataKey="date"
                            domain={[minDate, maxDate]}
                            tickFormatter={formatXAxis}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={{ stroke: "#cbd5e1" }}
                          />
                          <YAxis
                            type="number"
                            dataKey="score"
                            domain={[0, "auto"]}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                            axisLine={{ stroke: "#cbd5e1" }}
                            label={{
                              value: meanLabel,
                              angle: -90,
                              position: "insideLeft",
                              style: { fill: "#64748b", fontSize: 12 }
                            }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <ReferenceLine
                            x={new Date(2024, 0, 1).getTime()}
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            label={{ value: "2024", fill: "#94a3b8", fontSize: 10 }}
                          />
                          <ReferenceLine
                            x={new Date(2025, 0, 1).getTime()}
                            stroke="#94a3b8"
                            strokeDasharray="5 5"
                            label={{ value: "2025", fill: "#94a3b8", fontSize: 10 }}
                          />
                          <Scatter
                            name={benchmark.name}
                            data={dataPoints}
                            fill={benchmark.color || "#3b82f6"}
                            fillOpacity={0.7}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </section>
  );
}
