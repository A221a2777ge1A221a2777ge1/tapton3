"use client";

import React from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Button } from '@/components/ui/button';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const NotConnectedView = () => (
    <div className="relative flex flex-col items-center justify-center h-screen text-center p-8 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-black via-[#0b0f0c] to-[#1a1208]">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(1200px 600px at 20% 10%, rgba(255, 184, 28, 0.15), transparent), radial-gradient(800px 400px at 80% 20%, rgba(175, 111, 19, 0.12), transparent), radial-gradient(900px 500px at 30% 80%, rgba(16, 99, 59, 0.12), transparent)`
          }} />
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="african-pattern-welcome" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M0 30 L30 0 L60 30 L30 60 Z" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="30" cy="30" r="6" fill="rgba(255,193,7,0.09)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#african-pattern-welcome)" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-primary mb-2">Evana Tycoon</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">Your Gateway to African Investments.</p>
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
