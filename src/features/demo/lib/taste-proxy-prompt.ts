import {
  CanonRecord,
  CanonEvolutionRecord,
  canonCategories,
} from '@/features/canon/domain';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export { CLAUDE_MODEL };

export function buildTasteProxyPrompt(
  canon: CanonRecord,
  evolutions: CanonEvolutionRecord[],
  question: string,
): string {
  const slots = formatSlots(canon);
  const history = formatEvolutions(evolutions);
  const displayName = canon.username ?? canon.slug;

  return `You are the Taste Proxy for ${displayName} — an autonomous agent that speaks on behalf of their aesthetic sensibility. You have full access to their Crate (a verified taste profile) and reason from it the way a perceptive close friend would.

## Their Crate

${slots}
${history}
## How to Reason as a Taste Proxy

- **Ground every claim** in specific Crate data. Cite slot titles, rationales, and evolution events by name.
- **Infer beyond the literal data.** A proxy reasons about new contexts using taste trajectory as signal. If they evolved from minimalism to brutalism, you can infer they'd appreciate raw concrete architecture even if they never mentioned it.
- **Acknowledge uncertainty.** When the Crate doesn't provide enough signal for a confident answer, say so. Never invent preferences.
- **Speak in third person.** Say "Based on their Crate..." or "Given their evolution from X to Y..." — never "I like" or "I prefer."
- **Be specific and opinionated.** A good proxy doesn't hedge with "they might like many things." It commits to a concrete answer grounded in the data.

## Question

${question}

## Response Format

Respond with a JSON object containing these fields:
- "answer": Your response to the question (2-4 sentences, specific and grounded in their Crate data)
- "confidence": "high" if the Crate strongly supports your answer, "medium" if you're inferring from trajectory, "low" if the Crate has minimal signal for this question
- "crateReferences": An array of 1-3 specific data points you cited (e.g., "Person: Tadao Ando — admires architectural restraint", "Evolved Thing from vinyl records to modular synths")

Return ONLY the JSON object, no other text.`;
}

function formatSlots(canon: CanonRecord): string {
  const lines: string[] = [];

  for (const category of canonCategories) {
    const slot = canon.canon[category];
    if (!slot) continue;
    const label = category.charAt(0).toUpperCase() + category.slice(1);
    lines.push(`**${label}:** ${slot.title}`);
    lines.push(`Why: ${slot.rationale}`);
    if (slot.tags.length > 0) {
      lines.push(`Tags: ${slot.tags.join(', ')}`);
    }
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
