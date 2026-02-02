'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/lib/LanguageContext';

// 动态导入访客计数器，避免 SSR 问题
const VisitorCounter = dynamic(() => import('./VisitorCounter'), {
    ssr: false,
    loading: () => null,
});

export default function Navbar() {
    const { locale, setLocale, t } = useLanguage();
    const pathname = usePathname();
    const isDex = pathname?.startsWith('/dex');
    const switchHref = isDex ? '/' : '/dex';
    const switchAria = isDex ? 'Go to VLA site' : 'Go to Dex site';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isBenchmarkDropdownOpen, setIsBenchmarkDropdownOpen] = useState(false);

    const toggleLanguage = () => {
        setLocale(locale === 'en' ? 'zh' : 'en');
    };

    const benchmarks = [
        { name: 'LIBERO Plus', href: '/benchmarks/liberoplus' },
        { name: 'LIBERO', href: '/benchmarks/libero' },
        { name: 'Meta-World', href: '/benchmarks/metaworld' },
        { name: 'CALVIN', href: '/benchmarks/calvin' },
        { name: 'RoboChallenge', href: '/benchmarks/robochallenge' },
        { name: 'RoboCasa-GR1-Tabletop', href: '/benchmarks/robocasa_gr1_tabletop' },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/logo/EvoMind1.png"
                                alt="EvoMind Logo"
                                width={108}
                                height={36}
                                className="rounded"
                            />
                            <Image
                                src="/logo/SJTU.png"
                                alt="SJTU Logo"
                                width={36}
                                height={36}
                                className="rounded"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/"
                            className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
                        >
                            {t.nav.home}
                        </Link>

                        {/* Benchmarks Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsBenchmarkDropdownOpen(!isBenchmarkDropdownOpen)}
                                onBlur={() => setTimeout(() => setIsBenchmarkDropdownOpen(false), 150)}
                                className="text-slate-600 hover:text-primary-600 transition-colors font-medium flex items-center space-x-1"
                            >
                                <span>{t.nav.benchmarks}</span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isBenchmarkDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isBenchmarkDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                                    {benchmarks.map((benchmark) => (
                                        <Link
                                            key={benchmark.href}
                                            href={benchmark.href}
                                            className="block px-4 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                        >
                                            {benchmark.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/methodology"
                            className="text-slate-600 hover:text-primary-600 transition-colors font-medium"
                        >
                            {t.nav.methodology}
                        </Link>

                        {/* Visitor Counter */}
                        <VisitorCounter />

                        <Link
                            href={switchHref}
                            aria-label={switchAria}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm font-medium"
                        >
                            <span>Dex / VLA</span>
                        </Link>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-300 hover:border-primary-500 hover:bg-primary-50 transition-colors text-sm font-medium"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span>{locale === 'en' ? '中文' : 'EN'}</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleLanguage}
                            className="mr-2 p-2 rounded-lg hover:bg-slate-100"
                        >
                            <span className="text-sm font-medium">{locale === 'en' ? '中文' : 'EN'}</span>
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-200">
                        <div className="space-y-2">
                            <Link
                                href="/"
                                className="block px-4 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t.nav.home}
                            </Link>
                            <Link
                                href={switchHref}
                                className="block px-4 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Dex / VLA
                            </Link>

                            <div className="px-4 py-2 text-sm font-semibold text-slate-400 uppercase">
                                {t.nav.benchmarks}
                            </div>
                            {benchmarks.map((benchmark) => (
                                <Link
                                    key={benchmark.href}
                                    href={benchmark.href}
                                    className="block px-8 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {benchmark.name}
                                </Link>
                            ))}

                            <Link
                                href="/methodology"
                                className="block px-4 py-2 text-slate-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {t.nav.methodology}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
