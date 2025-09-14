"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import type { Investment } from '@/lib/types';
import { useTonWallet } from '@tonconnect/ui-react';
import { getDbOrNull, ensureAnonymousAuth } from '@/lib/firebase';
import { doc, getDoc, setDoc, writeBatch, collection } from 'firebase/firestore';

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
const DEFAULT_PERSIST_MS = Number(process.env.NEXT_PUBLIC_PERSIST_INTERVAL_MS || '') || 60000;
const LB_DELTA_RATIO = Number(process.env.NEXT_PUBLIC_LEADERBOARD_UPDATE_THRESHOLD || '') || 0.05;
const ENABLE_NEW_PERSISTENCE = process.env.NEXT_PUBLIC_ENABLE_NEW_PERSISTENCE === 'true' || process.env.NEXT_PUBLIC_ENABLE_NEW_PERSISTENCE === '1';

export const GameStateProvider = ({ children }: { children: ReactNode }) => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState(100);
  const [taps, setTaps] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [lastClaimedAt, setLastClaimedAt] = useState(Date.now());
  const [uid, setUid] = useState<string | null>(null);

  // Refs for periodic persistence (local-first)
  const balanceRef = useRef(balance);
  const tapsRef = useRef(taps);
  const investmentsRef = useRef(investments);
  const lastClaimedAtRef = useRef(lastClaimedAt);
  const dirtyRef = useRef(false);
  const isPersistingRef = useRef(false);
  const lastPersistedBalanceRef = useRef(0);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
  useEffect(() => { tapsRef.current = taps; }, [taps]);
  useEffect(() => { investmentsRef.current = investments; }, [investments]);
  useEffect(() => { lastClaimedAtRef.current = lastClaimedAt; }, [lastClaimedAt]);

  const passiveIncomePerSec = investments.reduce((total, inv) => total + inv.incomePerSecET * inv.ownedQty, 0);

  useEffect(() => {
    if (!wallet) {
      setBalance(100);
      setTaps(0);
      setInvestments([]);
      setLastClaimedAt(Date.now());
    }
  }, [wallet]);

  // Load persisted state once Firebase is available
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const db = getDbOrNull();
      if (!db) return;
      const anonUid = await ensureAnonymousAuth();
      if (cancelled) return;
      // Prefer wallet address (lowercased) as canonical ID
      const walletAddress = wallet?.account?.address?.toLowerCase();
      const newUid = walletAddress || anonUid || null;
      if (!newUid) return;
      setUid(newUid);
      try {
        const ref = doc(db, 'users', newUid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          const initBalance = typeof data.etBalance === 'number' ? data.etBalance : 100;
          setBalance(initBalance);
          setTaps(typeof data.taps === 'number' ? data.taps : 0);
          setInvestments(Array.isArray(data.investments) ? data.investments : []);
          setLastClaimedAt(typeof data.lastClaimedAt === 'number' ? data.lastClaimedAt : Date.now());
          lastPersistedBalanceRef.current = initBalance;
        } else {
          await setDoc(ref, {
            etBalance: 100,
            taps: 0,
            investments: [],
            totalPassiveIncomePerSec: 0,
            lastClaimedAt: Date.now(),
            userId: newUid,
            walletAddress: walletAddress || null,
          });
          lastPersistedBalanceRef.current = 100;
        }
      } catch {
        // best-effort; ignore
      }
    })();
    return () => {
      cancelled = true;
    };
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

  // Periodically persist local state using a single batched write
  useEffect(() => {
    if (!ENABLE_NEW_PERSISTENCE) return;
    const db = getDbOrNull();
    if (!db || !uid) return;
    const interval = setInterval(async () => {
      if (!dirtyRef.current || isPersistingRef.current) return;
      try {
        isPersistingRef.current = true;
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', uid);
        batch.set(userRef, {
          etBalance: balanceRef.current,
          taps: tapsRef.current,
          investments: investmentsRef.current,
          totalPassiveIncomePerSec: passiveIncomePerSec,
          lastClaimedAt: lastClaimedAtRef.current,
          lastPersistedAt: Date.now(),
          userId: uid,
          walletAddress: wallet?.account.address?.toLowerCase() || null,
        }, { merge: true });

        const previous = lastPersistedBalanceRef.current;
        const current = balanceRef.current;
        const shouldUpdateLb = previous <= 0 || Math.abs(current - previous) / Math.max(previous, 1) >= LB_DELTA_RATIO;
        if (shouldUpdateLb) {
          const lbRef = doc(collection(db, 'leaderboard'), uid);
          batch.set(lbRef, {
            uid,
            etBalance: current,
            incomePerSec: passiveIncomePerSec,
            address: wallet?.account.address || null,
            updatedAt: Date.now(),
          }, { merge: true });
        }

        await batch.commit();
        dirtyRef.current = false;
        lastPersistedBalanceRef.current = balanceRef.current;
      } catch {
        // swallow errors but keep dirty to retry next interval
      } finally {
        isPersistingRef.current = false;
      }
    }, DEFAULT_PERSIST_MS);
    return () => clearInterval(interval);
  }, [uid, passiveIncomePerSec, wallet]);

  const tap = useCallback(() => {
    setBalance(prev => prev + 1);
    setTaps(prev => prev + 1);
    dirtyRef.current = true;
  }, []);

  const purchaseInvestment = useCallback((investment: Investment): boolean => {
    if (balance >= investment.costET) {
      const newBalance = balance - investment.costET;
      setBalance(newBalance);
      setInvestments(prevInvestments => {
        const existing = prevInvestments.find(i => i.id === investment.id);
        const updated = existing
          ? prevInvestments.map(i =>
              i.id === investment.id ? { ...i, ownedQty: i.ownedQty + 1, costET: Math.floor(i.costET * 1.15) } : i
            )
          : [...prevInvestments, { ...investment, ownedQty: 1, costET: Math.floor(investment.costET * 1.15) }];
        dirtyRef.current = true;
        return updated;
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
