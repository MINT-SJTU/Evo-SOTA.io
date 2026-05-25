"use client";

import { useLanguage } from "@/lib/LanguageContext";

export default function UpdatesSection() {
    const { t } = useLanguage();

    return (
        <div className="bg-amber-50 border-y border-amber-200 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-start gap-4">
                    <span className="text-sm font-bold text-amber-800 whitespace-nowrap flex items-center gap-1 pt-0.5">
                        📢 {t.dex.home.latestUpdates}
                    </span>
                    <div className="flex flex-col gap-1 text-amber-900 text-sm min-w-0">
                        {t.dex.home.news.map((update) => (
                            <div key={`${update.date}-${update.text}`}>
                                <span className="font-medium text-amber-700">{update.date}</span>{" "}
                                <span>{update.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
