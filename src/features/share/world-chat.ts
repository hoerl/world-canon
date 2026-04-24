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

  return `My Canon\n${summary}\n${publicUrl}`;
}
