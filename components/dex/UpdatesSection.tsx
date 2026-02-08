"use client";

import { LeaderboardData } from "@/types/dex/leaderboard";
import { useLanguage } from "@/lib/LanguageContext";

export default function UpdatesSection({ updates }: { updates: LeaderboardData["updates"] }) {
  const { t } = useLanguage();
  const messageDate = updates[0]?.date || "2026.02";

  return (
    <div className="bg-amber-50 border-y border-amber-200 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-4">
          <span className="text-sm font-bold text-amber-800 whitespace-nowrap flex items-center gap-1 pt-0.5">
            📢 {t.dex.home.latestUpdates}
          </span>
          <div className="text-amber-900 text-sm">
            <span className="font-medium text-amber-700">{messageDate}</span>{" "}
            <span>{t.dex.home.launchMessage}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
