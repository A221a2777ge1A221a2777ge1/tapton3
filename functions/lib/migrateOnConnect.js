import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
const region = process.env.FUNCTIONS_REGION || 'us-central1';
export const migrateAnonToWallet = functions
    .region(region)
    .https.onCall(async (data) => {
    const anonUid = data?.anonUid;
    const walletAddressRaw = data?.walletAddress;
    if (!anonUid || !walletAddressRaw) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing anonUid or walletAddress');
    }
    const walletAddress = walletAddressRaw.toLowerCase();
    const anonRef = db.collection('users').doc(anonUid);
    const walletRef = db.collection('users').doc(walletAddress);
    const snap = await anonRef.get();
    if (!snap.exists) {
        return { migrated: false, reason: 'anon doc not found' };
    }
    const anonData = snap.data() || {};
    await walletRef.set({
        ...anonData,
        userId: walletAddress,
        walletAddress,
        migratedFromAnonUid: anonUid,
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    // Move leaderboard doc if present
    const anonLbRef = db.collection('leaderboard').doc(anonUid);
    const walletLbRef = db.collection('leaderboard').doc(walletAddress);
    const lbSnap = await anonLbRef.get();
    if (lbSnap.exists) {
        await walletLbRef.set({
            ...lbSnap.data(),
            userId: walletAddress,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await anonLbRef.delete();
    }
    await anonRef.delete();
    return { migrated: true };
});
//# sourceMappingURL=migrateOnConnect.js.map