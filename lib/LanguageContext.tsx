'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, defaultLocale, translations, getTranslation } from './i18n';

type DeepStringify<T> = T extends string ? string : {
    [K in keyof T]: DeepStringify<T[K]>;
};

type TranslationType = DeepStringify<typeof translations.en>;

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
