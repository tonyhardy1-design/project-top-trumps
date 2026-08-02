export type Sector = 'Residential' | 'Student Accommodation';

export type CapacityLabel = 'Beds' | 'Units';

/**
 * Anonymised for public play. Project name, client and contractor are
 * stripped from the bundled data (scripts/anonymise.mjs), the full source
 * dataset lives outside the app. The id remains internally as a stable
 * React key but is never displayed.
 */
export interface ProjectCard {
  id: string;
  /** Display number, assigned at load. Cards show as "Project 1" etc. */
  number: number;
  sector: Sector;
  city: string;
  region: string;
  gia_m2: number;
  capacity: number;
  capacity_label: CapacityLabel;
  cost_per_m2_gbp: number;
  total_construction_cost_gbp: number;
  storeys_above: number | null;
  frame_type: string;
  contract_type: string;
  tender_process: string;
}

/**
 * The four comparable stats. These are the only fields that may be
 * selected as a round category. storeys_above is deliberately excluded,
 * it is null on 29 of the 121 cards so rounds using it would be unfair.
 */
export type ComparableStatKey =
  | 'gia_m2'
  | 'cost_per_m2_gbp'
  | 'total_construction_cost_gbp'
  | 'capacity';

export type WinningDirection = 'higher' | 'lower';

export interface StatDefinition {
  key: ComparableStatKey;
  label: string;
  direction: WinningDirection;
  format: (value: number, card?: ProjectCard) => string;
}

const gbp = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

export const COMPARABLE_STATS: readonly StatDefinition[] = [
  {
    key: 'gia_m2',
    label: 'GIA',
    direction: 'higher',
    format: (v) => `${number.format(v)} m²`,
  },
  {
    key: 'cost_per_m2_gbp',
    label: 'Cost per m² (building works)',
    direction: 'lower',
    format: (v) => `£${new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`,
  },
  {
    key: 'total_construction_cost_gbp',
    label: 'Total construction cost',
    direction: 'higher',
    format: (v) => gbp.format(v),
  },
  {
    key: 'capacity',
    label: 'Capacity',
    direction: 'higher',
    format: (v, card) => `${number.format(v)} ${card ? card.capacity_label : ''}`.trim(),
  },
] as const;
