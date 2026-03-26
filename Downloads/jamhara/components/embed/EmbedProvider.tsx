"use client";

import { createContext, useContext } from "react";

export const EmbedContext = createContext(false);

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  return <EmbedContext.Provider value={true}>{children}</EmbedContext.Provider>;
}

export function useIsEmbed() {
  return useContext(EmbedContext);
}
