import pillarsData from "./pillars.json";

export interface Pillar {
  slug:
    | "exercise"
    | "diet"
    | "supplements"
    | "mental-health"
    | "immune-health"
    | "bro-science";
  title: string;
  emoji: string;
  blurb: string;
  color: string;
}

export const pillars: Pillar[] = pillarsData as Pillar[];
