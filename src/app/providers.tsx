"use client";

import { Provider } from "jotai";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
