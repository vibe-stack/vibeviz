import { PlaybackTimeProvider } from "@/context/playback-time-context";
import { MusicVisualizer } from "@/components/MusicVisualizer";

export default function Home() {
  return (
    <PlaybackTimeProvider>
      <MusicVisualizer />
    </PlaybackTimeProvider>
  );
}
