import { useState } from 'react';
import StartScreen from './components/StartScreen';
import SoloScreen from './components/SoloScreen';

export default function App() {
  const [playing, setPlaying] = useState(false);

  if (!playing) {
    return <StartScreen onPlay={() => setPlaying(true)} />;
  }
  return <SoloScreen onExit={() => setPlaying(false)} />;
}
