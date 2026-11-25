# makefun-cooking-game-20261125

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/dwi085/makefun-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/dwi085/makefun-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle & Serve — Hasty Hearth Kitchen.** A complete, original cooking game that runs in a desktop browser from static files, no network needed. Tickets fly in on the order board: grab ingredients from the counter bins, chop the fresh ones on the chopping board, grill the patties (don't let them burn), build the plate, and serve it at the pass before the ticket expires. Three-minute shifts, tips for fast service, combos for streaks, and a service rush in the last minute.

## Run it

```sh
python3 -m http.server --directory game 8000
# then open http://localhost:8000 in desktop Chrome
```

Or serve `game/` with any static file server and open `index.html`.

## How to play

- **Mouse:** click an ingredient bin, the chopping board, the grill, the plate, or the service pass — the chef walks over and uses it.
- **Keys 1–6:** grab bun, patty, cheddar, tomato, lettuce, onion.
- **Space:** use the nearest station. **T:** trash. **P:** pause. **M:** mute.
- Match the plate to an order ticket, then click the service pass to serve. Serve fast for tips; serve three in a row for a combo.

## Layout

- `main.ts` — entrypoint: copies `game/` + `screenshots/` to `/output` and writes `dossier.json`.
- `game/` — the playable game (static files only): `index.html` + `src/` (boot, state, input, rendering, sound, screenshot scenes).
- `screenshots/` — real renders of the game's own code.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=h6y3kbkw&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
