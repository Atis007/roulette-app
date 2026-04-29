import { Asset } from "expo-asset";
import {
  copyAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";

export interface QuestionCache {
  truth: string[];
  dare: string[];
  general: string[];
}

const DB_ASSET = require("../data/questions.db") as number;
const DB_NAME = "questions.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  await ensureDb();
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

const RATING_MAP: Record<string, string> = { "PG-13": "PG13" };
const toDbRating = (r: string): string => RATING_MAP[r] ?? r;

const TYPE_MAP: Record<string, string[]> = {
  "TRUTH OR DARE": ["TRUTH", "DARE"],
  "NEVER HAVE I EVER": ["NHIE"],
};

async function ensureDb(): Promise<void> {
  const dbDir = `${documentDirectory}SQLite/`;
  const dbPath = `${dbDir}${DB_NAME}`;

  const info = await getInfoAsync(dbPath);
  if (info.exists) return;

  await makeDirectoryAsync(dbDir, { intermediates: true });
  const asset = Asset.fromModule(DB_ASSET);
  await asset.downloadAsync();
  if (!asset.localUri) throw new Error("Failed to resolve questions.db asset");
  await copyAsync({ from: asset.localUri, to: dbPath });
}

export async function loadQuestionsFromDb(
  gameType: string,
  rating: string,
): Promise<QuestionCache> {
  const db = await getDb();
  const dbRating = toDbRating(rating);
  const types = TYPE_MAP[gameType] ?? [];
  const cache: QuestionCache = { truth: [], dare: [], general: [] };

  for (const t of types) {
    const rows = await db.getAllAsync<{ question: string }>(
      "SELECT question FROM questions WHERE type = ? AND rating = ?",
      [t, dbRating],
    );
    const questions = rows.map((r) => r.question);

    if (t === "TRUTH") cache.truth = questions;
    else if (t === "DARE") cache.dare = questions;
    else cache.general = questions;
  }

  return cache;
}
