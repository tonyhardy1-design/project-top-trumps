import StaceLogo from './StaceLogo';

/** Face down card, Turmeric back with the white logo variant. */
export default function CardBack() {
  return (
    <div className="flex h-[420px] w-72 flex-col items-center justify-center gap-4 rounded-xl border-4 border-turmeric bg-turmeric shadow-md">
      <StaceLogo variant="onTurmeric" width={120} />
      <span className="text-xs font-bold uppercase tracking-widest text-black/70">
        Project Top Trumps
      </span>
    </div>
  );
}
