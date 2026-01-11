'use client';

import { useEffect, useState } from 'react';

interface VisitorCounterProps {
    className?: string;
}

// 基础访客数偏移量（之前积累的数据）
const BASE_UV_OFFSET = 357;  // 换用统计工具之前的总访客数
const BASE_PV_OFFSET = 454;  // 换用统计工具之前的总访问量

export default function VisitorCounter({ className = '' }: VisitorCounterProps) {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({ uv: 0, pv: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        // 动态加载统计脚本
        const script = document.createElement('script');
        script.src = '//events.vercount.one/js';
        script.async = true;

        script.onload = () => {
            // 等待数据加载
            const checkInterval = setInterval(() => {
                const uvEl = document.getElementById('busuanzi_value_site_uv');
                const pvEl = document.getElementById('busuanzi_value_site_pv');

                if (uvEl && pvEl) {
                    const uvText = uvEl.textContent || '0';
                    const pvText = pvEl.textContent || '0';

                    if (uvText !== '-' && !isNaN(Number(uvText))) {
                        const rawUv = parseInt(uvText);
                        const rawPv = parseInt(pvText);

                        // 添加偏移量
                        setStats({
                            uv: rawUv + BASE_UV_OFFSET,
                            pv: rawPv + BASE_PV_OFFSET
                        });
                        setLoading(false);
                        clearInterval(checkInterval);
                    }
                }
            }, 500);

            // 10秒后停止检查
            setTimeout(() => {
                clearInterval(checkInterval);
                if (loading) {
                    setLoading(false);
                }
            }, 10000);
        };

        script.onerror = () => {
            console.error('统计脚本加载失败');
            setLoading(false);
        };

        document.body.appendChild(script);

        return () => {
            const existingScript = document.querySelector('script[src*="vercount"]');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, []);

    if (!mounted) {
        return null;
    }

    // 如果加载失败，不显示
    if (!loading && stats.uv === 0 && stats.pv === 0) {
        return null;
    }

    return (
        <div className={`flex items-center gap-3 text-xs ${className}`}>
            {/* 隐藏的原始元素，供统计脚本使用 */}
            <span id="busuanzi_value_site_uv" style={{ display: 'none' }}>-</span>
            <span id="busuanzi_value_site_pv" style={{ display: 'none' }}>-</span>

            {/* 总访客数 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-slate-600 font-medium">
                    {loading ? '-' : stats.uv.toLocaleString()}
                </span>
            </div>
            {/* 总访问量 */}
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-slate-600 font-medium">
                    {loading ? '-' : stats.pv.toLocaleString()}
                </span>
            </div>
        </div>
    );
}
