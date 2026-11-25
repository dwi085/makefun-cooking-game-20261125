// Sizzle & Serve — entrypoint.
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with the kit's buildDossier.
// Runs on Node 22, standard library only, no network, no environment
// secrets: everything it reads ships in this repository.
// The output directory is /output, or MAKEFUN_OUTPUT_DIR when set
// (local runs). The repository root is the directory holding this file,
// never the process working directory, so the grader may run it from
// anywhere.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Fail loudly, before touching the output, if a source directory is missing.
for (const needed of ['game', 'screenshots']) {
  if (!existsSync(join(repoRoot, needed))) {
    throw new Error('missing source directory in repository: ' + needed);
  }
}

// Start from a clean output directory so a stale file can never leak in.
// Delete only the directory's CONTENTS, never the directory itself: the
// grader may hand us an /output owned by another user, and removing it
// would fail with EPERM (this exact crash killed an earlier entry).
mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  rmSync(join(outDir, entry), { recursive: true, force: true });
}

// Copy the playable game and its screenshots, in full.
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// The dossier is byte for byte what the kit's library writes from them.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log('Sizzle & Serve handed in: game/ + screenshots/ + dossier.json -> ' + outDir);
