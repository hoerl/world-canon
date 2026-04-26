import {
  CanonRecord,
  CanonEvolutionRecord,
  canonCategories,
} from '@/features/canon/domain';
import { TasteGate } from './gates';

const CLAUDE_MODEL = 'claude-sonnet-4-6';

export { CLAUDE_MODEL };

export function buildTasteGatePrompt(
  canon: CanonRecord,
  evolutions: CanonEvolutionRecord[],
  gate: TasteGate,
): string {
  const slots = formatSlots(canon);
  const history = formatEvolutions(evolutions);
  const displayName = canon.username ?? canon.slug;

  return `You are a Taste Gate evaluator. You decide whether a verified human's Crate qualifies them for access to an exclusive cultural experience. Your evaluation must be grounded in their actual Crate data — cite specific slots, rationales, and evolution events.

## The Gate: ${gate.name}

"${gate.tagline}"

### Evaluation Criteria

${gate.evaluationPrompt}

## ${displayName}'s Crate

${slots}
${history}
## Your Task

Evaluate this Crate against the gate criteria above. Be honest but generous — look for genuine signals, not perfection. A Crate doesn't need to be literally about food to qualify for The Salon if the taste trajectory reveals the right sensibility.

Respond with a JSON object containing these fields:
- "verdict": "in" if they qualify, "not_quite" if they don't
- "headline": A short, punchy line (5-8 words) that captures the verdict. For "in": celebrate what makes their taste special. For "not_quite": be encouraging, not dismissive.
- "reasoning": 2-3 sentences explaining your evaluation. Reference specific Crate data (slot titles, rationales, evolution events) to justify your verdict.
- "highlights": An array of 2-3 specific things from their Crate that were most relevant to the evaluation (e.g., "Thing: Dieter Rams — design restraint philosophy", "Evolved Place from Bali to Kyoto — deepening aesthetic")
- "suggestion": (ONLY if verdict is "not_quite") One sentence suggesting what kind of Crate evolution might strengthen their case. Be specific and constructive.

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
