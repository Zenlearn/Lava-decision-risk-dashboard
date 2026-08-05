/**
 * Dumps the real, current coaching cards as JSON to a FILE (not stdout — a large
 * stdout.write() immediately followed by process.exit() can get truncated before
 * the pipe finishes flushing to a redirected file; fs.writeFileSync is synchronous
 * and doesn't have that problem).
 *
 * Runs inside the container so it needs no auth token — it calls the same
 * function the dashboard API route calls, directly.
 *
 * Run (all levels):
 *   docker compose exec lava-api npx ts-node --transpileOnly src/scripts/exportCoachingCards.ts
 *
 * Run (just one level, e.g. to keep the file small enough to paste into chat):
 *   docker compose exec lava-api npx ts-node --transpileOnly src/scripts/exportCoachingCards.ts busm
 *
 * Writes to /app/coaching-cards.json inside the container — copy out with:
 *   docker compose cp lava-api:/app/coaching-cards.json ./coaching-cards.json
 * or just cat it directly:
 *   docker compose exec lava-api cat /app/coaching-cards.json
 *
 * Paste the output (or the relevant slice) into chat so a narrative can be
 * drafted per card — see seedCoachingNarratives.ts for how the drafted
 * narratives get written back into the DB.
 */

import fs from 'fs';
import { getFullDashboardData } from '../services/dashboard.service';

async function main() {
  const levelArg = process.argv[2]; // 'busm' | 'asm' | 'asp' | undefined (= all)
  const data = await getFullDashboardData();

  const output = levelArg ? data.coaching[levelArg] : data.coaching;
  if (levelArg && !output) {
    console.error(`Unknown level "${levelArg}" — expected busm, asm, or asp.`);
    process.exit(1);
  }

  const outPath = '/app/coaching-cards.json';
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath} (${fs.statSync(outPath).size} bytes)`);
}

main()
  .catch((err) => {
    console.error('Failed to export coaching cards:', err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
