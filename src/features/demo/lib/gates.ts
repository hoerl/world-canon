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
    id: 'a24-premiere',
    name: 'A24 Premiere',
    tagline: 'Invited screening. Limited seats.',
    criteria: 'Cinematic sensibility that goes beyond mainstream taste',
    evaluationPrompt: `Evaluate whether this person's Crate signals the kind of cinematic and storytelling sensibility that belongs at an A24 premiere — not a Marvel fan, but someone who gravitates toward auteur vision, emotional texture, and cultural specificity. Look for:
- Person slot referencing filmmakers, writers, musicians, or visual artists whose work has narrative depth or auteur sensibility
- Place slot suggesting atmospheric awareness — locations chosen for mood, memory, or meaning rather than tourism
- Thing slot pointing to objects, media, or artifacts that reward slow attention (books, vinyl, analog tools, artisan craft)
- Rationales that reveal emotional intelligence — WHY something resonates, not just surface admiration
- Evolution arc showing taste that deepens rather than chases trends
Someone whose Crate reads like a mainstream playlist does NOT qualify. Someone whose taste suggests they'd sit through a 3-hour slow burn and feel something DOES.`,
  },
];

export function getGateById(id: string): TasteGate | undefined {
  return TASTE_GATES.find((g) => g.id === id);
}
