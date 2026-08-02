import { useCallback, useState } from 'react';
import type { ComparableStatKey } from '../data/types';
import { getProjectCards } from '../data/getProjectCards';
import { chooseStat, createGame, resolveRound } from './logic';
import type { GameState } from './logic';

/**
 * Thin React wrapper over the pure engine in logic.ts. All rules live in
 * the engine, this hook only holds state and exposes the three actions
 * the UI needs.
 */
export function useGame(roundLimit: number | null = null) {
  const [state, setState] = useState<GameState>(() =>
    createGame(getProjectCards(), { roundLimit }),
  );

  const pick = useCallback((stat: ComparableStatKey) => {
    setState((s) => chooseStat(s, stat));
  }, []);

  const next = useCallback(() => {
    setState((s) => resolveRound(s));
  }, []);

  const newGame = useCallback((limit: number | null = roundLimit) => {
    setState(createGame(getProjectCards(), { roundLimit: limit }));
  }, [roundLimit]);

  return { state, pick, next, newGame };
}
