## Dex 页面修改方案草稿

> 当前阶段只做代码阅读与方案记录，不直接修改业务代码。

本轮新增榜单：
- `DexGraspNet`。`UniDexGrasp`、`DexGRAB` 本轮不作为独立榜单上线。

已录入新榜单的模型包括：
- `DDG`、`GraspTTA`、`UniDexGrasp`、`SceneDiffuser`、`UGG`
- `DexGrasp Anything`、`EFF-Grasp`、`FFHNet`、`DexDiffuser`
- `SECOND-Grasp`、`UniGraspTransformer`、`DemoGrasp`

已确认：
- 新榜单 URL slug 可以使用小写，例如 `dexgraspnet`；网站展示名保留正式大小写，例如 `DexGraspNet`。
- Dex 搜索暂时只覆盖 Dex 模型，不和 VLA 搜索合并。
- 搜索结果中保留 `source` 字段。
- `setting` 本轮不新增展示，保留在数据中即可。
- Latest Updates 需要同步更新，优先通过脚本从数据里自动生成；如自动生成的文案不够可控，再保留手写覆盖方案。
- 本轮使用提供的 XLSX 作为 Dex 源数据，不迁移到 CSV。

### 1. 当前 Dex 数据流确认

Dex 页面的数据入口是 `public/dex/data/leaderboard.json`，由 `lib/dex/leaderboard.ts` 在服务端读取，然后传给 Dex 首页、总榜页、benchmark 详情页、统计卡片和进展图。

当前 Dex 不是按 VLA 的 `data/DataProcess.py -> public/data/*.json` 路线生成，而是有一条独立生成链路：

1. 源表路径：`assets/dex/raw/Dexterous Manipulation SOTA Leaderboard.xlsx`
2. 生成脚本：`scripts/build-dex-data.mjs`
3. 输出：
   - `public/dex/data/leaderboard.json`
   - `public/dex/data/benchmarks.json`
   - `public/dex/data/benchmark-colors.json`
4. 触发方式：
   - `npm run build:dex-data`
   - `npm run build` 前会通过 `prebuild` 自动执行

重要现状：仓库里当前没有 `assets/dex/raw/Dexterous Manipulation SOTA Leaderboard.xlsx`。因此脚本会跳过构建并继续使用已有 JSON。这说明现在网页能跑，是因为 `public/dex/data/leaderboard.json` 已经提交到了仓库；但如果要稳定新增数据，最好补齐或重建 Dex 的源表工作流，而不是长期手改生成后的 JSON。

提供的文件应放到现有脚本期望的位置：

```text
F:\E-AI\Sota Web\Evo-SOTA.io\assets\dex\raw\Dexterous Manipulation SOTA Leaderboard.xlsx
```

### 2. 当前 Dex 数据结构

`leaderboard.json` 顶层结构：

```ts
{
  generatedAt: string;
  benchmarks: Benchmark[];
  methods: MethodRow[];
  updates: { date: string; text: string }[];
}
```

当前已有三个 benchmark：

1. `adroit`
2. `dexart`
3. `bidexhands`

每个模型在 `methods` 中是一行，包含：

1. `id`
2. `shortName`
3. `title`
4. `time`
5. `paper`
6. `project`
7. `isOpenSource`
8. `ranks`
9. `benchmarks`

每个 benchmark 的成绩保存在：

```ts
method.benchmarks[benchmarkId].values[columnId]
```

排名由脚本按各 benchmark 的 `meanColumnId` 分数降序生成。

### 3. 提供的 XLSX 核验结果

已读取 `F:\E-AI\Sota Web\Dexterous Manipulation SOTA Leaderboard.xlsx`：

1. 文件包含一个工作表 `Sheet1`，使用区域为 `A1:AZ33`。
2. 原有 `Adroit`、`DexArt`、`Bi-DexHands` 保持在已有列范围内；新 `DexGraspNet` 区块位于 `AT:AZ`。
3. 新榜单的列映射如下：

| Excel 列 | 表头 | 代码字段建议 | 用途 |
| --- | --- | --- | --- |
| `AT` | `Suc.1(GSR)` | `graspSuccessRate` | 主排序指标 |
| `AU` | `Pen.` | `penetration` | 子指标 |
| `AV` | `Div.` | `diversity` | 子指标 |
| `AW` | `Suc.6` | `successAtSix` | 子指标 |
| `AX` | `Setting` | `setting` | 保留数据，默认不展示 |
| `AY` | `Source` | `source` | 保留并可在详情展示 |
| `AZ` | `Proof` | `proof` | 保留数据，默认不展示 |

4. `DexGraspNet` 的项目页与论文页已经写入表格，新增模型也已包含可用的论文或项目链接；缺少项目页的模型可以只提供论文链接。

结论：该 XLSX 的布局适合作为本轮源数据，但当前脚本不能直接生成新榜单，因为它尚未读取 `AT:AZ`。另外，表内 URL 可读取为单元格文本；实施时脚本应同时支持 Excel 超链接和 URL 文本，避免链接未被导出。

### 4. 新增 DexGraspNet 榜单需要改的位置

新增 benchmark id 使用 `dexgraspnet`，展示名使用 `DexGraspNet`。

需要覆盖这些地方：

1. `scripts/build-dex-data.mjs`
   - 在 `benchmarks` 数组中新增 `DexGraspNet` 的 `AT:AZ` 列定义。
   - 使用 `AT` 的 `Suc.1(GSR)` 作为主排序分数。
   - 在 `parseBenchmarkLinks()` 中新增 benchmark 链接单元格映射。
   - URL 读取同时支持超链接元数据和文本 URL。
   - 新增 Dex 搜索索引输出，并继续自动生成 Latest Updates。

2. `types/dex/leaderboard.ts`
   - 当前 `Benchmark.id` 是联合类型：`"adroit" | "dexart" | "bidexhands"`。
   - 需要加上 `"dexgraspnet"`，否则 TypeScript 不认新榜单。

3. `app/dex/benchmarks/[slug]/page.tsx`
   - `generateStaticParams()` 当前写死三个 slug。
   - 需要加上 `{ slug: "dexgraspnet" }`，或者重构为从数据动态生成。

4. `lib/i18n.ts`
   - `t.dex.benchmarkDescriptions` 里加 `DexGraspNet` 的中英文描述。
   - 如果新增 Dex 搜索页，还需要加搜索页相关文案。

5. `public/dex/data/benchmark-colors.json`
   - 脚本会为新 benchmark 自动补颜色。
   - 如果希望颜色稳定且符合 UI，可手动指定。

6. `public/dex/data/leaderboard.json` 和 `public/dex/data/benchmarks.json`
   - 正常应由脚本生成，不建议手写。

### 5. Dex 搜索功能方案

VLA 现有搜索分为两层：

1. 首页搜索框：`components/SearchBar.tsx`
2. 搜索结果页：`app/models/page.tsx`
3. 搜索索引：`public/data/models_search.json`

Dex 可以借鉴这个结构，但不建议直接复用 VLA 的 `models_search.json`，因为 Dex 的数据结构不同，而且搜索结果页跳转目标应是 `/dex/...`。

推荐新增：

1. `public/dex/data/models_search.json`
   - 从 Dex 的 `leaderboard.json` 生成。
   - 每个模型包含 `name`、`title`、`time`、`paper`、`project`、`isOpenSource`、参与过的 benchmark 与成绩。
   - 搜索索引只包含 Dex 模型，不与 VLA 的 `public/data/models_search.json` 合并。

2. `components/dex/SearchBar.tsx`
   - 参考 `components/SearchBar.tsx` 的模糊搜索、键盘选择、下拉建议。
   - 跳转到 `/dex/models?q=...`。

3. `app/dex/models/page.tsx`
   - 参考 `app/models/page.tsx`，但展示 Dex benchmark 的成绩。
   - 搜索结果卡片内显示各 benchmark 的 best score、rank、source。
   - `setting` 本轮不展示。

4. `components/dex/Hero.tsx`
   - 在 Dex 首页 hero CTA 下方加入搜索框。

5. `components/Navbar.tsx`
   - 当前 Models 链接只在 VLA 显示：`!isDex && <Link href="/models">...`
   - 需要改为 Dex 模式下显示 `/dex/models`，VLA 模式下显示 `/models`。

### 6. Dex 页面排版调整建议

新增到 4 个 benchmark 后，当前 Dex UI 基本可用，但有几处需要主动调整：

1. `components/dex/BenchmarkCards.tsx`
   - 目前用 `flex justify-center gap-5 flex-wrap` 和固定 `w-80`。
   - 4 个榜单时建议改成响应式 grid：`grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`，使卡片对齐。

2. `components/dex/StatsOverview.tsx`
   - 当前 leader card 是 `grid md:grid-cols-3`。
   - 新增第 4 个榜单后应改为 `md:grid-cols-2 xl:grid-cols-4` 或根据 benchmark 数量动态布局。

3. `components/dex/ProgressChart.tsx`
   - 目前图表布局对 1、2、3、5 个 benchmark 做了特殊处理。
   - 4 个榜单时会走普通 `grid-cols-1 md:grid-cols-2`，布局基本可用。

4. `components/dex/LeaderboardTable.tsx`
   - 新榜单如果子指标很多，表格横向滚动已有 `overflow-x-auto`。
   - DexGraspNet 只有三个附加数值指标，现有展开详情布局可以承载。

### 7. Dex 数据添加方式建议

推荐数据维护方式：继续使用“人工整理表格 -> 脚本生成 JSON -> 页面读取 JSON”的工作流，与 VLA 保持一致。

本轮已提供扩展后的 XLSX，因此采用现有 Excel 工作流，不再增加 CSV 转换工作。

需要做：

1. 把源表放到 `assets/dex/raw/Dexterous Manipulation SOTA Leaderboard.xlsx`。
2. 扩展 `scripts/build-dex-data.mjs` 读取 `AT:AZ` 并输出新榜单、搜索索引和自动更新消息。
3. 保留 XLSX 作为可维护源数据，将生成后的 JSON 随代码一并提交。
4. 执行 `npm run build:dex-data` 生成 JSON。

日期说明：`Time` 用于 Latest Updates 和时间排序。建议把 Excel 中的时间保存为文本 `YYYY.MM`，例如 `2026.05` 或 `2024.10`，不要保存为普通数值。数值 `2024.10` 可能被 Excel 记为 `2024.1`，脚本就无法区分“一月”和“十月”。你提供的表格中已有少数旧行存在此类风险，实施阶段可一并规范化。

### 7.1 `source` / `proof` / `setting` 字段处理

当前 Dex 脚本为每个 benchmark 都保留了三个 meta 字段：

1. `source`
   - 表示这个分数来自哪里。
   - 例如 `Origin` 表示原论文/原项目报告；`Reproduced by DP3` 表示由其他论文复现并报告。
   - 这个字段建议保留，能帮助区分原始结果和二次复现结果。

2. `proof`
   - 表示证据链接或证据备注。
   - 当前数据里基本是空的。如果后续你有截图、表格页、论文表号、补充材料链接，可以放这里。
   - 本轮不新增页面展示，只作为数据字段保留。

3. `setting`
   - 表示实验设置。
   - 例如 demonstration 数量、训练数据规模、任务设置、是否 `100 demos`、`10 demos` 等。
   - 本轮不新增页面展示，只保留在 JSON 中。

### 8. 剩余待确认问题

在开始改代码前，需要确认：

1. `Source` 中目前有 `Origin`、`by DexGraspNet`、`by EFF-Grasp`、`by DexDiffuser`、`by SECOND-Grasp`。这些是否按表格原文展示，还是统一成例如 `Original` / `Reported by EFF-Grasp` 的文案？
2. 是否同意实施时把 `Time` 列规范为文本 `YYYY.MM`，并修复历史行中可能由数值格式造成的十月日期歧义？
3. DexGraspNet 的中英文说明文案是否由我根据项目页和论文起草，还是你会提供指定表述？

回答：
1. 文案统一化；
2. 同意规范为文本并修复历史行；
3. 你来起草；根据需要添加文案，不过需要尽可能贴合原论文表述。且原有榜单的文案尽可能不要修改。

### 9. 建议实施顺序

1. 你将已提供的 XLSX 放入脚本期望目录，并确认上面的三个剩余问题。
2. 扩展 `scripts/build-dex-data.mjs`，从 XLSX 读取 DexGraspNet、生成 Dex 搜索索引和 Latest Updates。
3. 补强 URL 与日期读取逻辑，避免文本链接或 `YYYY.10` 日期被丢失或误读。
4. 调整 TypeScript 类型与 benchmark 静态路由。
5. 新增 Dex 搜索框和 `/dex/models` 搜索结果页。
6. 调整 Dex 首页卡片、统计 leader card 的 4 榜单布局。
7. 跑 `npm run build:dex-data`、`npm run build` 验证。
