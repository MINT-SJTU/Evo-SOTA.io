import BenchmarkCards from "@/components/dex/BenchmarkCards";
import BenchmarksPageHeader from "@/components/dex/BenchmarksPageHeader";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";

export default function BenchmarksPage() {
  const data = loadDexLeaderboardData();

  return (
    <div>
      <BenchmarksPageHeader />
      <BenchmarkCards benchmarks={data.benchmarks} methods={data.methods} />
    </div>
  );
}
