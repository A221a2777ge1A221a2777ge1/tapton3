import { cn } from "@/lib/utils";

export const ETGoldCoin = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={cn(className)}
  >
    <defs>
      <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
        <stop offset="60%" style={{ stopColor: '#FFA500', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
      </radialGradient>
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <feOffset dx="2" dy="4"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="0.5"/>
        </feComponentTransfer>
        <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="48" fill="#8B4513" />
    <circle cx="50" cy="50" r="45" fill="url(#goldGradient)" stroke="#DAA520" strokeWidth="2" />
    <circle cx="50" cy="50" r="40" stroke="#B8860B" strokeWidth="1" fill="none" />
    <text
      x="50"
      y="62"
      fontFamily="Inter, sans-serif"
      fontSize="40"
      fontWeight="800"
      fill="#4A2700"
      textAnchor="middle"
    >
      ET
    </text>
  </svg>
);
