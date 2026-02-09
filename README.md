# VLA & Dexterous Manipulation SOTA Leaderboard

[![Deploy to GitHub Pages](https://github.com/MINT-SJTU/Evo-SOTA.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/MINT-SJTU/Evo-SOTA.io/actions/workflows/deploy.yml)

A comprehensive leaderboard tracking the state-of-the-art (SOTA) performance of:
- **Vision-Language-Action (VLA) models** across multiple robotics benchmarks
- **Dexterous Manipulation models** across hand manipulation benchmarks

🌐 **Live Demo**: [https://sota.evomind-tech.com](https://sota.evomind-tech.com)

## 📊 Supported Benchmarks

### Vision-Language-Action (VLA) Models

| Benchmark                 | Description                                                                                       | Primary Metric                |
| ------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| **LIBERO**                | Lifelong robot learning with 130 language-conditioned manipulation tasks                          | Average Success Rate (%)      |
| **LIBERO Plus**           | Extended LIBERO with 6 robustness categories (camera, robot, language, light, background, layout) | Average Success Rate (%)      |
| **Meta-World**            | Multi-task learning with 50 distinct robotic manipulation tasks                                   | Average Success Rate (%)      |
| **CALVIN**                | Long-horizon language-conditioned tasks (ABC→D, ABCD→D, D→D settings)                             | Average Completed Tasks (0-5) |
| **RoboChallenge**         | Real-world robotic manipulation benchmark with diverse household tasks                            | Score                         |
| **RoboCasa-GR1-Tabletop** | Household tabletop manipulation tasks in realistic environments using GR1 robot                   | Average Success Rate (%)      |

### Dexterous Manipulation Models

| Benchmark       | Description                                                                        | Primary Metric        |
| --------------- | ---------------------------------------------------------------------------------- | --------------------- |
| **Adroit**      | In-hand manipulation benchmarks featuring the Adroit hand and diverse object tasks | Mean Success Rate (%) |
| **DexArt**      | Articulated object manipulation and tool use tasks with dexterous hands            | Mean Success Rate (%) |
| **Bi-DexHands** | Bimanual dexterous manipulation tasks requiring coordinated two-hand control       | Mean Success Rate (%) |

## ✨ Features

- 📈 **Interactive Leaderboards** - Sortable tables with expandable details for each model
- **Dual Track Coverage** - VLA models and dexterous manipulation models in separate sections
- 📉 **Progress Visualization** - Scatter plots showing development over time for both tracks
- 🔍 **Smart Filtering** - Filter by model type (SFT/RL), benchmark settings, and more
- 🌍 **Bilingual Support** - English and Chinese (中文) interface

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Deployment**: GitHub Pages (Static Export)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/MINT-SJTU/Evo-SOTA.io.git
cd Evo-SOTA.io

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

The static files will be generated in the `out/` directory.

## 📁 Project Structure

```
Evo-SOTA.io/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # VLA Homepage
│   ├── methodology/       # VLA Methodology page
│   ├── benchmarks/        # VLA Benchmark leaderboard pages
│   │   ├── libero/
│   │   ├── liberoplus/
│   │   ├── calvin/
│   │   ├── metaworld/
│   │   ├── robochallenge/
│   │   └── robocasa_gr1_tabletop/
│   └── dex/               # Dexterous Manipulation section
│       ├── page.tsx       # Dex Homepage
│       ├── methodology/   # Dex Methodology page
│       ├── leaderboard/   # Dex unified leaderboard
│       └── benchmarks/    # Dex benchmark detail pages
├── components/            # React components
│   ├── [VLA components]
│   └── dex/              # Dex-specific components
├── data/                  # VLA JSON data files & processing scripts
│   ├── libero.json
│   ├── liberoPlus.json
│   ├── calvin.json
│   ├── metaworld.json
│   ├── robochallenge.json
│   ├── robocasa_gr1_tabletop.json
│   └── DataProcess.py     # CSV to JSON converter
├── lib/                   # Utilities & i18n
│   ├── i18n.ts           # Translations for both VLA and Dex
│   └── dex/              # Dex-specific utilities
├── public/               # Static assets
│   ├── data/             # VLA data files
│   └── dex/              # Dex data and assets
│       └── data/
└── types/                # TypeScript type definitions
```

## 📧 Contact

Found errors or want to submit your model? Reach out to us:
- **GitHub Issues**: [Create an issue](https://github.com/MINT-SJTU/Evo-SOTA.io/issues)
- **Email**: business@evomind-tech.com
- **Wechat group**: Join our Wechat Group

<p align="center">
<img src="public/QRcode/evomind_wechat.jpg" width="250" height="250">
</p>

## 🤝 Contributing

Contributions are welcome! If you'd like to:

- **Add a new VLA model**: Please provide the paper link and benchmark scores
- **Add a new Dexterous Manipulation model**: Please provide the paper link and performance metrics
- **Report an error**: Open an issue with details
- **Suggest improvements**: PRs are appreciated

## ⚠️ Disclaimer

- All benchmark results are collected from original papers or reproduced by third parties
- Results may vary due to different evaluation protocols, random seeds, or implementation details
- This leaderboard is for research reference only and does not represent official rankings
- Please verify results with original papers before citation
- We categorize entries by specific training methodologies (e.g., SFT, RL) to keep comparisons as fair and objective as possible
- For dexterous manipulation benchmarks, we track performance across different hand configurations and task settings


## 👥 Contributors

- **Ye Zewei**: Website development and updates, Data collection
- **Li Yiqin**: Website updates, Data collection
- **Mao Yiran**: Website updates, Data collection 
- **Ye Kai**: Dexterous hand pages development
- **Lin Tao (@EvoMind)**: Project Lead

## 🙏 Acknowledgments

- Thanks to all researchers who contributed to the VLA and dexterous manipulation fields
- VLA Benchmark creators: LIBERO, LIBERO Plus, CALVIN, Meta-World, RoboChallenge, RoboCasa-GR1-Tabletop teams
- Dexterous Manipulation benchmark creators: Adroit, DexArt, Bi-DexHands teams
- [https://github.com/EvanNotFound/vercount](https://github.com/EvanNotFound/vercount) for visitor statistics

---

**Note**: This is a community-maintained project. For official benchmark results, please refer to the original papers and repositories. The leaderboard includes both VLA models for language-conditioned manipulation and dexterous manipulation models for hand-based control tasks.
