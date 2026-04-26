import { normalizeCanonTitle } from '@/features/canon/domain';

type SeedProfile = {
  slug: string;
  username: string;
  person: { title: string; rationale: string; tags: string[] };
  place: { title: string; rationale: string; tags: string[] };
  thing: { title: string; rationale: string; tags: string[] };
};

export const twinSeedProfiles: SeedProfile[] = [
  {
    slug: 'luna-7',
    username: 'luna',
    person: {
      title: 'Hayao Miyazaki',
      rationale: 'Proved that gentleness can be the most radical creative act',
      tags: ['animation', 'storytelling', 'craft'],
    },
    place: {
      title: 'Kyoto moss gardens in November',
      rationale: 'Time moves differently when everything is green and quiet',
      tags: ['nature', 'stillness', 'japan'],
    },
    thing: {
      title: 'Kind of Blue',
      rationale: 'The first album that taught me music can feel like weather',
      tags: ['jazz', 'classic', 'mood'],
    },
  },
  {
    slug: 'rami-3',
    username: 'rami',
    person: {
      title: 'Dieter Rams',
      rationale: 'Made restraint look easy — nothing unnecessary, nothing missing',
      tags: ['design', 'minimalism', 'function'],
    },
    place: {
      title: 'Naoshima Island',
      rationale: 'Where art and landscape stop being separate ideas',
      tags: ['art', 'architecture', 'japan'],
    },
    thing: {
      title: 'Blade Runner',
      rationale: 'Every frame asks what it means to be real. Still no answer.',
      tags: ['cinema', 'sci-fi', 'mood'],
    },
  },
  {
    slug: 'sol-9',
    username: 'sol',
    person: {
      title: 'James Baldwin',
      rationale: 'Wrote sentences that dismantle you and put you back together better',
      tags: ['literature', 'truth', 'courage'],
    },
    place: {
      title: 'A kitchen at midnight',
      rationale: 'The only honest room in any house, especially when it is dark',
      tags: ['home', 'solitude', 'ritual'],
    },
    thing: {
      title: 'Stalker by Tarkovsky',
      rationale: 'Slow enough to teach you how to pay attention again',
      tags: ['cinema', 'philosophy', 'patience'],
    },
  },
  {
    slug: 'iris-5',
    username: 'iris',
    person: {
      title: 'Virgil Abloh',
      rationale: 'Showed that culture is a conversation, not a category',
      tags: ['design', 'culture', 'vision'],
    },
    place: {
      title: 'Lisbon tram 28 at golden hour',
      rationale: 'A city that feels like it remembers everything and forgives it all',
      tags: ['travel', 'light', 'europe'],
    },
    thing: {
      title: 'Slowdive — Souvlaki',
      rationale: 'Music that sounds like being inside a feeling',
      tags: ['shoegaze', 'classic', 'mood'],
    },
  },
  {
    slug: 'kai-2',
    username: 'kai',
    person: {
      title: 'Ryuichi Sakamoto',
      rationale: 'Moved between worlds — pop, cinema, installation — without losing himself',
      tags: ['music', 'craft', 'range'],
    },
    place: {
      title: 'Bangkok after rain',
      rationale: 'The air changes and the whole city exhales',
      tags: ['travel', 'sensory', 'asia'],
    },
    thing: {
      title: 'The Master and Margarita',
      rationale: 'Absurdity as the only sane response to power',
      tags: ['literature', 'surreal', 'classic'],
    },
  },
  {
    slug: 'nova-8',
    username: 'nova',
    person: {
      title: 'Hayao Miyazaki',
      rationale: 'His worlds have weather and weight — nothing is filler',
      tags: ['animation', 'worldbuilding', 'heart'],
    },
    place: {
      title: 'The courtyard of Casa Barragán',
      rationale: 'Color and silence in perfect proportion',
      tags: ['architecture', 'color', 'mexico'],
    },
    thing: {
      title: 'Blade Runner',
      rationale: 'The city is the real character. Everything human is uncertain.',
      tags: ['cinema', 'sci-fi', 'atmosphere'],
    },
  },
];

export function buildSeedRows() {
  return twinSeedProfiles.map((profile) => ({
    user: {
      worldSessionId: `session_seed_${profile.slug}` as `session_${string}`,
      publicSlug: profile.slug,
      worldUsername: profile.username,
      walletAddress: `0xseed${profile.slug.replace(/[^a-z0-9]/g, '')}`.padEnd(42, '0'),
      verificationLevel: 'proof_of_human',
    },
    items: (['person', 'place', 'thing'] as const).map((category) => ({
      category,
      title: profile[category].title,
      titleNormalized: normalizeCanonTitle(profile[category].title),
      rationale: profile[category].rationale,
      tags: profile[category].tags,
    })),
  }));
}
