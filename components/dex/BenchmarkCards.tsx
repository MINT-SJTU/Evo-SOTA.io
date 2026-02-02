import Link from "next/link";
import { Benchmark, MethodRow } from "@/types/dex/leaderboard";
import { toHsla } from "@/lib/dex/colors";

const parseScore = (value: string | null | undefined) => {
  if (!value) return null;
  const match = String(value).match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return null;
  return Number(match[0]);
};

const getTopMethods = (
  benchmark: Benchmark,
  methods: MethodRow[],
  limit = 3
): { method: MethodRow; score: number }[] => {
  const meanId = benchmark.meanColumnId;
  const scored = methods
    .map((method) => {
      const value = method.benchmarks?.[benchmark.id]?.values?.[meanId];
      const score = parseScore(value);
      if (score === null) return null;
      return { method, score };
    })
    .filter((item): item is { method: MethodRow; score: number } => item !== null)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
};

const countModels = (benchmark: Benchmark, methods: MethodRow[]) => {
  const meanId = benchmark.meanColumnId;
  return methods.filter((method) => {
    const value = method.benchmarks?.[benchmark.id]?.values?.[meanId];
    return parseScore(value) !== null;
  }).length;
};

export default function BenchmarkCards({
  benchmarks,
  methods
}: {
  benchmarks: Benchmark[];
  methods: MethodRow[];
}) {
  if (!benchmarks.length) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-display font-semibold mb-4">Benchmarks</h2>
        <p className="text-muted">No benchmarks loaded yet.</p>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8" id="benchmarks">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Benchmarks</h2>

        <div className="flex justify-center gap-5 flex-wrap">
          {benchmarks.map((benchmark) => {
            const top = getTopMethods(benchmark, methods);
            const modelCount = countModels(benchmark, methods);
            const accent = benchmark.color || "#3b82f6";
            const badgeBg = toHsla(accent, 0.2);

            return (
              <div
                key={benchmark.id}
                className="w-80 rounded-xl border-2 overflow-hidden card-hover"
                style={{ borderColor: accent, backgroundColor: toHsla(accent, 0.08) }}
              >
                <div className="p-6 border-b border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold" style={{ color: accent }}>
                      {benchmark.name}
                    </h3>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: badgeBg, color: accent }}
                    >
                      {modelCount} Models
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{benchmark.description}</p>
                  <p className="text-xs text-slate-500 mt-2">Primary Metric: Mean Success Rate (%)</p>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Top Performers</h4>
                  <div className="space-y-2">
                    {top.length ? (
                      top.map((item, rankIdx) => (
                        <div
                          key={item.method.id}
                          className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                rankIdx === 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : rankIdx === 1
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {rankIdx + 1}
                            </span>
                            <span className="font-medium text-slate-800 text-sm">
                              {item.method.shortName}
                            </span>
                          </div>
                          <span className="font-semibold text-sm" style={{ color: accent }}>
                            {item.score}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500">No results yet.</div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    href={`/dex/benchmarks/${benchmark.id}`}
                    className="block w-full text-center py-2 rounded-lg text-white font-medium transition-colors"
                    style={{ backgroundColor: accent }}
                  >
                    View Leaderboard
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
