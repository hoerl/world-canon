import { CanonCategory } from '@/features/canon/domain';

export const demoEarthSeed: Record<CanonCategory, Array<{ title: string; votes: number }>> = {
  person: [
    { title: 'Agnes Martin', votes: 6 },
    { title: 'James Baldwin', votes: 5 },
    { title: 'Octavia Butler', votes: 4 },
  ],
  place: [
    { title: 'Parc des Buttes-Chaumont at dawn', votes: 6 },
    { title: 'Bangkok after rain', votes: 5 },
    { title: 'A kitchen at midnight', votes: 4 },
  ],
  thing: [
    { title: 'Andrei Rublev', votes: 6 },
    { title: 'A notebook with torn edges', votes: 5 },
    { title: 'A favorite bowl', votes: 4 },
  ],
};
