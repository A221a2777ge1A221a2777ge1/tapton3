"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import type { Investment } from '@/lib/types';
import { useTonWallet } from '@tonconnect/ui-react';
import { getDbOrNull, ensureAnonymousAuth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, setDoc as setDocAlias } from 'firebase/firestore';

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
  const [uid, setUid] = useState<string | null>(null);

  // Refs for periodic persistence
  const balanceRef = useRef(balance);
  const lastClaimedAtRef = useRef(lastClaimedAt);
  useEffect(() => { balanceRef.current = balance; }, [balance]);
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

  // Load persisted state and subscribe once Firebase is available
  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    (async () => {
      const db = getDbOrNull();
      if (!db) return;
      const newUid = await ensureAnonymousAuth();
      if (!newUid) return;
      if (cancelled) return;
      setUid(newUid);
      try {
        const ref = doc(db, 'users', newUid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as any;
          setBalance(typeof data.etBalance === 'number' ? data.etBalance : 100);
          setTaps(typeof data.taps === 'number' ? data.taps : 0);
          setInvestments(Array.isArray(data.investments) ? data.investments : []);
          setLastClaimedAt(typeof data.lastClaimedAt === 'number' ? data.lastClaimedAt : Date.now());
        } else {
          await setDoc(ref, {
            etBalance: 100,
            taps: 0,
            investments: [],
            totalPassiveIncomePerSec: 0,
            lastClaimedAt: Date.now(),
          });
        }
        // Subscribe to remote changes for cross-tab/page updates
        unsub = onSnapshot(ref, (docSnap) => {
          const data = docSnap.data() as any;
          if (!data) return;
          if (typeof data.etBalance === 'number') setBalance(data.etBalance);
          if (typeof data.taps === 'number') setTaps(data.taps);
          if (Array.isArray(data.investments)) setInvestments(data.investments);
          if (typeof data.lastClaimedAt === 'number') setLastClaimedAt(data.lastClaimedAt);
        });
      } catch (e) {
        // best-effort; ignore
      }
    })();
    return () => {
      cancelled = true;
      if (unsub) unsub();
    };
  }, []);

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

  // Periodically persist ticking balance (best-effort)
  useEffect(() => {
    const db = getDbOrNull();
    if (!db || !uid) return;
    const interval = setInterval(() => {
      const ref = doc(db, 'users', uid);
      updateDoc(ref, {
        etBalance: balanceRef.current,
        lastClaimedAt: lastClaimedAtRef.current,
        totalPassiveIncomePerSec: passiveIncomePerSec,
      }).catch(() => {});
      // Update leaderboard snapshot (non-realtime consumer will query periodically)
      const lbRef = doc(collection(db, 'leaderboard'), uid);
      setDocAlias(lbRef, {
        uid,
        etBalance: balanceRef.current,
        incomePerSec: passiveIncomePerSec,
        address: wallet?.account.address || null,
        updatedAt: Date.now(),
      }, { merge: true }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [uid, passiveIncomePerSec, wallet]);

  const tap = useCallback(() => {
    // In a real app, this would be a debounced call to a server action
    setBalance(prev => prev + 1);
    setTaps(prev => prev + 1);
    const db = getDbOrNull();
    if (db && uid) {
      const ref = doc(db, 'users', uid);
      updateDoc(ref, { etBalance: balance + 1, taps: taps + 1, totalPassiveIncomePerSec: passiveIncomePerSec }).catch(() => {});
      const lbRef = doc(collection(db, 'leaderboard'), uid);
      setDocAlias(lbRef, { uid, etBalance: balance + 1, incomePerSec: passiveIncomePerSec, address: wallet?.account.address || null, updatedAt: Date.now() }, { merge: true }).catch(() => {});
    }
  }, [balance, taps, uid, passiveIncomePerSec, wallet]);

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
        // Persist best-effort
        const db = getDbOrNull();
        if (db && uid) {
          const ref = doc(db, 'users', uid);
          updateDoc(ref, { etBalance: newBalance, investments: updated, totalPassiveIncomePerSec: passiveIncomePerSec }).catch(() => {});
          const lbRef = doc(collection(db, 'leaderboard'), uid);
          setDocAlias(lbRef, { uid, etBalance: newBalance, incomePerSec: passiveIncomePerSec, address: wallet?.account.address || null, updatedAt: Date.now() }, { merge: true }).catch(() => {});
        }
        return updated;
      });
      return true;
    }
    return false;
  }, [balance, uid, passiveIncomePerSec, wallet]);

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
