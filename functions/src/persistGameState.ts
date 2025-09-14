import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

setGlobalOptions({ region: 'us-central1', memory: '256MiB', timeoutSeconds: 15 });

const db = getFirestore();

interface PersistPayload {
  etBalance: number;
  taps: number;
  investments: unknown[];
  totalPassiveIncomePerSec: number;
  lastClaimedAt: number;
  walletAddress: string | null;
}

export const persistGameState = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const data = request.data as Partial<PersistPayload>;
  if (
    typeof data?.etBalance !== 'number' ||
    typeof data?.taps !== 'number' ||
    !Array.isArray(data?.investments) ||
    typeof data?.totalPassiveIncomePerSec !== 'number' ||
    typeof data?.lastClaimedAt !== 'number'
  ) {
    throw new HttpsError('invalid-argument', 'Invalid payload.');
  }

  const userRef = db.collection('users').doc(uid);
  const leaderboardRef = db.collection('leaderboard').doc(uid);

  const writePayload = {
    etBalance: data.etBalance,
    taps: data.taps,
    investments: data.investments,
    totalPassiveIncomePerSec: data.totalPassiveIncomePerSec,
    lastClaimedAt: data.lastClaimedAt,
    lastPersistedAt: admin.firestore.FieldValue.serverTimestamp(),
    userId: uid,
    walletAddress: (data.walletAddress || null) as string | null,
  };

  await db.runTransaction(async (tx) => {
    tx.set(userRef, writePayload, { merge: true });
    tx.set(
      leaderboardRef,
      {
        uid,
        etBalance: data.etBalance,
        incomePerSec: data.totalPassiveIncomePerSec,
        address: data.walletAddress || null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });

  return { success: true };
});

