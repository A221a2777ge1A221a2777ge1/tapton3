"use client";

import React from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Button } from '@/components/ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const NotConnectedView = () => (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center p-8">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to ET Tap</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">Connect your TON wallet to start playing and earning.</p>
        <Button onClick={() => tonConnectUI.openModal()} size="lg">Connect Wallet</Button>
    </div>
  )

  return (
    <div className="flex flex-col h-screen">
      {wallet ? (
        <>
          <main className="flex-1 overflow-y-auto pb-20">{children}</main>
          <BottomNav />
        </>
      ) : (
        <NotConnectedView />
      )}
    </div>
  );
}
