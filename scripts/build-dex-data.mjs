import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const workbookPath = path.resolve("assets/dex/raw/Dexterous Manipulation SOTA Leaderboard.xlsx");
const outputPath = path.resolve("data/dex/leaderboard.json");
const colorMapPath = path.resolve("data/dex/benchmark-colors.json");

if (!fs.existsSync(workbookPath)) {
  console.error(`Missing Excel file: ${workbookPath}`);
  process.exit(1);
}

const workbook = XLSX.readFile(workbookPath, { cellStyles: false, cellHTML: false });
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const normalizeCellValue = (raw) => {
  if (raw === undefined || raw === null) return null;
  const value = String(raw).replace(/\n/g, " ").trim();
  if (!value || value === "-") return null;
  return value;
};

const parseScore = (value) => {
  if (!value) return null;
  const match = String(value).match(/[-+]?[0-9]*\.?[0-9]+/);
  if (!match) return null;
  return Number(match[0]);
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getCell = (addr) => {
  const cell = sheet[addr];
  if (!cell) return { value: null, link: undefined };
  return {
    value: normalizeCellValue(cell.v),
    link: cell.l?.Target
  };
};

const labelFromUrl = (url) => {
  if (!url) return "Link";
  if (url.includes("arxiv")) return "Paper";
  if (url.includes("github")) return "Code";
  if (url.includes("google.com/drive")) return "Assets";
  return "Website";
};

const seedFromString = (value) => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

const mulberry32 = (seed) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const createRandomColor = (rng) => {
  const hue = Math.floor(rng() * 360);
  const saturation = 70;
  const lightness = 55;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const loadColorMap = () => {
  if (!fs.existsSync(colorMapPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(colorMapPath, "utf-8"));
  } catch (err) {
    return {};
  }
};

const saveColorMap = (map) => {
  fs.mkdirSync(path.dirname(colorMapPath), { recursive: true });
  fs.writeFileSync(colorMapPath, JSON.stringify(map, null, 2));
};

const assignBenchmarkColors = (benchmarksList) => {
  const colorMap = loadColorMap();
  const seed = seedFromString("dexterous-benchmark-colors");
  const rng = mulberry32(seed);

  const existingColors = new Set(Object.values(colorMap));
  benchmarksList.forEach((benchmark) => {
    if (colorMap[benchmark.id]) return;
    let color = createRandomColor(rng);
    let safety = 0;
    while (existingColors.has(color) && safety < 1000) {
      color = createRandomColor(rng);
      safety += 1;
    }
    colorMap[benchmark.id] = color;
    existingColors.add(color);
  });

  saveColorMap(colorMap);
  return colorMap;
};

const parseBenchmarkLinks = () => {
  const mapping = {
    adroit: ["F2", "J2"],
    dexart: ["N2", "R2"],
    bidexhands: ["V2", "AH2"]
  };

  const out = { adroit: [], dexart: [], bidexhands: [] };
  Object.entries(mapping).forEach(([key, cells]) => {
    cells.forEach((addr) => {
      const cell = getCell(addr);
      if (cell.link) {
        out[key].push({ label: labelFromUrl(cell.link), url: cell.link });
      }
    });
  });
  return out;
};

const benchmarks = [
  {
    id: "adroit",
    name: "Adroit",
    description: "In-hand manipulation benchmarks featuring the Adroit hand and diverse object tasks.",
    meanColumnId: "meanSucc",
    columns: [
      { id: "meanSucc", label: "Mean Succ", col: "F", kind: "score" },
      { id: "pen", label: "Pen", col: "G", kind: "score" },
      { id: "door", label: "Door", col: "H", kind: "score" },
      { id: "hammer", label: "Hammer", col: "I", kind: "score" },
      { id: "relocate", label: "Relocate", col: "J", kind: "score" },
      { id: "setting", label: "Setting", col: "K", kind: "meta" },
      { id: "source", label: "Source", col: "L", kind: "meta" },
      { id: "proof", label: "Proof", col: "M", kind: "meta" }
    ]
  },
  {
    id: "dexart",
    name: "DexArt",
    description: "DexArt benchmarks emphasize articulated object manipulation and tool use.",
    meanColumnId: "meanSucc",
    columns: [
      { id: "laptop", label: "Laptop", col: "N", kind: "score" },
      { id: "faucet", label: "Faucet", col: "O", kind: "score" },
      { id: "toilet", label: "Toilet", col: "P", kind: "score" },
      { id: "bucket", label: "Bucket", col: "Q", kind: "score" },
      { id: "meanSucc", label: "Mean Succ", col: "R", kind: "score" },
      { id: "setting", label: "Setting", col: "S", kind: "meta" },
      { id: "source", label: "Source", col: "T", kind: "meta" },
      { id: "proof", label: "Proof", col: "U", kind: "meta" }
    ]
  },
  {
    id: "bidexhands",
    name: "Bi-DexHands",
    description: "Bimanual dexterous manipulation tasks from Bi-DexHands.",
    meanColumnId: "meanSucc",
    columns: [
      { id: "handover", label: "HandOver", col: "V", kind: "score" },
      { id: "doorCloseInward", label: "DoorCloseInward", col: "W", kind: "score" },
      { id: "doorCloseOutward", label: "DoorCloseOutward", col: "X", kind: "score" },
      { id: "doorOpenInward", label: "DoorOpenInward", col: "Y", kind: "score" },
      { id: "doorOpenOutward", label: "DoorOpenOutward", col: "Z", kind: "score" },
      { id: "scissors", label: "Scissors", col: "AA", kind: "score" },
      { id: "swingCup", label: "Swing cup", col: "AB", kind: "score" },
      { id: "switch", label: "Switch", col: "AC", kind: "score" },
      { id: "kettle", label: "Kettle", col: "AD", kind: "score" },
      { id: "liftUnderarm", label: "LiftUderarm", col: "AE", kind: "score" },
      { id: "pen", label: "Pen", col: "AF", kind: "score" },
      { id: "bottleCap", label: "BottleCap", col: "AG", kind: "score" },
      { id: "catchAbreast", label: "CatchAbreast", col: "AH", kind: "score" },
      { id: "catchOver2UnderArm", label: "CatchOver2UnderArm", col: "AI", kind: "score" },
      { id: "catchUnderarm", label: "CatchUnderarm", col: "AJ", kind: "score" },
      { id: "reOrientation", label: "ReOrientation", col: "AK", kind: "score" },
      { id: "graspAndPlace", label: "GraspAndPlace", col: "AL", kind: "score" },
      { id: "blockStack", label: "BlockStack", col: "AM", kind: "score" },
      { id: "pushBlock", label: "PushBlock", col: "AN", kind: "score" },
      { id: "twoCatchUnderarm", label: "TwoCatchUnderarm", col: "AO", kind: "score" },
      { id: "meanSucc", label: "Mean Succ", col: "AP", kind: "score" },
      { id: "setting", label: "Setting", col: "AQ", kind: "meta" },
      { id: "source", label: "Source", col: "AR", kind: "meta" },
      { id: "proof", label: "Proof", col: "AS", kind: "meta" }
    ]
  }
];

const benchmarkLinks = parseBenchmarkLinks();
const benchmarkColors = assignBenchmarkColors(benchmarks);

const methods = [];
for (let row = 4; row <= 200; row += 1) {
  const shortNameCell = getCell(`A${row}`);
  if (!shortNameCell.value) continue;

  const title = getCell(`B${row}`).value || "";
  const time = getCell(`C${row}`).value || "";
  const paperCell = getCell(`D${row}`);
  const projectCell = getCell(`E${row}`);

  const benchmarksData = {};
  benchmarks.forEach((benchmark) => {
    const values = {};
    benchmark.columns.forEach((column) => {
      const cell = getCell(`${column.col}${row}`);
      values[column.id] = cell.value;
    });

    benchmarksData[benchmark.id] = {
      values,
      setting: values.setting || null,
      source: values.source || null,
      proof: values.proof || null
    };
  });

  methods.push({
    id: slugify(shortNameCell.value),
    shortName: shortNameCell.value,
    title,
    time,
    paper: paperCell.link
      ? { label: labelFromUrl(paperCell.link), url: paperCell.link }
      : undefined,
    project: projectCell.link
      ? { label: labelFromUrl(projectCell.link), url: projectCell.link }
      : undefined,
    isOpenSource: Boolean(projectCell.link),
    ranks: {},
    benchmarks: benchmarksData
  });
}

const parseTimeScore = (time) => {
  if (!time) return 0;
  const match = /^(\d{4})\.(\d{1,2})/.exec(time);
  if (!match) return 0;
  return parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
};

const updates = [...methods]
  .sort((a, b) => parseTimeScore(b.time) - parseTimeScore(a.time))
  .slice(0, 5)
  .map((entry) => ({
    date: entry.time,
    text: `${entry.shortName}: ${entry.title}`
  }));

const data = {
  generatedAt: new Date().toISOString(),
  benchmarks: benchmarks.map((benchmark) => ({
    ...benchmark,
    color: benchmarkColors[benchmark.id],
    columns: benchmark.columns.map(({ col, ...rest }) => rest),
    links: benchmarkLinks[benchmark.id] || []
  })),
  methods,
  updates
};

const publicBenchmarksPath = path.resolve("public/dex/data/benchmarks.json");

benchmarks.forEach((benchmark) => {
  const scored = methods
    .map((method) => ({
      method,
      score: parseScore(method.benchmarks?.[benchmark.id]?.values?.[benchmark.meanColumnId])
    }))
    .filter((item) => item.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  scored.forEach((item, index) => {
    item.method.ranks[benchmark.id] = index + 1;
  });
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

fs.mkdirSync(path.dirname(publicBenchmarksPath), { recursive: true });
fs.writeFileSync(
  publicBenchmarksPath,
  JSON.stringify(
    data.benchmarks.map((benchmark) => ({
      id: benchmark.id,
      name: benchmark.name,
      href: `/dex/benchmarks/${benchmark.id}`
    })),
    null,
    2
  )
);

console.log(`Wrote ${methods.length} methods to ${outputPath}`);
