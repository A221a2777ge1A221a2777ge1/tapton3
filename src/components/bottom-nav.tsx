"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HandCoins, Briefcase, BarChart3, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: HandCoins, label: 'Tap' },
  { href: '/invest', icon: Briefcase, label: 'Invest' },
  { href: '/leaderboard', icon: BarChart3, label: 'Leaders' },
  { href: '/wallet', icon: Wallet, label: 'Wallet' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-secondary/80 backdrop-blur-lg border-t border-border z-50">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.href} className="flex-1">
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
