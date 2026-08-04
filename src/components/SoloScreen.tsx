import { useEffect, useState } from 'react';
import { useGame } from '../game/useGame';
import { COMPARABLE_STATS } from '../data/types';
import Card from './Card';
import ShuffleOverlay from './ShuffleOverlay';
import StaceLogo from './StaceLogo';

/**
 * Single player versus the computer. The human is player 0 and always
 * picks the category, every round, regardless of who won the last one.
 * The engine's chooser rotation (winner picks next) is a two player rule
 * that doesn't fit a solo game against a computer with no strategy of its
 * own, so it is ignored here, chooseStat only compares the two top cards
 * and doesn't care who is nominally "the chooser".
 */
const HUMAN = 0;
const CPU = 1;

/** Fixed game length for the staff event, most cards after six rounds wins. */
export const GAME_ROUNDS = 6;

const CONFETTI_COLOURS = ['#FAA329', '#0D7D8A', '#DE471A', '#821457'];

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-40" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            width: 6 + ((i * 13) % 8),
            height: (6 + ((i * 13) % 8)) * 1.6,
            backgroundColor: CONFETTI_COLOURS[i % CONFETTI_COLOURS.length],
            borderRadius: i % 3 === 0 ? '9999px' : '2px',
            animationDelay: `${((i * 53) % 140) / 100}s`,
            animationDuration: `${2.4 + ((i * 29) % 100) / 60}s`,
          }}
        />
      ))}
    </div>
  );
}

interface SoloScreenProps {
  onExit: () => void;
}

export default function SoloScreen({ onExit }: SoloScreenProps) {
  const { state, pick, next, newGame } = useGame(GAME_ROUNDS);
  const { phase, piles, pot, round, lastResult } = state;

  const [shuffling, setShuffling] = useState(true);
  useEffect(() => {
    if (!shuffling) return;
    const timer = setTimeout(() => setShuffling(false), 1400);
    return () => clearTimeout(timer);
  }, [shuffling]);

  // After the reveal the game moves to the next round by itself, long
  // enough to read the result and see the winning stat pulse. Choosing a
  // category is the only action the player ever has to take.
  useEffect(() => {
    if (phase !== 'revealed') return;
    const timer = setTimeout(() => next(), 2500);
    return () => clearTimeout(timer);
  }, [phase, round, next]);

  const restart = () => {
    newGame();
    setShuffling(true);
  };

  if (phase === 'finished') {
    const winner = state.winner;
    const won = winner === HUMAN;
    const draw = winner === 'draw';
    const roundsPlayed = round - 1;
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-100 p-6 font-sans text-black">
        {won && <Confetti />}
        <div
          className={
            'flex w-full max-w-md flex-col items-center gap-5 rounded-xl border-4 border-turmeric bg-white p-8 text-center shadow-md ' +
            (won ? 'animate-panel-pop' : draw ? '' : 'animate-panel-shake')
          }
        >
          <StaceLogo width={110} />
          <h1 className="text-2xl font-bold">
            {draw
              ? 'A draw, you and the computer hold the same number of cards'
              : won
                ? 'You beat the computer'
                : 'The computer wins this time'}
          </h1>
          <p className="text-sm text-neutral-600">
            {roundsPlayed} {roundsPlayed === 1 ? 'round' : 'rounds'} played. You hold{' '}
            {piles[HUMAN].length} {piles[HUMAN].length === 1 ? 'card' : 'cards'}, the computer
            holds {piles[CPU].length}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={restart}
              className="rounded-full bg-teal px-8 py-3 text-sm font-bold text-white hover:bg-teal/90"
            >
              Play again
            </button>
            <button
              onClick={onExit}
              className="rounded-full border-2 border-black bg-white px-8 py-3 text-sm font-bold hover:bg-black hover:text-white"
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const result = phase === 'revealed' ? lastResult : null;
  const comparedStat = result ? result.stat : null;
  const statLabel = result ? COMPARABLE_STATS.find((s) => s.key === result.stat)!.label : '';

  let banner: string;
  let bannerStyle: string;
  if (!result) {
    banner = 'Choose a category from your card.';
    bannerStyle = 'bg-turmeric text-black';
  } else if (result.outcome === 'tie') {
    banner = `A tie on ${statLabel}. Both cards join the pot.`;
    bannerStyle = 'bg-black text-white';
  } else if (result.outcome === HUMAN) {
    const taken = 2 + result.potWon;
    banner =
      `You win the round on ${statLabel}` +
      (result.potWon > 0 ? `, taking ${taken} cards including the pot.` : '.');
    bannerStyle = 'bg-teal text-white';
  } else {
    const taken = 2 + result.potWon;
    banner =
      `The computer wins the round on ${statLabel}` +
      (result.potWon > 0 ? `, taking ${taken} cards including the pot.` : '.');
    bannerStyle = 'bg-paprika text-white';
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 font-sans text-black">
      {shuffling && <ShuffleOverlay />}
      <header className="mx-auto flex max-w-md items-center justify-between gap-2">
        <StaceLogo width={64} />
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-black px-3 py-1 text-xs font-bold text-white">
            Round {Math.min(round, GAME_ROUNDS)} of {GAME_ROUNDS}
          </span>
          {pot.length > 0 && (
            <span className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-bold">
              Pot {pot.length}
            </span>
          )}
        </div>
        <button onClick={onExit} className="text-xs font-bold underline">
          Exit
        </button>
      </header>

      <p
        key={`${round}-${phase}`}
        className={`animate-banner-in mx-auto mt-3 max-w-md rounded-lg px-4 py-2.5 text-center text-sm font-bold ${bannerStyle}`}
      >
        {banner}
      </p>

      <main className="mx-auto mt-4 flex max-w-md flex-col items-center gap-4">
        <section className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">The computer</h2>
            <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-bold">
              {piles[CPU].length} {piles[CPU].length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          {phase === 'revealed' ? (
            <Card
              card={piles[CPU][0]}
              comparedStat={comparedStat}
              winnerHighlight={result !== null && result.outcome === CPU}
            />
          ) : (
            <div className="flex h-20 w-72 items-center justify-center rounded-xl border-4 border-turmeric bg-turmeric">
              <StaceLogo variant="onTurmeric" width={64} />
            </div>
          )}
        </section>

        <section className="flex flex-col items-center gap-2 pb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wide">You</h2>
            <span className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-xs font-bold">
              {piles[HUMAN].length} {piles[HUMAN].length === 1 ? 'card' : 'cards'}
            </span>
          </div>
          <Card
            card={piles[HUMAN][0]}
            comparedStat={comparedStat}
            winnerHighlight={result !== null && result.outcome === HUMAN}
          />
          {phase === 'choosing' && (
            <div className="grid w-72 grid-cols-2 gap-2">
              {COMPARABLE_STATS.map((stat) => (
                <button
                  key={stat.key}
                  onClick={() => pick(stat.key)}
                  className="rounded-md border-2 border-teal bg-white px-2 py-3 text-xs font-bold text-teal hover:bg-teal hover:text-white"
                >
                  {stat.label}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
