"use client";

import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import * as Tone from "tone";
import {
  audioClipAtom,
  audioPlayerAtom,
  currentTimeAtom,
  durationAtom,
  isPlayingAtom,
} from "@/features/audio/state";
import { audioVolumeAtom } from "@/features/timeline/state";

/**
 * Hook to handle audio playback and time synchronization
 */
export function useAudioPlayback() {
  const audioClip = useAtomValue(audioClipAtom);
  const [currentTime, setCurrentTime] = useAtom(currentTimeAtom);
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const duration = useAtomValue(durationAtom);
  const setAudioPlayer = useSetAtom(audioPlayerAtom);
  const volume = useAtomValue(audioVolumeAtom);

  const playerRef = useRef<Tone.Player | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const lastStartTimeRef = useRef<number>(0); // Track when we last started

  // Initialize player when audio clip changes
  useEffect(() => {
    if (!audioClip) {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
        setAudioPlayer(null);
      }
      return;
    }

    // Dispose old player if exists
    if (playerRef.current) {
      playerRef.current.dispose();
    }

    const player = new Tone.Player({
      url: audioClip.url,
      onload: () => {
        console.log("Audio loaded and ready");
      },
    }).toDestination();

    playerRef.current = player;
    setAudioPlayer(player); // Make player available to analyzers

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      player.dispose();
      playerRef.current = null;
      setAudioPlayer(null);
    };
  }, [audioClip, setAudioPlayer]);

  // Handle play/pause - only when isPlaying changes
  // biome-ignore lint/correctness/useExhaustiveDependencies(currentTime): Should not depend on currentTime, it causes issues
  useEffect(() => {
    const player = playerRef.current;
    if (!player || duration === 0 || !audioClip) return;

    // Prevent duplicate playback
    if (isPlaying === isPlayingRef.current) return;
    isPlayingRef.current = isPlaying;

    const updateTime = () => {
      if (!isPlayingRef.current || !player) return;

      const now = Tone.now();
      const elapsed = now - startedAtRef.current;
      const newTime = startTimeRef.current + elapsed;

      if (newTime >= duration) {
        // Reached end
        isPlayingRef.current = false;
        setIsPlaying(false);
        setCurrentTime(duration);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        player.stop();
      } else {
        setCurrentTime(newTime);
        rafRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      // Stop any existing playback first
      player.stop();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      // Get the current time at the moment play is pressed
      const playFromTime = currentTime;
      lastStartTimeRef.current = playFromTime;

      // Start playback at current time
      Tone.start().then(async () => {
        // Ensure player is loaded
        await player.load(audioClip.url);

        startTimeRef.current = playFromTime;
        startedAtRef.current = Tone.now();

        // Start playing from playFromTime offset
        player.start(Tone.now(), playFromTime);

        rafRef.current = requestAnimationFrame(updateTime);
      });
    } else {
      // Stop playback
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      player.stop();
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, duration, audioClip, setCurrentTime, setIsPlaying]); // Removed currentTime from deps!

  // Update volume when it changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume.value = Tone.gainToDb(volume);
    }
  }, [volume]);

  return {
    player: playerRef.current,
  };
}
