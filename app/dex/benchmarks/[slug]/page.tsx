import LeaderboardTable from "@/components/dex/LeaderboardTable";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";
import { shiftHslLightness } from "@/lib/dex/colors";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [
    { slug: "adroit" },
    { slug: "dexart" },
    { slug: "bidexhands" }
  ];
}

export default function BenchmarkDetailPage({ params }: { params: { slug: string } }) {
  const data = loadDexLeaderboardData();
  const benchmark = data.benchmarks.find((item) => item.id === params.slug);
  if (!benchmark) return notFound();

  return (
    <div>
      <div className="min-h-screen bg-slate-50">
        <div
          className="text-white py-12 px-4"
          style={{
            background: `linear-gradient(90deg, ${benchmark.color || "#2563eb"}, ${shiftHslLightness(benchmark.color || "#2563eb", -10)})`
          }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-white/70 text-sm mb-4">
              <Link href="/dex" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span>{benchmark.name}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{benchmark.name} Benchmark Leaderboard</h1>
            <p className="text-white/80 max-w-3xl mb-4">{benchmark.description}</p>
            {benchmark.links.length > 0 && (
              <a
                href={benchmark.links[0].url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
              >
                View Benchmark Repository
              </a>
            )}
            <div className="mt-4 flex items-center gap-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                {data.methods.filter((row) => row.benchmarks?.[benchmark.id]?.values?.[benchmark.meanColumnId]).length} models
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-sm text-slate-500 mb-4 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click row to expand details.
          </div>
          <LeaderboardTable benchmark={benchmark} rows={data.methods} title={`${benchmark.name} Leaderboard`} />
        </div>
      </div>
    </div>
  );
}
