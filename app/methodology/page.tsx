'use client';

import { useLanguage } from '@/lib/LanguageContext';

export default function MethodologyPage() {
    const { locale } = useLanguage();

    const texts = {
        en: {
            title: 'Methodology',
            subtitle: 'Data Collection, Ranking Rules & Model Classification',
            dataSource: 'Data Sources',
            dataSourceDesc: 'All benchmark results are collected from published papers and official repositories. We do not re-run experiments.',
            rankingRules: 'Ranking Rules',
            rankingRulesDesc: 'Models are ranked by their primary metric on each benchmark. For LIBERO, Meta-World and RoboCasa-GR1-Tabletop, this is the Average Success Rate. For CALVIN, this is the Average Length (Avg. Len.) on the ABC→D setting. For RoboChallenge, this is the Score. For RoboTwin 2.0, this is the Hard Success Rate.',
            limitations: 'Known Limitations',
            limitationsDesc: 'Results across different benchmarks are not directly comparable. Different papers may use slightly different evaluation protocols.',
            disclaimer: 'Disclaimer',
            disclaimerDesc: 'Cross-benchmark comparisons should be avoided. Each benchmark has its own evaluation protocol and metrics.',
            modelClassification: 'Model Classification',
            modelClassificationDesc: 'We classify models into two categories based on their open-source status:',
            standardOpensource: 'Open-Source Models',
            standardOpensourceDesc: 'Models with publicly available code, marked with an "Open Source" badge. These models provide the highest level of reproducibility and transparency.',
            standardClosed: 'Other Models',
            standardClosedDesc: 'Models without the "Open Source" badge include: (1) models whose code repository we could not find, and (2) models that were in "Coming Soon" status before the data collection deadline. These models are hidden by default but can be shown using the "Include All Models" toggle.',
            nonStandard: 'Non-Standard Evaluation Models (Not Displayed)',
            nonStandardDesc: 'Models that did NOT follow the standard evaluation protocol (e.g., different task subsets, modified evaluation settings, or missing metrics) are currently not included in the leaderboard. We may add them in future updates.',
            DataNoticeandDisclaimer: 'Data Notice & Disclaimer',
            starUs: 'Support This Project',
            starUsDesc: 'If you find this leaderboard helpful for your research, please consider giving us a star on GitHub!',
            dataNotice: 'Data Notice',
            dataNoticeDesc2: 'If you find any errors or omissions, please let us know by creating an issue on GitHub, contacting us via email: business@evomind-tech.com or joining our Wechat group!',
            contactUs: 'Contact Us',
            contactUsDesc: 'Found errors or want to submit your model? Reach out via GitHub Issue, email or Wechat group!',
            contactEmail: 'business@evomind-tech.com',
        },
        zh: {
            title: '方法说明',
            subtitle: '数据收集、排名规则与模型分类',
            dataSource: '数据来源',
            dataSourceDesc: '所有基准测试结果均来自已发表的论文和官方代码库。我们不重新运行实验。',
            rankingRules: '排名规则',
            rankingRulesDesc: '模型根据每个基准测试的主要指标进行排名。对于 LIBERO，Meta-World 和 RoboCasa-GR1-Tabletop，主要指标是平均成功率。对于 CALVIN，主要指标是 ABC→D 设置下的平均长度 (Avg. Len.)。对于 RoboChallenge，主要指标是分数 (Score)。对于 RoboTwin 2.0，主要指标是 Hard 成功率。',
            limitations: '已知局限性',
            limitationsDesc: '不同基准测试的结果不能直接比较。不同论文可能使用略有不同的评估协议。',
            disclaimer: '免责声明',
            disclaimerDesc: '应避免跨基准测试比较。每个基准测试都有自己的评估协议和指标。',
            modelClassification: '模型分类',
            modelClassificationDesc: '我们根据模型的开源状态将模型分为两类：',
            standardOpensource: '开源模型',
            standardOpensourceDesc: '代码公开可用的模型，标有"开源"徽章。这些模型提供了最高水平的可复现性和透明度。',
            standardClosed: '其他模型',
            standardClosedDesc: '未标注"开源"徽章的模型包括：(1) 我们未找到代码仓库的模型，以及 (2) 在数据截止日期前处于"Coming Soon"状态的模型。这些模型默认隐藏，但可以通过"显示全部模型"开关显示。',
            nonStandard: '非标准测试模型（暂不显示）',
            nonStandardDesc: '未遵循标准评估协议的模型（例如：不同的任务子集、修改的评估设置或缺失的指标）暂不包含在排行榜中。我们可能在未来的更新中添加它们。',
            DataNoticeandDisclaimer: '数据说明 & 免责声明',
            starUs: '支持本项目',
            starUsDesc: '如果这个排行榜对您的研究有帮助，请考虑在 GitHub 上给我们一个 Star！',
            dataNotice: '数据说明',
            dataNoticeDesc2: '如有错误或遗漏，敬请谅解。您可以在 GitHub 的 Issue 中提出，通过邮件 business@evomind-tech.com 联系我们或加入我们的微信交流群群，我们会及时改进。',
            contactUs: '联系我们',
            contactUsDesc: '发现错误或想提交您的模型？请通过 GitHub Issue，邮件或微信群联系我们！',
            contactEmail: 'business@evomind-tech.com',
        }
    };

    const t = texts[locale];

    const sections = [
        {
            title: t.dataSource,
            description: t.dataSourceDesc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            title: t.rankingRules,
            description: t.rankingRulesDesc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
        },
        {
            title: t.limitations,
            description: t.limitationsDesc,
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
        },
    ];

    const modelCategories = [
        {
            title: t.standardOpensource,
            description: t.standardOpensourceDesc,
            color: 'green',
            icon: '✅',
            badge: locale === 'en' ? 'Default' : '默认显示',
        },
        {
            title: t.standardClosed,
            description: t.standardClosedDesc,
            color: 'gray',
            icon: '',
            badge: locale === 'en' ? 'Optional' : '可选显示',
        },
        // {
        //     title: t.nonStandard,
        //     description: t.nonStandardDesc,
        //     color: 'slate',
        //     icon: '🚫',
        //     badge: locale === 'en' ? 'Not Displayed' : '暂不显示',
        // },
    ];

    const colorMap = {
        green: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            badge: 'bg-green-100 text-green-800',
            title: 'text-green-800',
        },
        gray: {
            bg: 'bg-gray-50',
            border: 'border-gray-200',
            badge: 'bg-gray-100 text-gray-800',
            title: 'text-gray-800',
        },
        slate: {
            bg: 'bg-slate-50',
            border: 'border-slate-200',
            badge: 'bg-slate-100 text-slate-600',
            title: 'text-slate-600',
        },
        amber: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            badge: 'bg-amber-100 text-amber-800',
            title: 'text-amber-800',
        },
    };

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                        {t.title}
                    </h1>
                    <p className="text-lg text-slate-600">
                        {t.subtitle}
                    </p>
                </div>

                {/* Basic Sections */}
                <div className="space-y-8">
                    {sections.map((section, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                                    {section.icon}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800 mb-2">
                                        {section.title}
                                    </h2>
                                    <p className="text-slate-600 leading-relaxed">
                                        {section.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Model Classification Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        {t.modelClassification}
                    </h2>
                    <p className="text-slate-600 mb-6">
                        {t.modelClassificationDesc}
                    </p>
                    <div className="space-y-4">
                        {modelCategories.map((category, index) => {
                            const colors = colorMap[category.color as keyof typeof colorMap];
                            return (
                                <div
                                    key={index}
                                    className={`${colors.bg} border ${colors.border} rounded-xl p-6`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{category.icon}</span>
                                            <h3 className={`text-lg font-semibold ${colors.title}`}>
                                                {category.title}
                                            </h3>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                                            {category.badge}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mt-3 ml-10">
                                        {category.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Data Notice */}
                <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">
                                {t.dataNotice}
                            </h3>
                            <ul className="text-blue-700 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {t.dataNoticeDesc2}
                                    <a
                                        href="https://github.com/MINT-SJTU/Evo-SOTA.io/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 ml-1 text-blue-600 hover:text-blue-800 underline"
                                    >
                                        {/* <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                        </svg> */}
                                    </a>
                                </li>
                                {/* <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span className="flex items-center gap-2">
                                        Email: {t.contactEmail}
                                        <a
                                            href={`mailto:${t.contactEmail}`}
                                            className="text-blue-600 hover:text-blue-800 underline"
                                        >
                                            <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </a>
                                    </span>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-amber-800 mb-1">
                                {t.disclaimer}
                            </h3>
                            <p className="text-amber-700">
                                {t.disclaimerDesc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benchmark Info */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
                        Supported Benchmarks
                    </h2>
                    {/* Row 1: 3 centered items, equal width to row 2's 4-col cards */}
                    <div className="flex justify-center gap-4 mb-4">
                        <a
                            href="https://github.com/Lifelong-Robot-Learning/LIBERO"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[calc(25%_-_12px)] flex-none bg-blue-50 border border-blue-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-blue-800 text-lg">LIBERO</h3>
                            <p className="text-sm text-blue-600 mt-1">Average Success Rate (%)</p>
                            <p className="text-xs text-blue-500 mt-2 flex-grow">130 language-conditioned tasks</p>
                        </a>
                        <a
                            href="https://github.com/Farama-Foundation/Metaworld"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[calc(25%_-_12px)] flex-none bg-purple-50 border border-purple-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-purple-800 text-lg">Meta-World</h3>
                            <p className="text-sm text-purple-600 mt-1">Average Success Rate (%)</p>
                            <p className="text-xs text-purple-500 mt-2 flex-grow">50 robotic manipulation tasks</p>
                        </a>
                        <a
                            href="https://github.com/mees/calvin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-[calc(25%_-_12px)] flex-none bg-emerald-50 border border-emerald-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-emerald-800 text-lg">CALVIN</h3>
                            <p className="text-sm text-emerald-600 mt-1">Average Length (Mainly ABC→D)</p>
                            <p className="text-xs text-emerald-500 mt-2 flex-grow">Long-horizon manipulation</p>
                        </a>
                    </div>
                    {/* Row 2: 4 items */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <a
                            href="https://github.com/robotwin-Platform/RoboTwin"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-amber-50 border border-amber-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-amber-800 text-lg">RoboTwin 2.0</h3>
                            <p className="text-sm text-amber-600 mt-1">Hard Success Rate (%)</p>
                            <p className="text-xs text-amber-500 mt-2 flex-grow">Bimanual manipulation with domain randomization</p>
                        </a>
                        <a
                            href="https://github.com/sylvestf/LIBERO-plus"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-50 border border-orange-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-orange-800 text-lg">LIBERO Plus</h3>
                            <p className="text-sm text-orange-600 mt-1">Average Success Rate (%)</p>
                            <p className="text-xs text-orange-500 mt-2 flex-grow">Extended LIBERO with 6 categories</p>
                        </a>
                        <a
                            href="https://robochallenge.ai/home"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-teal-50 border border-teal-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-teal-800 text-lg">RoboChallenge</h3>
                            <p className="text-sm text-teal-600 mt-1">Score</p>
                            <p className="text-xs text-teal-500 mt-2 flex-grow">Real-world robotic manipulation</p>
                        </a>
                        <a
                            href="https://robocasa.ai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-rose-50 border border-rose-200 rounded-lg p-5 hover:shadow-md transition-shadow flex flex-col"
                        >
                            <h3 className="font-semibold text-rose-800 text-lg">RoboCasa-GR1-Tabletop</h3>
                            <p className="text-sm text-rose-600 mt-1">Average Success Rate (%)</p>
                            <p className="text-xs text-rose-500 mt-2 flex-grow">Tabletop manipulation tasks</p>
                        </a>
                    </div>
                </div>

                {/* Star CTA */}
                <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-1">
                                ⭐ {t.starUs}
                            </h3>
                            <p className="text-slate-300 text-sm">
                                {t.starUsDesc}
                            </p>
                        </div>
                        <a
                            href="https://github.com/MINT-SJTU/Evo-SOTA.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            Star on GitHub
                        </a>
                    </div>
                </div>

                {/* Contact Us Section */}
                <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-4">{t.contactUs}</h2>
                    <p className="text-blue-100 mb-6">{t.contactUsDesc}</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="https://github.com/MINT-SJTU/Evo-SOTA.io/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            GitHub Issue
                        </a>
                        <a
                            href={`mailto:${t.contactEmail}`}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {t.contactEmail}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
