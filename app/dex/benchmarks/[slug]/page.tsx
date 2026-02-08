import BenchmarkDetailHeader from "@/components/dex/BenchmarkDetailHeader";
import BenchmarkDetailHint from "@/components/dex/BenchmarkDetailHint";
import LeaderboardTable from "@/components/dex/LeaderboardTable";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";
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
  const modelCount = data.methods.filter((row) => row.benchmarks?.[benchmark.id]?.values?.[benchmark.meanColumnId]).length;

  return (
    <div>
      <div className="min-h-screen bg-slate-50">
        <BenchmarkDetailHeader benchmark={benchmark} modelCount={modelCount} />

        <div className="max-w-7xl mx-auto px-4 py-6">
          <BenchmarkDetailHint />
          <LeaderboardTable benchmark={benchmark} rows={data.methods} />
        </div>
      </div>
    </div>
  );
}
