import { Benchmark, MethodRow } from "@/types/dex/leaderboard";
import { toHsla } from "@/lib/dex/colors";

const parseScore = (value: string | null | undefined) => {
  if (!value) return null;
  const match = String(value).match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return null;
  return Number(match[0]);
};

const countBenchmarkModels = (benchmark: Benchmark, methods: MethodRow[]) => {
  const meanId = benchmark.meanColumnId;
  return methods.filter((method) => {
    const value = method.benchmarks?.[benchmark.id]?.values?.[meanId];
    return parseScore(value) !== null;
  }).length;
};

const topModel = (benchmark: Benchmark, methods: MethodRow[]) => {
  const meanId = benchmark.meanColumnId;
  const ranked = methods
    .map((method) => {
      const value = method.benchmarks?.[benchmark.id]?.values?.[meanId];
      const score = parseScore(value);
      if (score === null) return null;
      return { name: method.shortName, score };
    })
    .filter((item): item is { name: string; score: number } => item !== null)
    .sort((a, b) => b.score - a.score);
  return ranked[0] || { name: "N/A", score: 0 };
};

export default function StatsOverview({
  benchmarks,
  methods
}: {
  benchmarks: Benchmark[];
  methods: MethodRow[];
}) {
  const benchmarkCounts = benchmarks.map((benchmark) => ({
    id: benchmark.id,
    name: benchmark.name,
    count: countBenchmarkModels(benchmark, methods),
    color: benchmark.color
  }));

  const totalModels = benchmarkCounts.reduce((sum, item) => sum + item.count, 0);

  const years = methods
    .map((method) => method.time?.split(".")[0])
    .filter(Boolean)
    .map((year) => Number(year))
    .filter((year) => !Number.isNaN(year));

  const minYear = years.length ? Math.min(...years) : new Date().getFullYear();
  const maxYear = years.length ? Math.max(...years) : new Date().getFullYear();
  const yearsOfProgress = Math.max(1, maxYear - minYear + 1);

  const leaderCards = benchmarks.map((benchmark) => {
    const leader = topModel(benchmark, methods);
    return {
      name: benchmark.name,
      leader,
      color: benchmark.color
    };
  });

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-primary-600 mb-1">{totalModels}+</div>
            <div className="text-slate-600 text-sm">Total Models Tracked</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-purple-600 mb-1">{benchmarks.length}</div>
            <div className="text-slate-600 text-sm">Benchmarks</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="text-4xl font-bold text-emerald-600 mb-1">{yearsOfProgress}+</div>
            <div className="text-slate-600 text-sm">Years of Progress</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="text-sm text-slate-600 mb-2">Covering</div>
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {benchmarkCounts.map((benchmark) => (
                <span
                  key={benchmark.id}
                  className="px-2 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: toHsla(benchmark.color || "#94a3b8", 0.5),
                    color: benchmark.color || "#334155"
                  }}
                >
                  {benchmark.name}: {benchmark.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">🏆 Current Leaders</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {leaderCards.map((item) => (
              <div
                key={item.name}
                className="text-white rounded-xl p-4 shadow-lg"
                style={{ background: item.color || undefined }}
              >
                <div className="text-xs opacity-80 mb-1">{item.name}</div>
                <div className="font-bold text-lg truncate">{item.leader.name}</div>
                <div className="text-2xl font-mono mt-1">{item.leader.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
