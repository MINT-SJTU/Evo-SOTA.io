'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, translations, getTranslation } from './i18n';

// 使用 translations.en 的结构类型，但允许字符串值变化
type TranslationType = {
    nav: {
        home: string;
        benchmarks: string;
        methodology: string;
        about: string;
    };
    home: {
        title: string;
        subtitle: string;
        description: string;
        viewLeaderboard: string;
        models: string;
        topPerformers: string;
        primaryMetric: string;
        starUs: string;
    };
    benchmark: {
        rank: string;
        model: string;
        score: string;
        date: string;
        paper: string;
        source: string;
        details: string;
        filterByYear: string;
        allYears: string;
        noData: string;
        showDetails: string;
        hideDetails: string;
        showAllMetrics: string;
        hideAllMetrics: string;
        clickToExpand: string;
        original: string;
        reproduced: string;
        libero: {
            spatial: string;
            object: string;
            goal: string;
            long: string;
            libero_90: string;
            average: string;
        };
        calvin: {
            inst1: string;
            inst2: string;
            inst3: string;
            inst4: string;
            inst5: string;
            avg_len: string;
        };
        metaworld: {
            easy: string;
            medium: string;
            hard: string;
            very_hard: string;
            average: string;
        };
    };
    benchmarkDesc: {
        libero: {
            name: string;
            description: string;
            metric: string;
        };
        calvin: {
            name: string;
            description: string;
            metric: string;
            settings: {
                abc_d: string;
                abcd_d: string;
                d_d: string;
            };
        };
        metaworld: {
            name: string;
            description: string;
            metric: string;
        };
    };
    methodology: {
        title: string;
        subtitle: string;
        dataSource: string;
        dataSourceDesc: string;
        rankingRules: string;
        rankingRulesDesc: string;
        limitations: string;
        limitationsDesc: string;
        disclaimer: string;
        disclaimerDesc: string;
    };
    common: {
        loading: string;
        error: string;
        backToHome: string;
        learnMore: string;
        lastUpdated: string;
    };
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // 从 localStorage 读取语言设置
        const savedLocale = localStorage.getItem('locale') as Locale;
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
            setLocaleState(savedLocale);
        }
        setMounted(true);
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = getTranslation(locale);

    // 防止 SSR 水合不匹配
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ locale: defaultLocale, setLocale, t: getTranslation(defaultLocale) }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
