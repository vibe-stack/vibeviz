import { useAtomValue } from "jotai";
import { audioClipAtom } from "../state";

/**
 * Hook to get current audio clip information
 */
export function useAudioClip() {
  return useAtomValue(audioClipAtom);
}
