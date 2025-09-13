"use client";

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function TonProvider({ children }: { children: React.ReactNode }) {
  // The manifestUrl is read from the environment variable at build time.
  // The '!' asserts that the variable is present, failing the build if it's not.
  // This ensures the URL is always correctly set in production builds.
  const manifestUrl = process.env.NEXT_PUBLIC_TON_MANIFEST_URL!;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
