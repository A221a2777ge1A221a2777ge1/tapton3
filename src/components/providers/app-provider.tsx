"use client";

import { TonProvider } from './ton-provider';
import { GameStateProvider } from '@/hooks/use-game-state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonProvider>
      <GameStateProvider>
        {children}
      </GameStateProvider>
    </TonProvider>
  );
}
