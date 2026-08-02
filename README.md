# Project Top Trumps

A browser card game built from anonymised Stace cost benchmarking data, covering
Residential and Student Accommodation projects only. One player takes on the
computer, each round the chooser picks a stat and the better value takes the
cards. Built for staff events and graduate cost benchmarking training.

All project names, clients and contractors have been removed from the bundled
dataset. Cards show sector, city and region alongside four comparable stats:
GIA, cost per m² (building works), total construction cost and capacity.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run validate      # data completeness and anonymisation checks
npx tsx scripts/simulate.ts   # engine rule simulation
npm run build         # typecheck and production build
```

Deployed automatically to GitHub Pages on push to main.
