import { CanonRecord, canonCategories } from '@/features/canon/domain';

export function buildWorldChatShareMessage(canon: CanonRecord, publicUrl: string) {
  const summary = canonCategories
    .map((category) => {
      const slot = canon.canon[category];
      if (!slot) {
        return null;
      }
      return `${category}: ${slot.title}`;
    })
    .filter(Boolean)
    .join(' • ');

  return `My Crate\n${summary}\n${publicUrl}`;
}
