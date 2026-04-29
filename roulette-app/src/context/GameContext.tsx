import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppState } from "react-native";
import type { Language } from "../data/translations";
import { loadQuestionsFromDb, type QuestionCache } from "../utils/database";

interface GameState {
  rating: string;
  gameType: string;
  players: string[];
  language: Language;
  questionCache: QuestionCache | null;
  questionsLoading: boolean;
  setRating: (rating: string) => void;
  setGameType: (type: string) => void;
  addPlayer: (name: string) => void;
  removePlayer: (index: number) => void;
  editPlayer: (index: number, name: string) => boolean;
  setLanguage: (lang: Language) => void;
  loadQuestions: () => Promise<void>;
  pickQuestion: (type: "truth" | "dare" | "general") => string | null;
  clearRound: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DeckKey = "truth" | "dare" | "general";
const emptyDeck = () => ({
  truth: [] as string[],
  dare: [] as string[],
  general: [] as string[],
});
const emptyPtrs = () => ({ truth: 0, dare: 0, general: 0 });

const GameContext = createContext<GameState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [rating, setRatingState] = useState("");
  const [gameType, setGameTypeState] = useState("");
  const [players, setPlayers] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>("en");
  const [questionCache, setQuestionCache] = useState<QuestionCache | null>(
    null,
  );
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const loadingRef = useRef(false);
  const deckRef = useRef(emptyDeck());
  const ptrRef = useRef(emptyPtrs());
  const lastShownRef = useRef<{ truth: string; dare: string; general: string }>(
    { truth: "", dare: "", general: "" },
  );
  const questionCacheRef = useRef<QuestionCache | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const clearDeckState = useCallback(() => {
    setQuestionCache(null);
    setQuestionsLoading(false);
    loadingRef.current = false;
    deckRef.current = emptyDeck();
    ptrRef.current = emptyPtrs();
    lastShownRef.current = { truth: "", dare: "", general: "" };
    questionCacheRef.current = null;
  }, []);

  useEffect(() => {
    if (!questionCache) return;
    deckRef.current = {
      truth: shuffle(questionCache.truth),
      dare: shuffle(questionCache.dare),
      general: shuffle(questionCache.general),
    };
    ptrRef.current = emptyPtrs();
  }, [questionCache]);

  const pickQuestion = useCallback((type: DeckKey): string | null => {
    if (!deckRef.current[type].length) {
      const cache = questionCacheRef.current;
      if (cache?.[type].length) {
        deckRef.current[type] = shuffle([...cache[type]]);
        ptrRef.current[type] = 0;
      } else {
        return null;
      }
    }
    const ptr = ptrRef.current[type];
    const question = deckRef.current[type][ptr];
    const next = ptr + 1;
    if (next >= deckRef.current[type].length) {
      const reshuffled = shuffle([...deckRef.current[type]]);
      if (reshuffled.length > 1 && reshuffled[0] === question) {
        const swapAt = 1 + Math.floor(Math.random() * (reshuffled.length - 1));
        [reshuffled[0], reshuffled[swapAt]] = [
          reshuffled[swapAt],
          reshuffled[0],
        ];
      }
      deckRef.current[type] = reshuffled;
      ptrRef.current[type] = 0;
    } else {
      ptrRef.current[type] = next;
    }
    lastShownRef.current[type] = question;
    return question;
  }, []);

  const setRating = useCallback(
    (next: string) => {
      setRatingState((prev) => {
        if (prev !== next) clearDeckState();
        return next;
      });
    },
    [clearDeckState],
  );

  const setGameType = useCallback(
    (next: string) => {
      setGameTypeState((prev) => {
        if (prev !== next) clearDeckState();
        return next;
      });
    },
    [clearDeckState],
  );

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  const editPlayer = (index: number, name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    let ok = true;
    setPlayers((prev) => {
      if (prev.some((p, i) => i !== index && p === trimmed)) {
        ok = false;
        return prev;
      }
      return prev.map((p, i) => (i === index ? trimmed : p));
    });
    return ok;
  };

  const resetGame = useCallback(() => {
    setRatingState("");
    setGameTypeState("");
    setPlayers([]);
    clearDeckState();
  }, [clearDeckState]);

  const clearRound = useCallback(() => {
    setRatingState("");
    setGameTypeState("");
    clearDeckState();
  }, [clearDeckState]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        appStateRef.current === "active" &&
        (next === "background" || next === "inactive")
      ) {
        resetGame();
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [resetGame]);

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
  };

  const loadQuestions = useCallback(async () => {
    if (!rating || !gameType || loadingRef.current) return;
    loadingRef.current = true;
    setQuestionsLoading(true);
    try {
      const cache = await loadQuestionsFromDb(gameType, rating);
      questionCacheRef.current = cache;
      setQuestionCache(cache);
    } catch (e) {
      console.warn("[DB] Failed to load questions:", e);
    } finally {
      setQuestionsLoading(false);
      loadingRef.current = false;
    }
  }, [rating, gameType]);

  return (
    <GameContext.Provider
      value={{
        rating,
        gameType,
        players,
        language,
        questionCache,
        questionsLoading,
        setRating,
        setGameType,
        addPlayer,
        removePlayer,
        editPlayer,
        setLanguage: handleSetLanguage,
        loadQuestions,
        pickQuestion,
        clearRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
