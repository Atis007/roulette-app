import { createContext, useContext, useState, useRef, ReactNode } from 'react';
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
}

const GameContext = createContext<GameState | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [rating, setRating]       = useState('');
  const [gameType, setGameType]   = useState('');
  const [players, setPlayers]     = useState<string[]>([]);
  const [language, setLanguage]   = useState<Language>('en');
  const [questionCache, setQuestionCache] = useState<QuestionCache | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Prevent duplicate concurrent loads
  const loadingRef = useRef(false);

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
    setPlayers(players.map((p, i) => (i === index ? trimmed : p)));
  };

  const resetGame = () => {
    setRating('');
    setGameType('');
    setPlayers([]);
    setQuestionCache(null);
    setQuestionsLoading(false);
    loadingRef.current = false;
  };

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguage(lang);
    setQuestionCache(null);
    loadingRef.current = false;
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
      resetGame, setLanguage: handleSetLanguage, loadQuestions,
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
