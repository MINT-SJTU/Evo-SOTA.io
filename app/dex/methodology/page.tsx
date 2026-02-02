import { loadDexLeaderboardData } from "@/lib/dex/leaderboard";

export default function MethodologyPage() {
  const data = loadDexLeaderboardData();

  const texts = {
    title: "Methodology",
    subtitle: "Data Collection, Ranking Rules & Model Classification",
    dataSource: "Data Sources",
    dataSourceDesc:
      "All benchmark results are collected from published papers and official repositories. We do not re-run experiments.",
    rankingRules: "Ranking Rules",
    rankingRulesDesc:
      "Models are ranked by their primary metric on each benchmark. For Adroit, DexArt, and Bi-DexHands, this is the Mean Success Rate.",
    limitations: "Known Limitations",
    limitationsDesc:
      "Results across different benchmarks are not directly comparable. Different papers may use slightly different evaluation protocols.",
    disclaimer: "Disclaimer",
    disclaimerDesc:
      "Cross-benchmark comparisons should be avoided. Each benchmark has its own evaluation protocol and metrics.",
    modelClassification: "Model Classification",
    modelClassificationDesc: "We classify models into two categories based on their open-source status:",
    standardOpensource: "Open-Source Models",
    standardOpensourceDesc:
      "Models with publicly available code, marked with an \"Open Source\" badge. These models provide the highest level of reproducibility and transparency.",
    standardClosed: "Other Models",
    standardClosedDesc:
      "Models without the \"Open Source\" badge include: (1) models whose code repository we could not find, and (2) models that were in \"Coming Soon\" status before the data collection deadline. These models are hidden by default but can be shown using the \"Include All Models\" toggle.",
    dataNotice: "Data Notice",
    dataNoticeDesc1: "Data notice last updated: Feb 2, 2026.",
    dataNoticeDesc2:
      "If you find any errors or omissions, please let us know by creating an issue on GitHub or contacting us via email: business@evomind-tech.com",
    starUs: "Support This Project",
    starUsDesc:
      "If you find this leaderboard helpful for your research, please consider giving us a star on GitHub!",
    contactUs: "Contact Us",
    contactUsDesc: "Found errors or want to submit your model? Reach out via GitHub Issue or email!",
    contactEmail: "business@evomind-tech.com"
  };

  const sections = [
    {
      title: texts.dataSource,
      description: texts.dataSourceDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )
    },
    {
      title: texts.rankingRules,
      description: texts.rankingRulesDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      )
    },
    {
      title: texts.limitations,
      description: texts.limitationsDesc,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      )
    }
  ];

  const modelCategories = [
    {
      title: texts.standardOpensource,
      description: texts.standardOpensourceDesc,
      color: "green",
      icon: "✅",
      badge: "Default"
    },
    {
      title: texts.standardClosed,
      description: texts.standardClosedDesc,
      color: "gray",
      icon: "",
      badge: "Optional"
    }
  ];

  const colorMap = {
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-100 text-green-800",
      title: "text-green-800"
    },
    gray: {
      bg: "bg-gray-50",
      border: "border-gray-200",
      badge: "bg-gray-100 text-gray-800",
      title: "text-gray-800"
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800",
      title: "text-amber-800"
    }
  };

  return (
    <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">{texts.title}</h1>
          <p className="text-lg text-slate-600">{texts.subtitle}</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">{section.title}</h2>
                  <p className="text-slate-600 leading-relaxed">{section.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{texts.modelClassification}</h2>
          <p className="text-slate-600 mb-6">{texts.modelClassificationDesc}</p>
          <div className="space-y-4">
            {modelCategories.map((category, index) => {
              const colors = colorMap[category.color as keyof typeof colorMap];
              return (
                <div key={index} className={`${colors.bg} border ${colors.border} rounded-xl p-6`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className={`text-lg font-semibold ${colors.title}`}>{category.title}</h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors.badge}`}>
                      {category.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-3 ml-10">{category.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">{texts.dataNotice}</h3>
              <ul className="text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {texts.dataNoticeDesc1}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {texts.dataNoticeDesc2}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-1">{texts.disclaimer}</h3>
              <p className="text-amber-700">{texts.disclaimerDesc}</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Supported Benchmarks</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.benchmarks.map((benchmark) => (
              <a
                key={benchmark.id}
                href={benchmark.links[0]?.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-slate-800">{benchmark.name}</h3>
                <p className="text-sm text-slate-600 mt-1">Mean Success Rate (%)</p>
                <p className="text-xs text-slate-500 mt-2">{benchmark.description}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">⭐ {texts.starUs}</h3>
              <p className="text-slate-300 text-sm">{texts.starUsDesc}</p>
            </div>
            <a
              href="https://github.com/Elvin-yk/Dexterous-Manipulation-on-SOTA-leaderboard"
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

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{texts.contactUs}</h2>
          <p className="text-blue-100 mb-6">{texts.contactUsDesc}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/Elvin-yk/Dexterous-Manipulation-on-SOTA-leaderboard/issues"
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
              href={`mailto:${texts.contactEmail}`}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {texts.contactEmail}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
