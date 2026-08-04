/**
 * Dumps the real, current coaching cards (all levels) as JSON to stdout.
 * Runs inside the container so it needs no auth token — it calls the same
 * function the dashboard API route calls, directly.
 *
 * Run:
 *   docker compose exec lava-api npx ts-node --transpileOnly src/scripts/exportCoachingCards.ts > coaching-cards.json
 *
 * Paste the output (or the relevant slice of it) into chat so a narrative
 * can be drafted per card — see seedCoachingNarratives.ts for how the drafted
 * narratives get written back into the DB.
 */

import { getFullDashboardData } from '../services/dashboard.service';

async function main() {
  const data = await getFullDashboardData();
  // Only the coaching section is relevant — trim everything else out.
  process.stdout.write(JSON.stringify(data.coaching, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to export coaching cards:', err);
  process.exit(1);
});
