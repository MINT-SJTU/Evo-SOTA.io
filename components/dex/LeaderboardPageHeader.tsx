'use client';

import { useLanguage } from "@/lib/LanguageContext";

export default function LeaderboardPageHeader() {
  const { t } = useLanguage();

  return (
    <section className="max-w-6xl mx-auto px-6 pt-16">
      <h1 className="text-3xl font-display font-semibold">{t.dex.leaderboard.title}</h1>
      <p className="text-muted mt-2">
        {t.dex.leaderboard.subtitle}
      </p>
    </section>
  );
}
