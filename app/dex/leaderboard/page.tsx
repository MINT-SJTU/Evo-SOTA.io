import LeaderboardTable from "@/components/dex/LeaderboardTable";
import LeaderboardPageHeader from "@/components/dex/LeaderboardPageHeader";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";

export default function LeaderboardPage() {
  const data = loadDexLeaderboardData();

  return (
    <div>
      <LeaderboardPageHeader />
      {data.benchmarks.map((benchmark) => (
        <LeaderboardTable
          key={benchmark.id}
          benchmark={benchmark}
          rows={data.methods}
        />
      ))}
    </div>
  );
}
