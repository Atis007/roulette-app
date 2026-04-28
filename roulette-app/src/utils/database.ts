import { Asset } from "expo-asset";
import {
  copyAsync,
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
} from "expo-file-system/legacy";
import * as SQLite from "expo-sqlite";
import type { Language } from "../data/translations";

export interface QuestionCache {
  truth: string[];
  dare: string[];
  general: string[];
}

const DB_ASSETS: Record<Language, number> = {
  en: require("../data/questions.db"),
  hu: require("../data/questions_hu.db"),
};

const DB_NAMES: Record<Language, string> = {
  en: "questions.db",
  hu: "questions_hu.db",
};

const RATING_MAP: Record<string, string> = { "PG-13": "PG13" };
const toDbRating = (r: string): string => RATING_MAP[r] ?? r;

const TYPE_MAP: Record<string, string[]> = {
  "TRUTH OR DARE": ["TRUTH", "DARE"],
  "NEVER HAVE I EVER": ["NHIE"],
};

async function ensureDb(language: Language): Promise<void> {
  const dbDir = `${documentDirectory}SQLite/`;
  const dbPath = `${dbDir}${DB_NAMES[language]}`;

  const info = await getInfoAsync(dbPath);
  if (info.exists) return;

  await makeDirectoryAsync(dbDir, { intermediates: true });
  const asset = Asset.fromModule(DB_ASSETS[language]);
  await asset.downloadAsync();
  if (!asset.localUri)
    throw new Error(`Failed to resolve asset for ${language} DB`);
  await copyAsync({ from: asset.localUri, to: dbPath });
}

export async function loadQuestionsFromDb(
  gameType: string,
  rating: string,
  language: Language,
): Promise<QuestionCache> {
  await ensureDb(language);

  const db = await SQLite.openDatabaseAsync(DB_NAMES[language]);
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

  await db.closeAsync();
  return cache;
}
