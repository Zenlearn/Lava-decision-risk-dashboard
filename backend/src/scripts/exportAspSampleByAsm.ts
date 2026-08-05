/**
 * Picks one representative ASP under each of N distinct ASMs (the highest-
 * workorder qualifying ASP per ASM, so each sample is substantial enough to
 * coach on) and writes them as JSON — for drafting a small, ASM-diverse batch
 * of ASP coaching narratives via chat-bridge mode without dumping all ASP
 * cards (there are hundreds).
 *
 * Run:
 *   docker compose exec lava-api npx ts-node --transpileOnly src/scripts/exportAspSampleByAsm.ts [count]
 *
 * Writes to /app/asp-sample.json inside the container:
 *   docker compose exec lava-api cat /app/asp-sample.json
 */

import fs from 'fs';
import { getFullDashboardData } from '../services/dashboard.service';

async function main() {
  const count = parseInt(process.argv[2] || '5', 10);
  const data = await getFullDashboardData();
  const hier: Record<string, Record<string, string[]>> = data.hier;
  const aspCards: Record<string, any> = data.coaching.asp.cards;

  const picks: { busm: string; asm: string; asp: string; card: any }[] = [];

  outer: for (const busm of Object.keys(hier)) {
    const asmMap = hier[busm];
    if (!asmMap) continue;

    for (const asm of Object.keys(asmMap)) {
      if (picks.some((p) => p.asm === asm)) continue; // guard dup ASM names across BUSMs

      const asps = (asmMap[asm] || []).filter((a) => aspCards[a]?.qualifies);
      if (asps.length === 0) continue;

      let bestName = asps[0]!;
      for (const name of asps) {
        if (aspCards[name].wo > aspCards[bestName].wo) bestName = name;
      }

      picks.push({ busm, asm, asp: bestName, card: aspCards[bestName] });
      if (picks.length >= count) break outer;
    }
  }

  const outPath = '/app/asp-sample.json';
  fs.writeFileSync(outPath, JSON.stringify(picks, null, 2));
  console.log(`Wrote ${outPath} (${picks.length} ASPs across ${new Set(picks.map((p) => p.asm)).size} ASMs, ${fs.statSync(outPath).size} bytes)`);
}

main()
  .catch((err) => {
    console.error('Failed to export ASP sample:', err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
