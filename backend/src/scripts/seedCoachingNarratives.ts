/**
 * Writes chat-drafted coaching narratives into the CoachingNarrative cache.
 *
 * "Chat bridge" mode: instead of the server calling the Anthropic API itself
 * (which needs CLAUDE_API_KEY configured), narratives are drafted in a chat
 * session against the SAME grounding contract (see coachingNarrative.service.ts's
 * GROUNDING_SYSTEM_PROMPT) and passed in here as a JSON file. Each entry still
 * goes through the real grounding check — storeChatBridgeNarrative() rejects
 * any narrative referencing a number not present in that card's own data — so
 * a chat-drafted narrative isn't trusted any more than an API-drafted one.
 *
 * Input file shape (array):
 * [
 *   {
 *     "actor": "Jitesh S Rath",
 *     "level": "busm",
 *     "qualifies": true,
 *     "wo": 247,
 *     "flags": { "ghost": 12, "home": 3, "cross": 2, "bounce": 31, "mmb": 8, "det": 19, "doa": 0 },
 *     "pct": { "audit": 89.2, "skill": 84.7, "process": 91.3 },
 *     "cohort_mean": { "audit": 88.5, "skill": 86.1, "process": 89.8 },
 *     "narrative": "This centre shows 12 same-day board swaps..."
 *   },
 *   ...
 * ]
 *
 * Run:
 *   docker compose exec lava-api npx ts-node --transpileOnly src/scripts/seedCoachingNarratives.ts /path/to/narratives.json
 */

import fs from 'fs';
import { CoachingCardData, storeChatBridgeNarrative } from '../services/coachingNarrative.service';

interface SeedEntry extends CoachingCardData {
  narrative: string;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: seedCoachingNarratives.ts <path-to-json-file>');
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const entries: SeedEntry[] = JSON.parse(raw);

  let stored = 0;
  let rejected = 0;

  for (const entry of entries) {
    const { narrative, ...card } = entry;
    const result = await storeChatBridgeNarrative(card, narrative);

    if (result.groundingCheckFailed) {
      console.log(`✗ REJECTED (grounding check failed): ${card.level}/${card.actor}`);
      console.log(`   Narrative: "${narrative}"`);
      rejected++;
    } else {
      console.log(`✓ Stored: ${card.level}/${card.actor}`);
      stored++;
    }
  }

  console.log(`\nDone: ${stored} stored, ${rejected} rejected.`);
  process.exit(rejected > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Failed to seed coaching narratives:', err);
  process.exit(1);
});
