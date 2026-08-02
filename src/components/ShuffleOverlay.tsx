import type { CSSProperties } from 'react';

/** Brief full screen shuffle animation shown when a new game is dealt. */
export default function ShuffleOverlay() {
  const offsets = [-120, -60, 0, 60, 120];
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-white/95 font-sans">
      <div className="relative h-44 w-80">
        {offsets.map((dx, i) => (
          <div
            key={dx}
            className="shuffle-card absolute left-1/2 top-1/2 h-36 w-24 rounded-lg border-2 border-white bg-turmeric shadow-md"
            style={
              {
                '--dx': `${dx}px`,
                '--rot': `${dx / 8}deg`,
                animationDelay: `${i * 60}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <p className="text-sm font-bold uppercase tracking-widest text-black">
        Shuffling the deck
      </p>
    </div>
  );
}
