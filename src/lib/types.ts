export type InvestmentCategory =
  | 'RealEstate'
  | 'Agriculture'
  | 'Management'
  | 'Tech'
  | 'Politics'
  | 'Health'
  | 'Security';

export interface Investment {
  id: string;
  category: InvestmentCategory;
  name: string;
  costET: number;
  incomePerSecET: number;
  ownedQty: number;
  description?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
}

export interface User {
  uid: string;
  tonAddress: string;
  etBalance: number;
  taps: number;
  totalPassiveIncomePerSec: number;
  lastClaimedAt: number; // timestamp
}

export interface LeaderboardEntry {
  rank: number;
  uid: string;
  tonAddressShort: string;
  etBalance: number;
  avatarUrl: string;
}
