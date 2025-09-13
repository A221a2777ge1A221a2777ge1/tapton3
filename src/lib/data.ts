import { LeaderboardEntry } from './types';
import { PlaceHolderImages } from './placeholder-images';

const avatarPlaceholder = PlaceHolderImages.find(img => img.id === 'avatar-placeholder')?.imageUrl || '';

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, uid: 'user1', tonAddressShort: 'UQ..t7', etBalance: 123456789, avatarUrl: avatarPlaceholder },
  { rank: 2, uid: 'user2', tonAddressShort: 'EQ..fG', etBalance: 98765432, avatarUrl: avatarPlaceholder },
  { rank: 3, uid: 'user3', tonAddressShort: 'EQ..hY', etBalance: 87654321, avatarUrl: avatarPlaceholder },
  { rank: 4, uid: 'user4', tonAddressShort: 'UQ..jU', etBalance: 76543210, avatarUrl: avatarPlaceholder },
  { rank: 5, uid: 'user5', tonAddressShort: 'EQ..kL', etBalance: 65432109, avatarUrl: avatarPlaceholder },
  { rank: 6, uid: 'user6', tonAddressShort: 'UQ..zX', etBalance: 54321098, avatarUrl: avatarPlaceholder },
  { rank: 7, uid: 'user7', tonAddressShort: 'EQ..cV', etBalance: 43210987, avatarUrl: avatarPlaceholder },
  { rank: 8, uid: 'user8', tonAddressShort: 'UQ..bN', etBalance: 32109876, avatarUrl: avatarPlaceholder },
  { rank: 9, uid: 'user9', tonAddressShort: 'EQ..mK', etBalance: 21098765, avatarUrl: avatarPlaceholder },
  { rank: 10, uid: 'user10', tonAddressShort: 'UQ..lP', etBalance: 10987654, avatarUrl: avatarPlaceholder },
];
