/**
 * Standalone test harness for coaching narrative generation.
 *
 * Run: npx ts-node --transpileOnly src/scripts/testCoachingNarrative.ts
 *
 * Tests the grounding contract (every number must come from input) against a sample
 * of real production coaching cards. Use this to validate the LLM prompt and grounding
 * check before wiring the service into the dashboard.
 */

import { generateCoachingNarrative, CoachingCardData } from '../services/coachingNarrative.service';

// Sample coaching cards extracted from real production data (anonymized).
const SAMPLE_CARDS: CoachingCardData[] = [
  {
    actor: 'Jitesh S Rath',
    level: 'busm',
    qualifies: true,
    wo: 247,
    flags: { ghost: 12, home: 3, cross: 2, bounce: 31, mmb: 8, det: 19, doa: 0 },
    pct: { audit: 89.2, skill: 84.7, process: 91.3 },
    cohort_mean: { audit: 88.5, skill: 86.1, process: 89.8 },
  },
  {
    actor: 'Rajesh Limbachiya',
    level: 'busm',
    qualifies: true,
    wo: 156,
    flags: { ghost: 5, home: 0, cross: 1, bounce: 18, mmb: 4, det: 8, doa: 1 },
    pct: { audit: 92.1, skill: 90.5, process: 88.9 },
    cohort_mean: { audit: 88.5, skill: 86.1, process: 89.8 },
  },
  {
    actor: 'Shivrprasad P U',
    level: 'busm',
    qualifies: true,
    wo: 189,
    flags: { ghost: 28, home: 11, cross: 3, bounce: 42, mmb: 15, det: 31, doa: 2 },
    pct: { audit: 81.6, skill: 76.3, process: 85.2 },
    cohort_mean: { audit: 88.5, skill: 86.1, process: 89.8 },
  },
  {
    actor: 'Low-Volume ASM',
    level: 'asm',
    qualifies: false, // Should return null narrative
    wo: 12,
    flags: { ghost: 0, home: 0, cross: 0, bounce: 2, mmb: 1, det: 1, doa: 0 },
    pct: { audit: 85.0, skill: 88.0, process: 87.5 },
    cohort_mean: { audit: 88.5, skill: 86.1, process: 89.8 },
  },
];

async function runTests() {
  console.log('🧪 Coaching Narrative Generation Tests\n');
  console.log('Testing grounding contract: every number in narrative must come from input.\n');

  let passed = 0;
  let failed = 0;

  for (const card of SAMPLE_CARDS) {
    const testLabel = `${card.level.toUpperCase()}: ${card.actor} (${card.wo} WOs)`;
    process.stdout.write(`Testing ${testLabel}... `);

    const result = await generateCoachingNarrative(card);

    if (!result.narrative) {
      if (!card.qualifies) {
        console.log('✓ Correctly skipped (low volume)');
        passed++;
      } else if (result.groundingCheckFailed) {
        console.log('✗ FAILED grounding check');
        console.log(`   Narrative was: "${result.narrative}"`);
        failed++;
      } else if (result.error) {
        console.log(`⚠ Error: ${result.error}`);
        failed++;
      } else {
        console.log('⚠ Returned null narrative (API issue or low volume)');
        failed++;
      }
    } else {
      console.log('✓ Passed');
      console.log(`   Narrative: "${result.narrative.substring(0, 120)}..."`);
      passed++;
    }
    console.log();
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

  // Second pass — same inputs should hit the DB cache instead of calling the LLM again.
  console.log('\n🔁 Re-running same cards to confirm cache hit (should be near-instant, no LLM call)...\n');
  const cacheStart = Date.now();
  for (const card of SAMPLE_CARDS.filter((c) => c.qualifies)) {
    await generateCoachingNarrative(card);
  }
  const cacheElapsedMs = Date.now() - cacheStart;
  console.log(`Cache-hit pass took ${cacheElapsedMs}ms for ${SAMPLE_CARDS.filter((c) => c.qualifies).length} cards (should be well under 1s if caching works — an LLM round trip alone is typically 1-3s per card).`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Test harness error:', err);
  process.exit(1);
});
