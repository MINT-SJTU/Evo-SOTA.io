import fs from "fs";
import path from "path";
import { LeaderboardData } from "@/types/dex/leaderboard";

const fallbackData: LeaderboardData = {
  generatedAt: new Date().toISOString(),
  benchmarks: [],
  methods: [],
  updates: []
};

export const loadDexLeaderboardData = (): LeaderboardData => {
  try {
    const filePath = path.resolve(process.cwd(), "public/dex/data/leaderboard.json");
    if (!fs.existsSync(filePath)) return fallbackData;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as LeaderboardData;
  } catch (err) {
    return fallbackData;
  }
};
