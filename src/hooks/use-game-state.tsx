"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Investment } from '@/lib/types';
import { useTonWallet } from '@tonconnect/ui-react';

interface GameState {
  balance: number;
  taps: number;
  passiveIncomePerSec: number;
  investments: Investment[];
  tap: () => void;
  purchaseInvestment: (investment: Investment) => boolean;
}

const GameStateContext = createContext<GameState | undefined>(undefined);

const TICK_INTERVAL = 1000; // 1 second

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState(100);
  const [taps, setTaps] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [lastClaimedAt, setLastClaimedAt] = useState(Date.now());

  const passiveIncomePerSec = investments.reduce((total, inv) => total + inv.incomePerSecET * inv.ownedQty, 0);

  useEffect(() => {
    if (!wallet) {
      setBalance(100);
      setTaps(0);
      setInvestments([]);
      setLastClaimedAt(Date.now());
    }
  }, [wallet]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = (now - lastClaimedAt) / 1000;
      const income = elapsedSeconds * passiveIncomePerSec;
      
      if (income > 0) {
        setBalance(prev => prev + income);
        setLastClaimedAt(now);
      }
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [passiveIncomePerSec, lastClaimedAt]);

  const tap = useCallback(() => {
    // In a real app, this would be a debounced call to a server action
    setBalance(prev => prev + 1);
    setTaps(prev => prev + 1);
  }, []);

  const purchaseInvestment = useCallback((investment: Investment): boolean => {
    if (balance >= investment.costET) {
      setBalance(prev => prev - investment.costET);
      setInvestments(prevInvestments => {
        const existing = prevInvestments.find(i => i.id === investment.id);
        if (existing) {
          return prevInvestments.map(i =>
            i.id === investment.id ? { ...i, ownedQty: i.ownedQty + 1, costET: Math.floor(i.costET * 1.15) } : i
          );
        }
        return [...prevInvestments, { ...investment, ownedQty: 1, costET: Math.floor(investment.costET * 1.15) }];
      });
      return true;
    }
    return false;
  }, [balance]);

  const value = {
    balance,
    taps,
    passiveIncomePerSec,
    investments,
    tap,
    purchaseInvestment,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
};

export const useGameState = (): GameState => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
