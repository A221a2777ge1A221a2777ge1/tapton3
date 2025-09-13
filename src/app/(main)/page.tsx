"use client";

import Image from 'next/image';
import { useGameState } from '@/hooks/use-game-state';
import { formatET } from '@/lib/formatters';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { TapButton } from '@/components/pages/home/tap-button';
import { ETGoldCoin } from '@/components/icons/et-coin';

export default function HomePage() {
  const { balance, passiveIncomePerSec } = useGameState();
  const heroBg = PlaceHolderImages.find(img => img.id === 'hero-background');

  return (
    <div className="relative flex flex-col items-center justify-between h-full overflow-hidden text-white pt-8">
      {heroBg && (
        <Image
          src={heroBg.imageUrl}
          alt={heroBg.description}
          data-ai-hint={heroBg.imageHint}
          fill
          className="object-cover -z-10"
        />
      )}
      <div className="absolute inset-0 bg-black/50 -z-10" />

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
