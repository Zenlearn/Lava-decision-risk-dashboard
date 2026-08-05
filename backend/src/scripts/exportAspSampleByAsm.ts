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
  const usedAspNames = new Set<string>(); // an ASP name can appear under >1 ASM in `hier` (data quirk) — don't pick it twice
  const usedBusms = new Set<string>();

  // Round-robin across BUSMs first (one ASM's ASP per BUSM before repeating a BUSM),
  // so a small sample spreads across the org instead of clustering under one BUSM.
  const busmList = Object.keys(hier);
  const asmCursor: Record<string, number> = {}; // per-BUSM index into that BUSM's ASM list, so repeated passes advance

  let progressedThisPass = true;
  while (picks.length < count && progressedThisPass) {
    progressedThisPass = false;

    for (const busm of busmList) {
      if (picks.length >= count) break;

      const asmMap = hier[busm];
      if (!asmMap) continue;
      const asmNames = Object.keys(asmMap);

      let idx = asmCursor[busm] ?? 0;
      while (idx < asmNames.length) {
        const asm = asmNames[idx]!;
        idx += 1;

        const asps = (asmMap[asm] || []).filter((a) => aspCards[a]?.qualifies && !usedAspNames.has(a));
        if (asps.length === 0) continue;

        let bestName = asps[0]!;
        for (const name of asps) {
          if (aspCards[name].wo > aspCards[bestName].wo) bestName = name;
        }

        picks.push({ busm, asm, asp: bestName, card: aspCards[bestName] });
        usedAspNames.add(bestName);
        usedBusms.add(busm);
        progressedThisPass = true;
        break; // move to the next BUSM in this pass, come back to this BUSM's remaining ASMs next pass if still needed
      }
      asmCursor[busm] = idx;
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
