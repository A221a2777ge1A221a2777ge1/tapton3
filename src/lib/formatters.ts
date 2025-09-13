export function formatET(n: number): string {
  if (n < 1e3) return n.toFixed(0);
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K';
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M';
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B';
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T';
  return n.toString();
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
