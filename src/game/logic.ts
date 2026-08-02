import type { ProjectCard, ComparableStatKey } from '../data/types';
import { COMPARABLE_STATS } from '../data/types';

/**
 * Pure two player Top Trumps engine, brief section 6. No React and no DOM,
 * every function takes a state and returns a new state, so the UI layer
 * (and any future multiplayer or animation work) sits entirely on top.
 *
 * A round moves through two phases so the UI can show both cards before
 * they are collected:
 *   choosing  the chooser picks one of the four comparable stats
 *   revealed  both values are on show, lastResult says who won
 *   finished  one player holds all cards, or the round limit is reached
 */

export type PlayerIndex = 0 | 1;

export type RoundOutcome = PlayerIndex | 'tie';

export type Phase = 'choosing' | 'revealed' | 'finished';

export interface RoundResult {
  stat: ComparableStatKey;
  cards: [ProjectCard, ProjectCard];
  values: [number, number];
  outcome: RoundOutcome;
  /** Cards claimed from the shared pot on top of the two played cards. */
  potWon: number;
}

export interface GameState {
  piles: [ProjectCard[], ProjectCard[]];
  pot: ProjectCard[];
  chooser: PlayerIndex;
  phase: Phase;
  /** 1 based, the round currently being played or just revealed. */
  round: number;
  /** null means play to elimination, the default. */
  roundLimit: number | null;
  lastResult: RoundResult | null;
  winner: PlayerIndex | 'draw' | null;
}

const COMPARABLE_KEYS = new Set<string>(COMPARABLE_STATS.map((s) => s.key));

export function isComparableStat(key: string): key is ComparableStatKey {
  return COMPARABLE_KEYS.has(key);
}

/** Fisher and Yates shuffle, injectable RNG so games can be seeded in tests. */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffle and deal alternately, player one first. With the 121 card deck
 * one player holds 61 and the other 60, an odd deck cannot split evenly.
 */
export function createGame(
  cards: readonly ProjectCard[],
  options: { roundLimit?: number | null; random?: () => number } = {},
): GameState {
  const { roundLimit = null, random = Math.random } = options;
  if (cards.length < 2) {
    throw new Error('A game needs at least two cards');
  }
  const deck = shuffle(cards, random);
  const piles: [ProjectCard[], ProjectCard[]] = [[], []];
  deck.forEach((card, index) => piles[(index % 2) as PlayerIndex].push(card));
  return {
    piles,
    pot: [],
    chooser: 0,
    phase: 'choosing',
    round: 1,
    roundLimit,
    lastResult: null,
    winner: null,
  };
}

/** The card each player would play this round, without removing it. */
export function topCards(state: GameState): [ProjectCard, ProjectCard] {
  return [state.piles[0][0], state.piles[1][0]];
}

/**
 * Chooser picks a stat, both top cards are compared. Winning direction
 * follows the brief, lower wins for cost per m2, higher wins otherwise.
 * Returns the revealed state, cards are not collected until resolveRound.
 */
export function chooseStat(state: GameState, stat: ComparableStatKey): GameState {
  if (state.phase !== 'choosing') {
    throw new Error(`Cannot choose a stat during phase "${state.phase}"`);
  }
  if (!isComparableStat(stat)) {
    throw new Error(`"${stat}" is not a comparable stat`);
  }
  const definition = COMPARABLE_STATS.find((s) => s.key === stat)!;
  const [cardA, cardB] = topCards(state);
  const values: [number, number] = [cardA[stat], cardB[stat]];

  let outcome: RoundOutcome;
  if (values[0] === values[1]) {
    outcome = 'tie';
  } else if (definition.direction === 'higher') {
    outcome = values[0] > values[1] ? 0 : 1;
  } else {
    outcome = values[0] < values[1] ? 0 : 1;
  }

  return {
    ...state,
    phase: 'revealed',
    lastResult: {
      stat,
      cards: [cardA, cardB],
      values,
      outcome,
      potWon: outcome === 'tie' ? 0 : state.pot.length,
    },
  };
}

/**
 * Collects the revealed cards. The winner takes both cards plus any pot to
 * the bottom of their pile and becomes chooser. On a tie both cards join
 * the shared pot and the chooser is unchanged. Then the end conditions
 * are checked, elimination first, then the optional round limit.
 */
export function resolveRound(state: GameState): GameState {
  if (state.phase !== 'revealed' || state.lastResult === null) {
    throw new Error(`Cannot resolve during phase "${state.phase}"`);
  }
  const { outcome } = state.lastResult;
  const [cardA, cardB] = topCards(state);
  const rest: [ProjectCard[], ProjectCard[]] = [state.piles[0].slice(1), state.piles[1].slice(1)];

  let piles: [ProjectCard[], ProjectCard[]];
  let pot: ProjectCard[];
  let chooser = state.chooser;

  if (outcome === 'tie') {
    piles = rest;
    pot = [...state.pot, cardA, cardB];
  } else {
    const winnings = outcome === 0 ? [cardA, cardB] : [cardB, cardA];
    piles = [...rest];
    piles[outcome] = [...rest[outcome], ...winnings, ...state.pot];
    pot = [];
    chooser = outcome;
  }

  const next: GameState = {
    ...state,
    piles,
    pot,
    chooser,
    phase: 'choosing',
    round: state.round + 1,
    lastResult: state.lastResult,
  };

  const empty0 = piles[0].length === 0;
  const empty1 = piles[1].length === 0;
  if (empty0 && empty1) {
    // Only reachable by a tie played from two single card piles, the pot
    // then holds every card and nobody can continue. Declared a draw.
    return { ...next, phase: 'finished', winner: 'draw' };
  }
  if (empty0 || empty1) {
    return { ...next, phase: 'finished', winner: empty0 ? 1 : 0 };
  }
  if (state.roundLimit !== null && state.round >= state.roundLimit) {
    const counts = [piles[0].length, piles[1].length];
    const winner = counts[0] === counts[1] ? 'draw' : counts[0] > counts[1] ? 0 : 1;
    return { ...next, phase: 'finished', winner };
  }
  return next;
}

/** Total cards in play, must equal the deck size at all times. */
export function cardCount(state: GameState): number {
  return state.piles[0].length + state.piles[1].length + state.pot.length;
}
