import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const workbookPath = path.resolve("assets/dex/raw/Dexterous Manipulation SOTA Leaderboard.xlsx");
const outputPath = path.resolve("public/dex/data/leaderboard.json");
const colorMapPath = path.resolve("public/dex/data/benchmark-colors.json");
const modelsSearchPath = path.resolve("public/dex/data/models_search.json");

if (!fs.existsSync(workbookPath)) {
    console.warn(`⚠️  Excel file not found: ${workbookPath}`);
    console.log("ℹ️  Skipping dex data build - using existing JSON files.");
    console.log("✅ This is expected for CI/CD deployments.");
    process.exit(0);
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
    const value = normalizeCellValue(cell.v);
    return {
        value,
        link: cell.l?.Target || extractUrl(value)
    };
};

const extractUrl = (value) => {
    if (!value) return undefined;
    const httpMatch = value.match(/https?:\/\/[^\s)]+/i);
    if (httpMatch) return httpMatch[0].replace(/[.,;]+$/, "");
    const arxivMatch = value.match(/arxiv\s*:\s*(\d{4}\.\d+(?:v\d+)?)/i);
    if (arxivMatch) return `https://arxiv.org/abs/${arxivMatch[1]}`;
    return undefined;
};

const labelFromUrl = (url) => {
    if (!url) return "Link";
    if (url.includes("arxiv")) return "Paper";
    if (url.toLowerCase().startsWith("https://github.com/") || url.toLowerCase().startsWith("http://github.com/")) return "Code";
    if (url.includes("google.com/drive")) return "Assets";
    return "Website";
};

const normalizeSource = (value) => {
    if (!value) return null;
    if (/^origin$/i.test(value)) return "Original";
    const reportedBy = /^by\s+(.+)$/i.exec(value);
    if (reportedBy) return `Reported by ${reportedBy[1]}`;
    return value;
};

const getTimeValue = (addr) => {
    const cell = sheet[addr];
    if (!cell) return "";
    if (typeof cell.v === "number" && cell.v > 30000) {
        const parsed = XLSX.SSF.parse_date_code(cell.v);
        if (parsed) return `${parsed.y}.${String(parsed.m).padStart(2, "0")}`;
    }
    const value = normalizeCellValue(cell.v) || "";
    const match = /^(\d{4})\.(\d{1,2})$/.exec(value);
    return match ? `${match[1]}.${match[2].padStart(2, "0")}` : value;
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
        bidexhands: ["V2", "AH2"],
        dexgraspnet: ["AT2", "AX2"],
        dexgraspanything: ["BA2", "BC2"],
        dexonomy: ["BF2", "BJ2"]
    };

    const out = {
        adroit: [],
        dexart: [],
        bidexhands: [],
        dexgraspnet: [],
        dexgraspanything: [],
        dexonomy: []
    };
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
    },
    {
        id: "dexgraspnet",
        name: "DexGraspNet",
        description: "A large-scale dexterous grasping benchmark for evaluating stable and diverse grasps on general objects.",
        meanColumnId: "graspSuccessRate",
        columns: [
            { id: "graspSuccessRate", label: "Suc.1 (GSR)", col: "AT", kind: "score" },
            { id: "penetration", label: "Pen.", col: "AU", kind: "score" },
            { id: "diversity", label: "Div.", col: "AV", kind: "score" },
            { id: "successAtSix", label: "Suc.6", col: "AW", kind: "score" },
            { id: "setting", label: "Setting", col: "AX", kind: "meta" },
            { id: "source", label: "Source", col: "AY", kind: "meta" },
            { id: "proof", label: "Proof", col: "AZ", kind: "meta" }
        ]
    },
    {
        id: "dexgraspanything",
        name: "DexGrasp Anything",
        description: "A physics-aware benchmark for universal dexterous grasp generation across diverse objects.",
        meanColumnId: "graspSuccessRateAvg",
        columns: [
            { id: "graspSuccessRateAvg", label: "GSR. (avg)", col: "BA", kind: "score" },
            { id: "penetrationAvg", label: "Pen. (avg)", col: "BB", kind: "score" },
            { id: "setting", label: "Setting", col: "BC", kind: "meta" },
            { id: "source", label: "Source", col: "BD", kind: "meta" },
            { id: "proof", label: "Proof", col: "BE", kind: "meta" }
        ]
    },
    {
        id: "dexonomy",
        name: "Dexonomy",
        description: "A grasp-taxonomy benchmark evaluating the quality and coverage of diverse dexterous grasp types.",
        meanColumnId: "graspSuccessRate",
        columns: [
            { id: "graspSuccessRate", label: "GSR", col: "BF", kind: "score" },
            { id: "objectSuccessRate", label: "OSR", col: "BG", kind: "score" },
            { id: "categoryDiversityCoverage", label: "CDC", col: "BH", kind: "score" },
            { id: "penetrationDepth", label: "PD", col: "BI", kind: "score" },
            { id: "diversity", label: "Div.", col: "BJ", kind: "score" },
            { id: "setting", label: "Setting", col: "BK", kind: "meta" },
            { id: "source", label: "Source", col: "BL", kind: "meta" },
            { id: "proof", label: "Proof", col: "BM", kind: "meta" }
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
    const time = getTimeValue(`C${row}`);
    const paperCell = getCell(`D${row}`);
    const projectCell = getCell(`E${row}`);

    const benchmarksData = {};
    benchmarks.forEach((benchmark) => {
        const values = {};
        benchmark.columns.forEach((column) => {
            const cell = getCell(`${column.col}${row}`);
            values[column.id] = column.id === "source" ? normalizeSource(cell.value) : cell.value;
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

const updates = [
    {
        date: "2026-07-14",
        text: "🚀 Major update: New Leaderboards: DexGrasp Anything and Dexonomy leaderboards added, with available results for existing models included. New models: Add ACT, KODex, KOROL, K-UBM, KAN-We-Flow, and X-DP3 to Adroit and DexArt; Add MP1 and AdaFlow to Adroit; Add the Dexonomy model to Dexonomy; Add KPGrasp to DexGrasp Anything and Dexonomy. Results on the existing leaderboards for previously tracked models are unchanged."
    },
    {
        date: "2026-05-24",
        text: "Added the DexGraspNet leaderboard and updated the associated model results. You can now search Dex manipulation models by name."
    },
    {
        date: "2026-02-09",
        text: "Launched the Dexterous Manipulation SOTA Leaderboard."
    }
];

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

const searchModels = methods.map((method) => ({
    id: method.id,
    name: method.shortName,
    title: method.title,
    time: method.time,
    paper: method.paper,
    project: method.project,
    isOpenSource: method.isOpenSource,
    benchmarks: benchmarks.reduce((results, benchmark) => {
        const score = parseScore(method.benchmarks?.[benchmark.id]?.values?.[benchmark.meanColumnId]);
        if (score === null) return results;
        results[benchmark.id] = {
            name: benchmark.name,
            score,
            rank: method.ranks[benchmark.id],
            source: method.benchmarks[benchmark.id].source || null
        };
        return results;
    }, {})
}));

fs.writeFileSync(modelsSearchPath, JSON.stringify(searchModels, null, 2));

console.log(`Wrote ${methods.length} methods to ${outputPath}`);
