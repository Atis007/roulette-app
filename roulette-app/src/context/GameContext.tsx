import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Language } from '../data/translations';
import { QuestionCache, loadQuestionsFromDb } from '../utils/database';

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
  editPlayer: (index: number, name: string) => void;
  resetGame: () => void;
  setLanguage: (lang: Language) => void;
  loadQuestions: () => Promise<void>;
  pickQuestion: (type: 'truth' | 'dare' | 'general') => string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type DeckKey = 'truth' | 'dare' | 'general';
const emptyDeck = () => ({ truth: [] as string[], dare: [] as string[], general: [] as string[] });
const emptyPtrs = () => ({ truth: 0, dare: 0, general: 0 });

const GameContext = createContext<GameState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [rating, setRating]       = useState('');
  const [gameType, setGameType]   = useState('');
  const [players, setPlayers]     = useState<string[]>([]);
  const [language, setLanguage]   = useState<Language>('en');
  const [questionCache, setQuestionCache] = useState<QuestionCache | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const loadingRef = useRef(false);
  const deckRef = useRef(emptyDeck());
  const ptrRef = useRef(emptyPtrs());

  useEffect(() => {
    if (!questionCache) return;
    deckRef.current = {
      truth:   shuffle(questionCache.truth),
      dare:    shuffle(questionCache.dare),
      general: shuffle(questionCache.general),
    };
    ptrRef.current = emptyPtrs();
  }, [questionCache]);

  const pickQuestion = useCallback((type: DeckKey): string => {
    const deck = deckRef.current[type];
    if (!deck.length) return '';
    const ptr = ptrRef.current[type];
    const question = deck[ptr];
    const next = ptr + 1;
    if (next >= deck.length) {
      deckRef.current[type] = shuffle([...deck]);
      ptrRef.current[type] = 0;
    } else {
      ptrRef.current[type] = next;
    }
    return question;
  }, []);

  const addPlayer = (name: string) => {
    if (name.trim() && !players.includes(name.trim())) {
      setPlayers([...players, name.trim()]);
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const editPlayer = (index: number, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (players.some((p, i) => i !== index && p === trimmed)) return;
    setPlayers(players.map((p, i) => (i === index ? trimmed : p)));
  };

  const resetGame = () => {
    setRating('');
    setGameType('');
    setPlayers([]);
    setQuestionCache(null);
    setQuestionsLoading(false);
    loadingRef.current = false;
    deckRef.current = emptyDeck();
    ptrRef.current = emptyPtrs();
  };

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
    setQuestionCache(null);
    loadingRef.current = false;
    deckRef.current = emptyDeck();
    ptrRef.current = emptyPtrs();
  };

  const loadQuestions = async () => {
    if (!rating || !gameType || loadingRef.current) return;
    loadingRef.current = true;
    setQuestionsLoading(true);
    try {
      const cache = await loadQuestionsFromDb(gameType, rating, language);
      setQuestionCache(cache);
    } catch (e) {
      console.warn('[DB] Failed to load questions:', e);
    } finally {
      setQuestionsLoading(false);
      loadingRef.current = false;
    }
  };

  return (
    <GameContext.Provider value={{
      rating, gameType, players, language,
      questionCache, questionsLoading,
      setRating, setGameType, addPlayer, removePlayer, editPlayer,
      resetGame, setLanguage: handleSetLanguage, loadQuestions, pickQuestion,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
