"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameState } from '@/hooks/use-game-state';
import { formatAddress, formatET } from '@/lib/formatters';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Copy, HandCoins, LogOut, TrendingUp, Wallet as WalletIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function WalletPage() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { balance, taps, passiveIncomePerSec } = useGameState();

  const handleCopy = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.account.address);
      toast({ title: 'Address copied!' });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>
            View your balance, stats, and manage your wallet connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {wallet ? (
            <>
              <div className="p-4 rounded-lg bg-secondary flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <WalletIcon className="w-6 h-6 text-primary" />
                  <span className="font-mono">{formatAddress(wallet.account.address)}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard 
                  title="Balance" 
                  value={formatET(balance)} 
                  icon={WalletIcon} 
                />
                <StatCard 
                  title="Total Taps" 
                  value={formatET(taps)} 
                  icon={HandCoins} 
                />
                <StatCard 
                  title="Passive Income" 
                  value={`${formatET(passiveIncomePerSec)}/s`} 
                  icon={TrendingUp} 
                />
              </div>

              <Button variant="destructive" className="w-full" onClick={() => tonConnectUI.disconnect()}>
                <LogOut className="mr-2 h-4 w-4" /> Disconnect
              </Button>
            </>
          ) : (
            <div className="text-center p-8">
              <p className="mb-4 text-muted-foreground">Your wallet is not connected.</p>
              <Button onClick={() => tonConnectUI.openModal()}>
                Connect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string, icon: React.ElementType }) => (
    <Card className="text-center">
        <CardContent className="p-4">
            <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
        </CardContent>
    </Card>
)
