// 国际化配置 - 中英文语言支持
export type Locale = 'en' | 'zh';

export const defaultLocale: Locale = 'en';

export const locales: Locale[] = ['en', 'zh'];

// 翻译字典
export const translations = {
    en: {
        // 导航
        nav: {
            home: 'Home',
            benchmarks: 'Benchmarks',
            methodology: 'Methodology',
            about: 'About',
        },
        // 主页
        home: {
            title: 'VLA SOTA Leaderboard',
            subtitle: 'Vision-Language-Action Model Benchmark Rankings',
            description: 'A comprehensive leaderboard tracking state-of-the-art Vision-Language-Action models on major robotics manipulation benchmarks.',
            viewLeaderboard: 'View Leaderboard',
            models: 'Models',
            topPerformers: 'Top Performers',
            primaryMetric: 'Primary Metric',
            starUs: 'Star us on GitHub if you find this useful!',
        },
        // Benchmark 页面
        benchmark: {
            rank: 'Rank',
            model: 'Model',
            score: 'Score',
            date: 'Date',
            paper: 'Paper',
            source: 'Source',
            details: 'Details',
            filterByYear: 'Filter by Year',
            allYears: 'All Years',
            noData: 'No data available',
            showDetails: 'Show Details',
            hideDetails: 'Hide Details',
            showAllMetrics: 'Show All Metrics',
            hideAllMetrics: 'Hide Metrics',
            clickToExpand: 'Click to expand details',
            original: 'Original',
            reproduced: 'Reproduced',
            // LIBERO 指标
            libero: {
                spatial: 'LIBERO-Spatial',
                object: 'LIBERO-Object',
                goal: 'LIBERO-Goal',
                long: 'LIBERO-Long',
                libero_90: 'LIBERO-90',
                average: 'Average',
            },
            // CALVIN 指标
            calvin: {
                inst1: 'Task 1',
                inst2: 'Task 2',
                inst3: 'Task 3',
                inst4: 'Task 4',
                inst5: 'Task 5',
                avg_len: 'Avg. Len.',
            },
            // Meta-World 指标
            metaworld: {
                easy: 'Easy',
                medium: 'Medium',
                hard: 'Hard',
                very_hard: 'Very Hard',
                average: 'Average',
            },
        },
        // Benchmark 描述
        benchmarkDesc: {
            libero: {
                name: 'LIBERO',
                description: 'LIBERO is a benchmark for lifelong robot learning with 130 language-conditioned manipulation tasks across 4 task suites.',
                metric: 'Average Success Rate (%)',
            },
            calvin: {
                name: 'CALVIN',
                description: 'CALVIN is a benchmark for learning long-horizon language-conditioned tasks in a tabletop manipulation environment.',
                metric: 'Average Length (Avg. Len.)',
                settings: {
                    'abc_d': 'ABC→D (Default)',
                    'abcd_d': 'ABCD→D',
                    'd_d': 'D→D',
                },
            },
            metaworld: {
                name: 'Meta-World',
                description: 'Meta-World is a benchmark for meta-reinforcement learning and multi-task learning with 50 distinct robotic manipulation tasks.',
                metric: 'Average Success Rate (%)',
            },
            liberoPlus: {
                name: 'LIBERO Plus',
                description: 'LIBERO Plus is an extended benchmark testing robustness across 7 perturbation dimensions: Camera, Robot, Language, Light, Background, Noise, and Layout.',
                metric: 'Average Success Rate (%)',
            },
        },
        // Methodology 页面
        methodology: {
            title: 'Methodology',
            subtitle: 'Data Collection & Ranking Rules',
            dataSource: 'Data Sources',
            dataSourceDesc: 'All benchmark results are collected from published papers and official repositories. We do not re-run experiments.',
            rankingRules: 'Ranking Rules',
            rankingRulesDesc: 'Models are ranked by their primary metric on each benchmark. For LIBERO and Meta-World, this is the Average Success Rate. For CALVIN, this is the Average Length (Avg. Len.) on the ABC→D setting.',
            limitations: 'Known Limitations',
            limitationsDesc: 'Results across different benchmarks are not directly comparable. Different papers may use slightly different evaluation protocols.',
            disclaimer: 'Disclaimer',
            disclaimerDesc: 'Cross-benchmark comparisons should be avoided. Each benchmark has its own evaluation protocol and metrics.',
        },
        // 通用
        common: {
            loading: 'Loading...',
            error: 'Error',
            backToHome: 'Back to Home',
            learnMore: 'Learn More',
            lastUpdated: 'Last Updated',
        },
    },
    zh: {
        // 导航
        nav: {
            home: '首页',
            benchmarks: '榜单',
            methodology: '方法说明',
            about: '关于',
        },
        // 主页
        home: {
            title: 'VLA SOTA 排行榜',
            subtitle: '视觉-语言-动作模型基准测试排名',
            description: '全面追踪视觉-语言-动作模型在主流机器人操作基准测试上的最新性能表现。',
            viewLeaderboard: '查看排行榜',
            models: '模型',
            topPerformers: '领先模型',
            primaryMetric: '主要指标',
            starUs: '如果觉得有用，请给我们的 GitHub 仓库点个 Star！',
        },
        // Benchmark 页面
        benchmark: {
            rank: '排名',
            model: '模型',
            score: '得分',
            date: '发布日期',
            paper: '论文',
            source: '数据来源',
            details: '详情',
            filterByYear: '按年份筛选',
            allYears: '所有年份',
            noData: '暂无数据',
            showDetails: '展开详情',
            hideDetails: '收起详情',
            showAllMetrics: '展开所有指标',
            hideAllMetrics: '收起指标',
            clickToExpand: '点击展开详情',
            original: '原始数据',
            reproduced: '复现数据',
            // LIBERO 指标
            libero: {
                spatial: 'LIBERO-Spatial',
                object: 'LIBERO-Object',
                goal: 'LIBERO-Goal',
                long: 'LIBERO-Long',
                libero_90: 'LIBERO-90',
                average: '平均值',
            },
            // CALVIN 指标
            calvin: {
                inst1: '任务 1',
                inst2: '任务 2',
                inst3: '任务 3',
                inst4: '任务 4',
                inst5: '任务 5',
                avg_len: '平均长度',
            },
            // Meta-World 指标
            metaworld: {
                easy: '简单',
                medium: '中等',
                hard: '困难',
                very_hard: '非常困难',
                average: '平均值',
            },
        },
        // Benchmark 描述
        benchmarkDesc: {
            libero: {
                name: 'LIBERO',
                description: 'LIBERO 是一个终身机器人学习基准，包含 4 个任务套件共 130 个语言条件操作任务。',
                metric: '平均成功率 (%)',
            },
            calvin: {
                name: 'CALVIN',
                description: 'CALVIN 是一个在桌面操作环境中学习长视野语言条件任务的基准。',
                metric: '平均长度 (Avg. Len.)',
                settings: {
                    'abc_d': 'ABC→D (默认)',
                    'abcd_d': 'ABCD→D',
                    'd_d': 'D→D',
                },
            },
            metaworld: {
                name: 'Meta-World',
                description: 'Meta-World 是一个元强化学习和多任务学习基准，包含 50 个不同的机器人操作任务。',
                metric: '平均成功率 (%)',
            },
            liberoPlus: {
                name: 'LIBERO Plus',
                description: 'LIBERO Plus 是一个扩展基准测试，测试模型在 7 个扰动维度上的鲁棒性：相机、机器人、语言、光照、背景、噪声和布局。',
                metric: '总成功率 (%)',
            },
        },
        // Methodology 页面
        methodology: {
            title: '方法说明',
            subtitle: '数据收集与排名规则',
            dataSource: '数据来源',
            dataSourceDesc: '所有基准测试结果均来自已发表的论文和官方代码库。我们不重新运行实验。',
            rankingRules: '排名规则',
            rankingRulesDesc: '模型根据每个基准测试的主要指标进行排名。对于 LIBERO 和 Meta-World，主要指标是平均成功率。对于 CALVIN，主要指标是 ABC→D 设置下的平均长度 (Avg. Len.)。',
            limitations: '已知局限性',
            limitationsDesc: '不同基准测试的结果不能直接比较。不同论文可能使用略有不同的评估协议。',
            disclaimer: '免责声明',
            disclaimerDesc: '应避免跨基准测试比较。每个基准测试都有自己的评估协议和指标。',
        },
        // 通用
        common: {
            loading: '加载中...',
            error: '错误',
            backToHome: '返回首页',
            learnMore: '了解更多',
            lastUpdated: '最后更新',
        },
    },
} as const;

// 获取翻译的辅助函数
export function getTranslation(locale: Locale) {
    return translations[locale];
}
