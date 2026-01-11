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
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/logo/EvoMind0.png" />
                <link rel="shortcut icon" href="/logo/EvoMind0.png" />
                <link rel="apple-touch-icon" href="/logo/EvoMind0.png" />
            </head>
            <body className={`${inter.variable} font-sans`}>
                <LanguageProvider>
                    <div className="min-h-screen flex flex-col">
                        <Navbar />
                        <main className="flex-grow">
                            {children}
                        </main>
                        <footer className="bg-slate-800 text-white py-8">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                                    {/* WeChat QR Code */}
                                    <div className="flex flex-col items-center">
                                        <img
                                            src="/QRcode/evomind_wechat.jpg"
                                            alt="WeChat Group QR Code"
                                            className="w-32 h-32 rounded-lg border-2 border-slate-600"
                                        />
                                        <p className="mt-2 text-sm text-slate-300">欢迎加入我们的微信交流群</p>
                                        <p className="text-xs text-slate-400">Join our WeChat Group</p>
                                    </div>

                                    {/* Copyright Info */}
                                    <div className="text-center text-sm text-slate-400">
                                        <p>© 2025 VLA SOTA Leaderboard. Data collected from published papers.</p>
                                        <p className="mt-1">
                                            <a
                                                href="https://github.com/MINT-SJTU/Evo-SOTA.io"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-white transition-colors"
                                            >
                                                EvoMind & MINT-SJTU
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </LanguageProvider>
            </body>
        </html>
    );
}