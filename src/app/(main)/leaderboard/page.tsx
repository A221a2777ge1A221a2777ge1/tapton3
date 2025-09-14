"use client";

import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatET, formatAddress } from '@/lib/formatters';
import { useGameState } from '@/hooks/use-game-state';
import { useTonWallet } from '@tonconnect/ui-react';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDbOrNull, getAuthOrNull } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, where, getCountFromServer, doc, getDoc } from 'firebase/firestore';

export default function LeaderboardPage() {
  const { balance } = useGameState();
  const wallet = useTonWallet();
  const [top, setTop] = useState<Array<{ uid: string; address?: string | null; etBalance: number; rank: number }>>([]);
  const [selfRank, setSelfRank] = useState<number | null>(null);

  useEffect(() => {
    const db = getDbOrNull();
    if (!db) return;
    (async () => {
      try {
        const q = query(collection(db, 'leaderboard'), orderBy('etBalance', 'desc'), limit(100));
        const snap = await getDocs(q);
        const rows: Array<{ uid: string; address?: string | null; etBalance: number; rank: number }> = [];
        let index = 0;
        snap.forEach((doc) => {
          const d = doc.data() as any;
          rows.push({
            uid: (d && d.uid) || doc.id,
            address: d?.address ?? null,
            etBalance: typeof d?.etBalance === 'number' ? d.etBalance : 0,
            rank: ++index,
          });
        });
        // Compute approximate rank by counting users with greater balance (no realtime)
        try {
          const allQ = query(collection(db, 'leaderboard'), where('etBalance', '>', balance));
          const countSnap = await getCountFromServer(allQ);
          setSelfRank(countSnap.data().count + 1);
        } catch (_) {
          setSelfRank(null);
        }

        // If current user is not in top rows, append their server snapshot via UID
        const auth = getAuthOrNull();
        const currentUid = auth?.currentUser?.uid || null;
        if (currentUid && !rows.some(r => r.uid === currentUid)) {
          try {
            const selfRef = doc(collection(db, 'leaderboard'), currentUid);
            const selfSnap = await getDoc(selfRef);
            if (selfSnap.exists()) {
              const d = selfSnap.data() as any;
              rows.push({
                uid: currentUid,
                address: d?.address ?? wallet?.account.address ?? null,
                etBalance: typeof d?.etBalance === 'number' ? d.etBalance : balance,
                rank: (selfRank ?? rows.length + 1),
              });
            } else if (wallet?.account.address) {
              rows.push({ uid: currentUid, address: wallet.account.address, etBalance: balance, rank: (selfRank ?? rows.length + 1) });
            }
          } catch (_) {
            // ignore
          }
        }
        setTop(rows);
      } catch (_) {
        setTop([]);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      <Card className="mb-6">
        <CardContent className="p-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Rank</p>
            <p className="text-xl font-bold">{selfRank ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Player</p>
            <p className="text-xl font-bold">{formatAddress(wallet?.account.address || '')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-xl font-bold text-primary">{formatET(balance)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {top.map((entry, index) => (
                <TableRow key={entry.uid}>
                  <TableCell className="font-medium text-lg">
                    <div className="flex items-center justify-center">
                    {index < 3 ? <Trophy className={`w-6 h-6 ${
                      index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'
                    }`} /> : index + 1}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={"/icon.svg"} alt="Avatar" />
                        <AvatarFallback>{entry.uid.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{formatAddress(entry.uid)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">{formatET(entry.etBalance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
