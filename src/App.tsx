import { useState } from 'react';
import StartScreen from './components/StartScreen';
import SoloScreen from './components/SoloScreen';

export default function App() {
  const [roundLimit, setRoundLimit] = useState<number | null>(10);
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return (
      <StartScreen
        roundLimit={roundLimit}
        onRoundLimit={setRoundLimit}
        onPlay={() => setPlaying(true)}
      />
    );
  }
  return <SoloScreen roundLimit={roundLimit} onExit={() => setPlaying(false)} />;
}
