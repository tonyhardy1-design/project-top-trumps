/**
 * Stage 3 engine validation. Run with: npx tsx scripts/simulate.ts
 * Plays thousands of full games with seeded random stat picks and checks
 * the rules from brief section 6 hold on every single round.
 */
import { getProjectCards } from '../src/data/getProjectCards';
import { COMPARABLE_STATS } from '../src/data/types';
import { cardCount, chooseStat, createGame, resolveRound } from '../src/game/logic';

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const cards = getProjectCards();
const DECK = cards.length;
const ROUND_CAP = 500000;

let violations = 0;
function check(condition: boolean, message: string) {
  if (!condition) {
    violations++;
    if (violations <= 10) console.log(`  VIOLATION: ${message}`);
  }
}

function playGame(seed: number, roundLimit: number | null) {
  const random = mulberry32(seed);
  let state = createGame(cards, { roundLimit, random });
  check(cardCount(state) === DECK, `seed ${seed}: deal lost cards`);
  check(Math.abs(state.piles[0].length - state.piles[1].length) === 1, `seed ${seed}: uneven deal beyond the odd card`);

  let ties = 0;
  while (state.phase !== 'finished' && state.round <= ROUND_CAP) {
    const stat = COMPARABLE_STATS[Math.floor(random() * COMPARABLE_STATS.length)].key;
    const chooserBefore = state.chooser;
    const potBefore = state.pot.length;

    state = chooseStat(state, stat);
    const result = state.lastResult!;
    check(cardCount(state) === DECK, `seed ${seed} round ${state.round}: reveal changed card count`);

    state = resolveRound(state);
    check(cardCount(state) === DECK, `seed ${seed} round ${state.round}: resolve changed card count`);

    if (result.outcome === 'tie') {
      ties++;
      check(state.phase === 'finished' || state.pot.length === potBefore + 2, `seed ${seed}: tie did not grow pot by 2`);
      check(state.chooser === chooserBefore, `seed ${seed}: tie changed the chooser`);
    } else {
      check(state.pot.length === 0, `seed ${seed}: winner did not clear the pot`);
      check(state.chooser === result.outcome, `seed ${seed}: winner is not the next chooser`);
      check(result.potWon === potBefore, `seed ${seed}: potWon mismatch`);
    }
  }

  check(state.phase === 'finished', `seed ${seed}: game did not finish within ${ROUND_CAP} rounds`);
  if (state.phase === 'finished' && roundLimit === null && state.winner !== 'draw') {
    const w = state.winner as 0 | 1;
    check(
      state.piles[w].length + state.pot.length === DECK && state.piles[1 - w].length === 0,
      `seed ${seed}: elimination winner does not hold the full deck`,
    );
  }
  return { rounds: state.round - 1, ties, winner: state.winner };
}

console.log('Project Top Trumps, Stage 3 engine simulation');
console.log('=============================================');
console.log(`Deck: ${DECK} cards, dealt 61 and 60`);

const GAMES = 2000;
const lengths: number[] = [];
let tieTotal = 0;
const winners = { p1: 0, p2: 0, draw: 0 };
for (let seed = 1; seed <= GAMES; seed++) {
  const { rounds, ties, winner } = playGame(seed, null);
  lengths.push(rounds);
  tieTotal += ties;
  if (winner === 0) winners.p1++;
  else if (winner === 1) winners.p2++;
  else winners.draw++;
}
lengths.sort((a, b) => a - b);
console.log(`\nElimination mode, ${GAMES} seeded games with random stat picks:`);
console.log(`  All games finished: ${lengths.length === GAMES ? 'yes' : 'no'}`);
console.log(
  `  Rounds per game: min ${lengths[0]}, median ${lengths[Math.floor(GAMES / 2)]}, max ${lengths[GAMES - 1]}`,
);
console.log(`  Average ties per game: ${(tieTotal / GAMES).toFixed(1)}`);
console.log(`  Winners: player one ${winners.p1}, player two ${winners.p2}, draws ${winners.draw}`);

const LIMITED = 500;
let limitedFinished = 0;
for (let seed = 1; seed <= LIMITED; seed++) {
  const { rounds } = playGame(seed + 100000, 20);
  if (rounds <= 20) limitedFinished++;
}
console.log(`\nRound limit mode, ${LIMITED} games capped at 20 rounds:`);
console.log(`  Games ending within the cap: ${limitedFinished}/${LIMITED}`);

console.log(`\nRule violations across every round of every game: ${violations}`);
console.log(violations === 0 ? '\nStage 3 complete. Engine holds all rules from brief section 6.' : '\nFIX REQUIRED.');
process.exit(violations === 0 ? 0 : 1);
