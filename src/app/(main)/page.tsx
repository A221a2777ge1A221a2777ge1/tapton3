"use client";

import { useGameState } from '@/hooks/use-game-state';
import { formatET } from '@/lib/formatters';
import { TapButton } from '@/components/pages/home/tap-button';
import { ETGoldCoin } from '@/components/icons/et-coin';

export default function HomePage() {
  const { balance, passiveIncomePerSec } = useGameState();
  

  return (
    <div className="relative flex flex-col items-center justify-between h-full overflow-hidden text-white pt-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-[#0b0f0c] to-[#1a1208]">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `radial-gradient(1200px 600px at 20% 10%, rgba(255, 184, 28, 0.15), transparent), radial-gradient(800px 400px at 80% 20%, rgba(175, 111, 19, 0.12), transparent), radial-gradient(900px 500px at 30% 80%, rgba(16, 99, 59, 0.12), transparent)`
        }} />
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="african-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="30" cy="30" r="6" fill="rgba(255,193,7,0.09)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#african-pattern)" />
        </svg>
      </div>

      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
            <ETGoldCoin className="w-8 h-8"/>
            <h1 className="text-5xl font-extrabold tracking-tighter text-white">
                {formatET(balance)}
            </h1>
        </div>
        <p className="text-sm text-primary font-medium mt-1">
          + {formatET(passiveIncomePerSec)} / sec
        </p>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <TapButton />
      </div>

      <div className="h-24" />
    </div>
  );
}
