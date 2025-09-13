"use client";

import React, { useEffect, useState } from 'react';
import { ETGoldCoin } from '@/components/icons/et-coin';

const PARTICLE_COUNT = 10;

interface Particle {
  id: number;
  style: React.CSSProperties;
}

interface ParticlesProps {
  tapEvents: { id: number }[];
}

const generateParticle = (id: number): Particle => {
  const size = Math.random() * 20 + 10;
  const angle = Math.random() * 360;
  const distance = Math.random() * 80 + 80;
  const duration = Math.random() * 0.5 + 0.5;

  const x = Math.cos(angle) * distance;
  const y = Math.sin(angle) * distance;

  return {
    id,
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: `${size}px`,
      height: `${size}px`,
      transform: 'translate(-50%, -50%)',
      animation: `fly-out ${duration}s ease-out forwards`,
      opacity: 1,
      '--x': `${x}px`,
      '--y': `${y}px`,
    } as React.CSSProperties,
  };
};

export const Particles: React.FC<ParticlesProps> = ({ tapEvents }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (tapEvents.length > 0) {
      const newParticle = generateParticle(tapEvents[tapEvents.length - 1].id);
      setParticles(prev => [...prev, newParticle]);

      setTimeout(() => {
        setParticles(currentParticles =>
          currentParticles.filter(p => p.id !== newParticle.id)
        );
      }, 1000);
    }
  }, [tapEvents]);

  return (
    <>
      <style>
        {`
          @keyframes fly-out {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(0);
              opacity: 0;
            }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0">
        {particles.map(particle => (
          <div key={particle.id} style={particle.style}>
            <ETGoldCoin className="w-full h-full" />
          </div>
        ))}
      </div>
    </>
  );
};
