import MethodologyContent from "@/components/dex/MethodologyContent";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";

export default function MethodologyPage() {
  const data = loadDexLeaderboardData();

  return <MethodologyContent benchmarks={data.benchmarks} />;
}
