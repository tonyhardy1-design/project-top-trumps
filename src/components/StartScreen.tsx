import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import StaceLogo from './StaceLogo';

/**
 * The address other people should open to play. On localhost during
 * development this is the dev machine's network address, on a deployed
 * build it is simply the site's own address.
 */
function resolveShareUrl(): string {
  const { hostname, origin, pathname } = window.location;
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && __LAN_ORIGIN__) {
    return __LAN_ORIGIN__;
  }
  return origin + pathname.replace(/index\.html$/, '');
}

interface StartScreenProps {
  onPlay: () => void;
}

export default function StartScreen({ onPlay }: StartScreenProps) {
  const [shareUrl] = useState(resolveShareUrl);
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 320, margin: 1 })
      .then(setQr)
      .catch(() => setQr(null));
  }, [shareUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans text-black">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <StaceLogo width={150} />
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wide">
            Project <span className="text-turmeric">Top Trumps</span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700">
            Take on the computer with real Stace cost data. Six rounds, the chooser
            picks a stat each round, the better value takes the cards, and whoever
            holds the most cards at the end wins.
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            This deck covers Residential and Student Accommodation projects only,
            121 cards built from Stace benchmarking data.
          </p>
        </div>

        <button
          onClick={onPlay}
          className="w-full max-w-xs rounded-full bg-teal px-8 py-3.5 text-base font-bold text-white hover:bg-teal/90"
        >
          Play
        </button>

        {qr && (
          <div className="flex flex-col items-center gap-2 rounded-xl border-2 border-neutral-200 bg-white p-4">
            <img src={qr} alt="QR code to open the game" className="h-40 w-40" />
            <p className="text-xs font-bold">Scan to play on your phone</p>
            <p className="break-all text-[10px] text-neutral-400">{shareUrl}</p>
          </div>
        )}

        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          Together we deliver
        </p>
      </div>
    </div>
  );
}
