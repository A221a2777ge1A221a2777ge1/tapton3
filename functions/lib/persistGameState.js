"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.persistGameState = void 0;
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length) {
    admin.initializeApp();
}
(0, options_1.setGlobalOptions)({ region: 'us-central1', memory: '256MiB', timeoutSeconds: 15 });
const db = (0, firestore_1.getFirestore)();
exports.persistGameState = (0, https_1.onCall)(async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated.');
    }
    const data = request.data;
    if (typeof data?.etBalance !== 'number' ||
        typeof data?.taps !== 'number' ||
        !Array.isArray(data?.investments) ||
        typeof data?.totalPassiveIncomePerSec !== 'number' ||
        typeof data?.lastClaimedAt !== 'number') {
        throw new https_1.HttpsError('invalid-argument', 'Invalid payload.');
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
        walletAddress: (data.walletAddress || null),
    };
    await db.runTransaction(async (tx) => {
        tx.set(userRef, writePayload, { merge: true });
        tx.set(leaderboardRef, {
            uid,
            etBalance: data.etBalance,
            incomePerSec: data.totalPassiveIncomePerSec,
            address: data.walletAddress || null,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
    return { success: true };
});
//# sourceMappingURL=persistGameState.js.map