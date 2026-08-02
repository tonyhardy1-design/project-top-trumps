import rawCards from './project_cards.json';
import type { ProjectCard, ComparableStatKey } from './types';

/**
 * Single data access point for the card deck.
 *
 * Version one loads the bundled project_cards.json. A future version can
 * redirect this one function to a Supabase query (returning a Promise of
 * the same ProjectCard shape) without touching game logic or UI.
 */
export function getProjectCards(): ProjectCard[] {
  const result = validateProjectCards(rawCards);
  if (!result.valid) {
    throw new Error(
      `project_cards.json failed validation with ${result.errors.length} error(s). First error: ${result.errors[0]}`,
    );
  }
  return (rawCards as Omit<ProjectCard, 'number'>[]).map((card, index) => ({
    ...card,
    number: index + 1,
  }));
}

export const COMPARABLE_STAT_KEYS: readonly ComparableStatKey[] = [
  'gia_m2',
  'cost_per_m2_gbp',
  'total_construction_cost_gbp',
  'capacity',
];

export interface ValidationResult {
  valid: boolean;
  cardCount: number;
  errors: string[];
}

/**
 * Confirms every card carries a usable value for all four comparable
 * stats (present, numeric, finite and greater than zero), plus basic
 * identity fields. Fails loudly rather than letting an unfair deck
 * reach the game.
 */
export function validateProjectCards(cards: unknown): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(cards)) {
    return { valid: false, cardCount: 0, errors: ['Data source is not an array'] };
  }

  const seenIds = new Set<string>();

  cards.forEach((card, index) => {
    const c = card as Record<string, unknown>;
    const label = typeof c.id === 'string' ? c.id : `index ${index}`;

    if (typeof c.id !== 'string' || c.id.length === 0) {
      errors.push(`${label}: missing or empty id`);
    } else if (seenIds.has(c.id)) {
      errors.push(`${label}: duplicate id`);
    } else {
      seenIds.add(c.id);
    }

    if (c.sector !== 'Residential' && c.sector !== 'Student Accommodation') {
      errors.push(`${label}: unexpected sector "${String(c.sector)}"`);
    }

    if (c.capacity_label !== 'Beds' && c.capacity_label !== 'Units') {
      errors.push(`${label}: unexpected capacity_label "${String(c.capacity_label)}"`);
    }

    for (const key of COMPARABLE_STAT_KEYS) {
      const value = c[key];
      if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
        errors.push(`${label}: comparable stat ${key} is missing or invalid (${String(value)})`);
      }
    }
  });

  return { valid: errors.length === 0, cardCount: cards.length, errors };
}
