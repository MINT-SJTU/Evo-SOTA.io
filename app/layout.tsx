import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from '@/components/Navbar';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export const metadata: Metadata = {
    title: 'VLA SOTA Leaderboard',
    description: 'Vision-Language-Action Model Benchmark Rankings - Track state-of-the-art VLA models on LIBERO, CALVIN, and Meta-World benchmarks.',
    keywords: ['VLA', 'Vision-Language-Action', 'Robotics', 'Benchmark', 'Leaderboard', 'LIBERO', 'CALVIN', 'Meta-World'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const basePath = process.env.NODE_ENV === 'production' ? '/Evo-SOTA.io' : '';

    return (
        <html lang="en">
            <head>
                <link rel="icon" href={`${basePath}/logo/EvoMind0.png`} />
                <link rel="shortcut icon" href={`${basePath}/logo/EvoMind0.png`} />
                <link rel="apple-touch-icon" href={`${basePath}/logo/EvoMind0.png`} />
            </head>
            <body className={`${inter.variable} font-sans`}>
                <LanguageProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <footer className="bg-slate-800 text-white py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center text-sm text-slate-400">
                                    <p>© 2025 VLA SOTA Leaderboard. Data collected from published papers. </p>
                                    <p className="mt-1">
                                        <a
                                            href="https://github.com/MINT-SJTU/Evo-SOTA.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-white transition-colors"
                                        >
                                            EvoMind & SJTU
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </footer>
                    </div>
                </LanguageProvider>
            </body>
        </html>
    );
}