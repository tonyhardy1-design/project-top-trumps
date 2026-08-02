// One off anonymisation for the public event build. Removes project name,
// client and contractor from the bundled deck so they cannot be recovered
// from the shipped JavaScript bundle. The full source dataset remains in
// the parent folder (project_cards.json) untouched.
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../src/data/project_cards.json', import.meta.url);
const cards = JSON.parse(readFileSync(path, 'utf8'));

const stripped = cards.map(({ name, client, contractor, ...rest }) => rest);
writeFileSync(path, JSON.stringify(stripped, null, 2) + '\n');

const residual = JSON.stringify(stripped);
console.log(`Stripped name, client and contractor from ${stripped.length} cards`);
for (const field of ['"name"', '"client"', '"contractor"']) {
  console.log(`Residual ${field} fields: ${residual.includes(field) ? 'FOUND, FIX REQUIRED' : 'none'}`);
}
