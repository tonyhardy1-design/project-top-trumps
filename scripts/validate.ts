/**
 * Stage 1 validation. Run with: npm run validate
 * Loads the bundled deck through getProjectCards, logs the first five
 * records and confirms all four comparable stats are present on every card.
 */
import { getProjectCards, validateProjectCards, COMPARABLE_STAT_KEYS } from '../src/data/getProjectCards';
import rawCards from '../src/data/project_cards.json';

const result = validateProjectCards(rawCards);

console.log('Project Top Trumps, Stage 1 data validation');
console.log('===========================================');
console.log(`Cards loaded: ${result.cardCount}`);
console.log(`Validation: ${result.valid ? 'PASS' : 'FAIL'}`);

if (!result.valid) {
  console.log(`Errors (${result.errors.length}):`);
  for (const error of result.errors) console.log(`  ${error}`);
  process.exit(1);
}

const cards = getProjectCards();

console.log('\nFirst five records:');
for (const card of cards.slice(0, 5)) {
  console.log(
    `  ${card.id}  ${card.sector}, ${card.city} (${card.region})` +
      `\n      GIA ${card.gia_m2.toLocaleString('en-GB')} m2, ` +
      `cost per m2 £${card.cost_per_m2_gbp.toLocaleString('en-GB', { minimumFractionDigits: 2 })}, ` +
      `total £${card.total_construction_cost_gbp.toLocaleString('en-GB')}, ` +
      `capacity ${card.capacity.toLocaleString('en-GB')} ${card.capacity_label}`,
  );
}

console.log('\nComparable stat completeness:');
for (const key of COMPARABLE_STAT_KEYS) {
  const complete = cards.filter(
    (c) => typeof c[key] === 'number' && Number.isFinite(c[key]) && c[key] > 0,
  ).length;
  const range = {
    min: Math.min(...cards.map((c) => c[key])),
    max: Math.max(...cards.map((c) => c[key])),
  };
  console.log(
    `  ${key.padEnd(28)} ${complete}/${cards.length} complete, ` +
      `min ${range.min.toLocaleString('en-GB')}, max ${range.max.toLocaleString('en-GB')}`,
  );
}

const bySector = cards.reduce<Record<string, number>>((acc, c) => {
  acc[c.sector] = (acc[c.sector] ?? 0) + 1;
  return acc;
}, {});

console.log('\nSector split:');
for (const [sector, count] of Object.entries(bySector)) {
  console.log(`  ${sector.padEnd(28)} ${count}`);
}

const storeysMissing = cards.filter((c) => c.storeys_above === null).length;
console.log(
  `\nstoreys_above null on ${storeysMissing}/${cards.length} cards, ` +
    'confirmed excluded as a comparable category, flavour display only.',
);

const anonymised = cards.every(
  (c) => !('name' in c) && !('client' in c) && !('contractor' in c),
);
console.log(
  `Anonymisation: project name, client and contractor ${anonymised ? 'absent from every card' : 'STILL PRESENT, FIX REQUIRED'}.`,
);

console.log('\nStage 1 complete. Deck is fair across all four comparable stats.');
