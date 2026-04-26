export type TasteGate = {
  id: string;
  name: string;
  tagline: string;
  criteria: string;
  evaluationPrompt: string;
};

export const TASTE_GATES: TasteGate[] = [
  {
    id: 'the-salon',
    name: 'The Salon',
    tagline: 'A supper club for evolved palates',
    criteria: 'Genuine food and dining evolution in your taste trajectory',
    evaluationPrompt: `Evaluate whether this person's Crate reveals a genuine, evolved relationship with food, dining, or culinary culture. Look for:
- Place and Thing slots that signal culinary awareness (restaurants, ingredients, kitchen objects, food regions)
- Rationales that go beyond "I like the food" to demonstrate aesthetic sensibility about dining — atmosphere, craft, provenance, tradition
- Evolution history showing deepening engagement (not just switching between trending spots)
- Cross-slot coherence: does their Person or other slots reinforce a sensory, experiential worldview?
A surface-level foodie who name-drops popular restaurants does NOT qualify. Someone whose taste arc reveals genuine culinary curiosity and depth DOES.`,
  },
  {
    id: 'first-drop',
    name: 'First Drop',
    tagline: 'Design credibility over hype',
    criteria: 'Aesthetic taste trajectory built on independent discovery, not trends',
    evaluationPrompt: `Evaluate whether this person's Crate shows authentic design and aesthetic credibility — the kind that comes from independent discovery, not following hype. Look for:
- Thing slot showing awareness of design, craft, or material culture (objects, tools, garments, architecture)
- Person slot demonstrating cultural influence literacy (creators, designers, artists — not just mainstream celebrities)
- Evolution arc showing independent discovery: did they find things before they were popular, or evolve AWAY from mainstream toward niche?
- Rationales that articulate WHY something matters aesthetically, not just THAT they like it
A trend-follower who picks whatever is currently hyped does NOT qualify. Someone whose trajectory shows they discover and commit to aesthetic positions independently DOES.`,
  },
  {
    id: 'curators-circle',
    name: "Curator's Circle",
    tagline: 'Art Basel tier taste coherence',
    criteria: 'Cross-slot aesthetic coherence and intellectual curiosity',
    evaluationPrompt: `Evaluate whether this person's Crate tells a coherent creative story across all three slots — the kind of taste alignment that would earn them a seat at Art Basel's most interesting dinner table. Look for:
- Cross-slot coherence: do their Person, Place, and Thing selections tell a consistent aesthetic narrative? (e.g., a brutalist architect + a raw concrete city + a monograph on materiality)
- Intellectual curiosity in evolution: are they exploring and refining their taste, or static?
- Rationales that demonstrate "why" over "what" — articulating aesthetic principles, not just preferences
- A worldview that connects culture, space, and objects into a personal philosophy
Someone with random, disconnected picks across slots does NOT qualify. Someone whose three choices reveal a unified creative sensibility — even if eclectic — DOES.`,
  },
  {
    id: 'the-group-chat',
    name: 'The Group Chat',
    tagline: 'Taste-gated Telegram. No lurkers.',
    criteria: 'Would your taste add signal to the conversation, or just noise?',
    evaluationPrompt: `Evaluate whether this person's Crate earns them a seat in a taste-gated Telegram group chat — a small, opinionated cultural conversation where every member pulls their weight. This is NOT about matching a single aesthetic. Look for:
- Strong positions: do their rationales show conviction, not hedging? A good group chat member has TAKES, not just preferences
- Specificity over breadth: do they pick precise, defensible choices or vague crowd-pleasers?
- Complementary angles: would their Person/Place/Thing combination bring a perspective the group doesn't already have? Eclectic is good. Generic is not.
- Evolution that shows engagement: have they changed their mind? Argued with their own past taste? That's the person who makes a group chat interesting.
- The lurker test: could you imagine them STARTING a conversation thread, not just reacting to one?
Someone whose Crate reads like safe, consensus taste does NOT qualify. Someone who'd drop a hot take at 2am that starts a 47-message thread DOES.`,
  },
];

export function getGateById(id: string): TasteGate | undefined {
  return TASTE_GATES.find((g) => g.id === id);
}
