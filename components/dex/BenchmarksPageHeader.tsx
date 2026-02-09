'use client';

import { useLanguage } from "@/lib/LanguageContext";

export default function BenchmarksPageHeader() {
  const { t } = useLanguage();

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-display font-semibold">{t.dex.benchmarksPage.title}</h1>
      <p className="text-muted mt-2">
        {t.dex.benchmarksPage.subtitle}
      </p>
    </section>
  );
}
