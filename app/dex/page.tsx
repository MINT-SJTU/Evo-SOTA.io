import BenchmarkCards from "@/components/dex/BenchmarkCards";
import ContactSection from "@/components/dex/ContactSection";
import Hero from "@/components/dex/Hero";
import StatsOverview from "@/components/dex/StatsOverview";
import UpdatesSection from "@/components/dex/UpdatesSection";
import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";
import dynamic from "next/dynamic";

const ProgressChart = dynamic(() => import("@/components/dex/ProgressChart"), { ssr: false });

export default function HomePage() {
  const data = loadDexLeaderboardData();

  return (
    <div>
      <Hero />
      <UpdatesSection updates={data.updates} />
      <StatsOverview benchmarks={data.benchmarks} methods={data.methods} />
      <BenchmarkCards benchmarks={data.benchmarks} methods={data.methods} />
      <ProgressChart data={data} />
      <ContactSection />
    </div>
  );
}
