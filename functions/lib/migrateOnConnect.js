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
exports.migrateOnConnect = void 0;
// functions/src/migrateOnConnect.ts
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
const firestore_1 = require("firebase-admin/firestore");
const admin = __importStar(require("firebase-admin"));
// ✅ Initialize Admin SDK (safe for multiple imports)
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = (0, firestore_1.getFirestore)();
// ✅ Set global function options once (region + performance tuning)
(0, options_1.setGlobalOptions)({
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 15,
    minInstances: 0, // change to 1 in production if you want no cold starts
});
// ✅ Migrate anonymous user data to wallet-based account
exports.migrateOnConnect = (0, https_1.onCall)(async (request) => {
    try {
        const { anonUid, walletUid } = request.data;
        if (!anonUid || !walletUid) {
            throw new https_1.HttpsError("invalid-argument", "Missing anonUid or walletUid.");
        }
        // ✅ Fetch anonymous user data
        const anonRef = db.collection("users").doc(anonUid);
        const anonSnap = await anonRef.get();
        if (!anonSnap.exists) {
            throw new https_1.HttpsError("not-found", "Anonymous user data not found.");
        }
        const anonData = anonSnap.data();
        // ✅ Merge or migrate data into wallet user
        const walletRef = db.collection("users").doc(walletUid);
        await walletRef.set({
            ...anonData,
            migratedFrom: anonUid,
            migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        // ✅ Clean up anon user to avoid duplicates
        await anonRef.delete();
        return {
            success: true,
            message: `Migrated data from ${anonUid} to ${walletUid}`,
        };
    }
    catch (error) {
        console.error("Migration failed:", error);
        throw new https_1.HttpsError("internal", error?.message || "Failed to migrate user data.");
    }
});
//# sourceMappingURL=migrateOnConnect.js.map