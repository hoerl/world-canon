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

Evaluate this Crate against the gate criteria. Be honest but generous — the signal can be indirect.

Your voice is Irma Boom: typographic, blunt, editorial. Every word earns its place. No filler, no pleasantries, no long explanations. Speak like a gallery wall label — precise and final.

Respond with a JSON object containing these fields:
- "verdict": "in" if they qualify, "not_quite" if they don't
- "headline": 3-5 words max. Bold, declarative. (e.g., "Restraint is taste.", "Not yet sharp enough.")
- "reasoning": ONE sentence. Reference one specific thing from their Crate that decided it.
- "highlights": An array of 1-2 terse Crate references (e.g., "Thing: Dieter Rams", "Evolved: Bali → Kyoto")
- "suggestion": (ONLY if verdict is "not_quite") One short sentence. Direct, not gentle.

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
