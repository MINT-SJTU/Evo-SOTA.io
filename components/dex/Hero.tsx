'use client';

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">{t.dex.home.heroHighlight}</span> {t.dex.home.heroSuffix}
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-6">
          {t.dex.home.subtitle}
        </p>
        <p className="text-slate-400 max-w-3xl mx-auto mb-8">
          {t.dex.home.description}
        </p>
        <div className="flex justify-center space-x-4 mb-6">
          <Link
            href="/dex/benchmarks/adroit"
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors"
          >
            {t.dex.home.viewLeaderboard}
          </Link>
          <Link
            href="/dex/methodology"
            className="px-6 py-3 border border-slate-500 hover:border-slate-400 rounded-lg font-medium transition-colors"
          >
            {t.common.learnMore}
          </Link>
        </div>
        <div className="mt-4">
          <a
            href="https://github.com/MINT-SJTU/Evo-SOTA.io"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-sm transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            ⭐ {t.home.starUs}
          </a>
        </div>
      </div>
    </section>
  );
}
