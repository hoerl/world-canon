import { CanonCategory } from '@/features/canon/domain';

export type TwinOverlap = {
  category: CanonCategory;
  title: string;
};

export type TwinMatch = {
  slug: string;
  username: string | null;
  score: number;
  overlaps: TwinOverlap[];
  sharedTags: string[];
};
