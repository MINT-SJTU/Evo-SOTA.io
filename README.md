# VLA SOTA Leaderboard

[![Deploy to GitHub Pages](https://github.com/MINT-SJTU/Evo-SOTA.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/MINT-SJTU/Evo-SOTA.io/actions/workflows/deploy.yml)

A comprehensive leaderboard tracking the state-of-the-art (SOTA) performance of Vision-Language-Action (VLA) models across multiple robotics benchmarks.

🌐 **Live Demo**: [https://sota.evomind-tech.com](https://sota.evomind-tech.com)

## 📊 Supported Benchmarks

| Benchmark         | Description                                                                                       | Primary Metric                |
| ----------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| **LIBERO**        | Lifelong robot learning with 130 language-conditioned manipulation tasks                          | Average Success Rate (%)      |
| **LIBERO Plus**   | Extended LIBERO with 6 robustness categories (camera, robot, language, light, background, layout) | Average Success Rate (%)      |
| **Meta-World**    | Multi-task learning with 50 distinct robotic manipulation tasks                                   | Average Success Rate (%)      |
| **CALVIN**        | Long-horizon language-conditioned tasks (ABC→D, ABCD→D, D→D settings)                             | Average Completed Tasks (0-5) |
| **RoboChallenge** | Real-world robotic manipulation benchmark with diverse household tasks                            | Score                         |

## ✨ Features

- 📈 **Interactive Leaderboards** - Sortable tables with expandable details for each model
- 📉 **Progress Visualization** - Scatter plot showing VLA development over time
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
│   ├── page.tsx           # Homepage
│   ├── methodology/       # Methodology page
│   └── benchmarks/        # Benchmark leaderboard pages
│       ├── libero/
│       ├── liberoplus/
│       ├── calvin/
│       ├── metaworld/
│       └── robochallenge/
├── components/            # React components
├── data/                  # JSON data files & processing scripts
│   ├── libero.json
│   ├── liberoPlus.json
│   ├── calvin.json
│   ├── metaworld.json
│   ├── robochallenge.json
│   └── DataProcess.py     # CSV to JSON converter
├── lib/                   # Utilities & i18n
└── public/               # Static assets
```

## 📧 Contact

Found errors or want to submit your model? Reach out to us:
- **GitHub Issues**: [Create an issue](https://github.com/MINT-SJTU/Evo-SOTA.io/issues)
- **Email**: business@evomind-tech.com

## 🤝 Contributing

Contributions are welcome! If you'd like to:

- **Add a new model**: Please provide the paper link and benchmark scores
- **Report an error**: Open an issue with details
- **Suggest improvements**: PRs are appreciated

## ⚠️ Disclaimer

- All benchmark results are collected from original papers or reproduced by third parties
- Results may vary due to different evaluation protocols, random seeds, or implementation details
- This leaderboard is for research reference only and does not represent official rankingsDev
- Please verify results with original papers before citation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to all researchers who contributed to the VLA field
- Benchmark creators: LIBERO, LIBERO Plus, CALVIN, Meta-World, RoboChallenge teams
- [https://github.com/EvanNotFound/vercount](https://github.com/EvanNotFound/vercount) for visitor statistics

---

**Note**: This is a community-maintained project. For official benchmark results, please refer to the original papers and repositories.