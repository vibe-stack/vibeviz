"use client";

import {
  createContext,
  type MutableRefObject,
  type ReactNode,
  useContext,
  useRef,
} from "react";

const PlaybackTimeContext = createContext<MutableRefObject<number> | null>(
  null,
);

export const PlaybackTimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentTimeRef = useRef(0);

  return (
    <PlaybackTimeContext.Provider value={currentTimeRef}>
      {children}
    </PlaybackTimeContext.Provider>
  );
};

export const usePlaybackTimeRef = () => {
  const context = useContext(PlaybackTimeContext);

  if (!context) {
    throw new Error(
      "usePlaybackTimeRef must be used within a PlaybackTimeProvider",
    );
  }

  return context;
};
