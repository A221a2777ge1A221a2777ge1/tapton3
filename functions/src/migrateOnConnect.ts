// functions/src/migrateOnConnect.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
import { getFirestore } from "firebase-admin/firestore";
import * as admin from "firebase-admin";

// ✅ Initialize Admin SDK (safe for multiple imports)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

// ✅ Set global function options once (region + performance tuning)
setGlobalOptions({
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 15,
  minInstances: 0, // change to 1 in production if you want no cold starts
});

// ✅ Migrate anonymous user data to wallet-based account
export const migrateOnConnect = onCall(async (request) => {
  try {
    const { anonUid, walletUid } = request.data;

    if (!anonUid || !walletUid) {
      throw new HttpsError("invalid-argument", "Missing anonUid or walletUid.");
    }

    // ✅ Fetch anonymous user data
    const anonRef = db.collection("users").doc(anonUid);
    const anonSnap = await anonRef.get();

    if (!anonSnap.exists) {
      throw new HttpsError("not-found", "Anonymous user data not found.");
    }

    const anonData = anonSnap.data();

    // ✅ Merge or migrate data into wallet user
    const walletRef = db.collection("users").doc(walletUid);
    await walletRef.set(
      {
        ...anonData,
        migratedFrom: anonUid,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // ✅ Clean up anon user to avoid duplicates
    await anonRef.delete();

    return {
      success: true,
      message: `Migrated data from ${anonUid} to ${walletUid}`,
    };
  } catch (error: any) {
    console.error("Migration failed:", error);
    throw new HttpsError(
      "internal",
      error?.message || "Failed to migrate user data."
    );
  }
});
