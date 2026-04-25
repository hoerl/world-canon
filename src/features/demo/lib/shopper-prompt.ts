import {
  CanonRecord,
  CanonEvolutionRecord,
  canonCategories,
} from '@/features/canon/domain';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export { CLAUDE_MODEL };

export function buildShopperPrompt(
  canon: CanonRecord,
  evolutions: CanonEvolutionRecord[],
  exclude: string[] = [],
): string {
  const slots = formatSlots(canon);
  const history = formatEvolutions(evolutions);
  const excludeBlock = exclude.length > 0
    ? `\n\nIMPORTANT: Do NOT suggest any of these previously recommended gifts:\n${exclude.map((n) => `- ${n}`).join('\n')}\n`
    : '';

  return `You are a thoughtful personal gift curator. You have been given someone's "Crate" — their three most meaningful selections of a Person, Place, and Thing, each with a personal rationale explaining why it matters to them.

Study their selections carefully. The rationales reveal what they truly value — not just surface preferences, but deeper emotional connections, aesthetics, and worldview.

## Their Crate

${slots}
${history}
## Your Task

Recommend exactly 3 thoughtful, specific gift ideas for this person. Each gift should:
- Connect meaningfully to their stated values and taste (reference specific rationales)
- Be a real, purchasable product or experience (not generic categories)
- Range from accessible ($20-50) to premium ($200+)
- Surprise and delight — go beyond the obvious${excludeBlock}

Respond with a JSON array of exactly 3 objects, each with these fields:
- "name": specific product/experience name
- "description": 1-2 sentences on what it is
- "priceRange": e.g. "$30-50" or "$150-200"
- "whyTheyLoveIt": 1-2 sentences connecting this gift to their specific Crate selections and rationales

Return ONLY the JSON array, no other text.`;
}

function formatSlots(canon: CanonRecord): string {
  const lines: string[] = [];

  for (const category of canonCategories) {
    const slot = canon.canon[category];
    if (!slot) continue;
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    lines.push(`**${label}:** ${slot.title}`);
    lines.push(`Why: ${slot.rationale}`);
    lines.push('');
  }

  return lines.join('\n');
}

function formatEvolutions(evolutions: CanonEvolutionRecord[]): string {
  if (evolutions.length === 0) return '';

  const evolveEvents = evolutions.filter((e) => e.change_kind === 'evolve');
  if (evolveEvents.length === 0) return '';

  const lines: string[] = [
    '## Taste Evolution',
    `Their crate has evolved ${evolveEvents.length} time${evolveEvents.length === 1 ? '' : 's'}. Recent changes:`,
  ];

  for (const e of evolveEvents.slice(0, 5)) {
    const label = e.category.charAt(0).toUpperCase() + e.category.slice(1);
    lines.push(`- ${label}: changed from "${e.old_title}" to "${e.new_title}"`);
  }

  lines.push('');
  return lines.join('\n') + '\n';
}
