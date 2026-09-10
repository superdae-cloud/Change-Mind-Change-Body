export interface PageField {
  label: string;
  name: string;
  multiline?: boolean;
}

export const PAGE_FIELDS: Record<string, PageField[]> = {
  home: [
    { label: 'Hero Eyebrow', name: 'heroEyebrow' },
    { label: 'Hero Title', name: 'heroTitle' },
    { label: 'Hero Subtitle', name: 'heroSubtitle', multiline: true },
    { label: 'Hero Button Label', name: 'heroButtonLabel' },
    { label: 'Mission Eyebrow', name: 'missionEyebrow' },
    { label: 'Mission Heading', name: 'missionHeading' },
    { label: 'Mission Body', name: 'missionBody', multiline: true },
    { label: 'Mission Button Label', name: 'missionButtonLabel' },
    { label: 'Pillars Eyebrow', name: 'pillarsEyebrow' },
    { label: 'Pillars Heading', name: 'pillarsHeading' },
    { label: 'Recent Picks Eyebrow', name: 'recentPicksEyebrow' },
    { label: 'Recent Picks Heading', name: 'recentPicksHeading' },
    { label: 'Ask Eyebrow', name: 'askEyebrow' },
    { label: 'Ask Heading', name: 'askHeading' },
  ],
  about: [
    { label: 'Hero Eyebrow', name: 'heroEyebrow' },
    { label: 'Hero Title', name: 'heroTitle' },
    { label: 'Hero Subtitle', name: 'heroSubtitle', multiline: true },
    { label: 'Why Eyebrow', name: 'whyEyebrow' },
    { label: 'Why Heading', name: 'whyHeading' },
    { label: 'Why Paragraph 1', name: 'whyParagraph1', multiline: true },
    { label: 'Why Paragraph 2', name: 'whyParagraph2', multiline: true },
    { label: 'Free Eyebrow', name: 'freeEyebrow' },
    { label: 'Free Heading', name: 'freeHeading' },
    { label: 'Free Paragraph', name: 'freeParagraph', multiline: true },
    { label: 'Pillars Eyebrow', name: 'pillarsEyebrow' },
    { label: 'Pillars Heading', name: 'pillarsHeading' },
    { label: 'Closing Heading', name: 'closingHeading' },
    { label: 'Closing Paragraph', name: 'closingParagraph', multiline: true },
  ],
};
