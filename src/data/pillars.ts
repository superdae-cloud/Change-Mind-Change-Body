export interface Pillar {
  slug: 'exercise' | 'diet' | 'supplements' | 'mental-health' | 'immune-health';
  title: string;
  emoji: string;
  blurb: string;
  color: string;
}

export const pillars: Pillar[] = [
  {
    slug: 'exercise',
    title: 'Exercise',
    emoji: '\u{1F4AA}',
    blurb: 'Simple movement habits that build strength and energy, no gym membership required.',
    color: '#e8622c',
  },
  {
    slug: 'diet',
    title: 'Diet',
    emoji: '\u{1F957}',
    blurb: 'Practical, sustainable eating habits, not another restrictive diet plan.',
    color: '#2c9e4a',
  },
  {
    slug: 'supplements',
    title: 'Supplements',
    emoji: '\u{1F48A}',
    blurb: 'What actually works, what to skip, and how to spend your money wisely.',
    color: '#2c7be5',
  },
  {
    slug: 'mental-health',
    title: 'Mental Health',
    emoji: '\u{1F9E0}',
    blurb: 'Mindset habits for handling stress, building resilience, and staying consistent.',
    color: '#8e44ec',
  },
  {
    slug: 'immune-health',
    title: 'Immune Health',
    emoji: '\u{1F6E1}\u{FE0F}',
    blurb: 'Daily habits that strengthen your body’s natural defenses.',
    color: '#0aa39e',
  },
];
