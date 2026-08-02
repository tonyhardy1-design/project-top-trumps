import type { ProjectCard, ComparableStatKey } from '../data/types';
import { COMPARABLE_STATS } from '../data/types';
import StaceLogo from './StaceLogo';

interface CardProps {
  card: ProjectCard;
  /** The stat currently being compared this round, highlighted in Teal. */
  comparedStat?: ComparableStatKey | null;
  /** True on the round winner's card, pulses the compared stat row. */
  winnerHighlight?: boolean;
}

function SectorTag({ sector }: { sector: ProjectCard['sector'] }) {
  const isStudent = sector === 'Student Accommodation';
  return (
    <span
      className={
        'inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ' +
        (isStudent ? 'bg-teal text-white' : 'bg-turmeric text-black')
      }
    >
      {sector}
    </span>
  );
}

export default function Card({ card, comparedStat = null, winnerHighlight = false }: CardProps) {
  return (
    <div className="flex w-72 flex-col overflow-hidden rounded-xl border-4 border-turmeric bg-white font-sans text-black shadow-md">
      <div className="bg-turmeric px-4 py-3">
        <h2 className="text-base font-bold leading-tight text-black">Project {card.number}</h2>
        <p className="mt-0.5 text-xs font-medium text-black/80">
          {card.city}, {card.region}
        </p>
      </div>

      <div className="px-4 pt-3">
        <SectorTag sector={card.sector} />
      </div>

      <ul className="mt-3 flex flex-col gap-1 px-3 pb-4">
        {COMPARABLE_STATS.map((stat) => {
          const isCompared = stat.key === comparedStat;
          return (
            <li
              key={stat.key}
              className={
                'flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 ' +
                (isCompared
                  ? 'bg-teal text-white' + (winnerHighlight ? ' animate-stat-pulse' : '')
                  : 'bg-white text-black')
              }
            >
              <span className={'text-xs ' + (isCompared ? 'font-bold' : 'font-medium')}>
                {stat.label}
              </span>
              <span className="whitespace-nowrap text-sm font-bold tabular-nums">
                {stat.format(card[stat.key], card)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-2.5">
        <StaceLogo variant="onLight" width={68} />
        <span className="text-[10px] text-neutral-500">Cost Management</span>
      </div>
    </div>
  );
}
