"use client";

import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockLeaderboard } from '@/lib/data';
import { formatET, formatAddress } from '@/lib/formatters';
import { useGameState } from '@/hooks/use-game-state';
import { useTonWallet } from '@tonconnect/ui-react';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  const { balance } = useGameState();
  const wallet = useTonWallet();
  const userRank = '1,234'; // Mocked rank

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      <Card className="mb-6">
        <CardContent className="p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-2xl font-bold">{userRank}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground text-right">Your Balance</p>
            <p className="text-2xl font-bold text-primary">{formatET(balance)}</p>
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
              {mockLeaderboard.map((entry, index) => (
                <TableRow key={entry.uid} className={entry.tonAddressShort === formatAddress(wallet?.account.address || '') ? 'bg-primary/10' : ''}>
                  <TableCell className="font-medium text-lg">
                    <div className="flex items-center justify-center">
                    {index < 3 ? <Trophy className={`w-6 h-6 ${
                      index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : 'text-yellow-600'
                    }`} /> : entry.rank}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={entry.avatarUrl} alt="Avatar" />
                        <AvatarFallback>{entry.tonAddressShort.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{formatAddress(entry.tonAddressShort)}</p>
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
