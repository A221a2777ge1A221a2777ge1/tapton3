"use client";

import React, { useState, useCallback } from 'react';
import { useGameState } from '@/hooks/use-game-state';
import { Particles } from './particles';
import { ETGoldCoin } from '@/components/icons/et-coin';
import { cn } from '@/lib/utils';

export function TapButton() {
  const { tap } = useGameState();
  const [isTapped, setIsTapped] = useState(false);
  const [tapEvents, setTapEvents] = useState<{ id: number }[]>([]);

  const handleTap = useCallback(() => {
    tap();
    setIsTapped(true);
    const base = Date.now() + Math.random();
    setTapEvents(prev => [
      ...prev,
      { id: base + 0 },
      { id: base + 1 },
      { id: base + 2 },
      { id: base + 3 },
      { id: base + 4 },
    ]);
    setTimeout(() => setIsTapped(false), 100);
  }, [tap]);

  return (
    <div className="relative">
      <button
        onClick={handleTap}
        className={cn(
            "relative z-10 select-none w-64 h-64 md:w-80 md:h-80 rounded-full active:scale-95 transition-transform duration-100 focus:outline-none",
            isTapped && 'scale-95'
        )}
        aria-label="Tap to earn"
      >
        <ETGoldCoin className="w-full h-full drop-shadow-[0_10px_20px_rgba(255,193,7,0.4)]"/>
      </button>
      <Particles tapEvents={tapEvents} />
    </div>
  );
}
