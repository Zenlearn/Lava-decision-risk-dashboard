import crypto from 'crypto';
import { Anthropic } from '@anthropic-ai/sdk';
import logger from '../configs/logger.config';
import prisma from '../configs/prisma.config';
import { getSystemConfig } from './systemConfig.service';

export interface CoachingCardData {
  actor: string;
  level: 'busm' | 'asm' | 'asp';
  qualifies: boolean;
  wo: number;
  flags: {
    ghost: number;
    home: number;
    cross: number;
    bounce: number;
    mmb: number;
    det: number;
    doa: number;
  };
  pct: {
    audit: number;
    skill: number;
    process: number;
  };
  cohort_mean: {
    audit: number;
    skill: number;
    process: number;
  };
}

interface NarrativeResult {
  narrative: string | null;
  error?: string;
  groundingCheckFailed?: boolean;
}

/**
 * Generates a short, grounded narrative synthesis for a coaching card's talking points.
 * The narrative connects multiple signals from the card data but never invents numbers —
 * every number output is validated against the input set.
 *
 * Anti-hallucination strategy:
 * - Prompt explicitly forbids inference, causation, or outcomes not in the data.
 * - Post-generation regex extracts every number and rejects if any don't appear in input.
 * - Falls back gracefully to null (frontend just hides this block) on any failure.
 *
 * Two ways a narrative gets written:
 * 1. generateCoachingNarrative() — calls the Anthropic API directly (needs CLAUDE_API_KEY
 *    in SystemConfig). Used once this is wired into the live recompute pipeline.
 * 2. storeChatBridgeNarrative() — for now, narratives are drafted in a chat session
 *    (following the exact same grounding contract below) and written straight to the
 *    cache table via this function. No API key needed on the server at all for this path.
 *    Same grounding validation runs either way — a chat-drafted narrative that references
 *    a number not in the input is rejected exactly like an API-drafted one.
 */

export const GROUNDING_SYSTEM_PROMPT = `You are a coaching narrative generator for service centre performance data.

YOUR CONSTRAINTS:
1. Write ONE short paragraph (3-4 sentences) synthesizing the flag counts and scores provided.
2. Every number you write must appear EXACTLY as shown in the input JSON.
3. You CANNOT infer causation, intent, or root causes beyond what the data literally shows.
4. You CANNOT suggest interventions, outcomes, or recommendations.
5. You CANNOT invent new metrics or statistics.
6. Restate facts only. Connect observed signals without editorializing.

EXAMPLE INPUT:
{
  "actor": "Jitesh S Rath",
  "wo": 247,
  "flags": { "ghost": 12, "home": 3, "bounce": 31, "mmb": 8, "det": 19, "doa": 0, "cross": 2 },
  "pct": { "audit": 89.2, "skill": 84.7, "process": 91.3 },
  "cohort_mean": { "audit": 88.5, "skill": 86.1, "process": 89.8 }
}

EXAMPLE OUTPUT (valid):
"This centre shows 12 same-day board swaps and 31 repeat bounces across 247 workorders, with audit and skill scores at 89.2 and 84.7 respectively — below the cohort average in skill. The 19 detractor ratings suggest diagnostic accuracy gaps correlate with repeat visits."

NOT VALID (invents causes/recommendations):
"The high bounce rate points to inadequate technician training, likely requiring skill certification."

NOT VALID (uses invented numbers):
"About 35% of workorders involved board swaps..."

NOT VALID (editorializes):
"This is a concerning pattern that must be addressed urgently."

YOUR JOB:
Take the input data below and write a single grounded paragraph connecting the flags and scores without inventing anything.
`;

/**
 * Stable hash of the inputs that drive the narrative — used to detect when a
 * re-import changed the numbers (cache key is (level, actor); this hash is what
 * decides "reuse the cached narrative" vs "the underlying numbers moved, regenerate").
 */
export function hashCardInputs(card: Pick<CoachingCardData, 'wo' | 'flags' | 'pct' | 'cohort_mean'>): string {
  const stable = {
    wo: card.wo,
    flags: card.flags,
    pct: card.pct,
    cohort_mean: card.cohort_mean,
  };
  return crypto.createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+\.?\d*/g) || [];
  return matches.map((m) => parseFloat(m));
}

export function validateGrounding(narrative: string, input: Pick<CoachingCardData, 'wo' | 'flags' | 'pct' | 'cohort_mean'>): boolean {
  const narrativeNumbers = extractNumbers(narrative);
  const validNumbers = new Set<number>();

  validNumbers.add(input.wo);
  Object.values(input.flags).forEach((v) => validNumbers.add(v));
  Object.values(input.pct).forEach((v) => {
    // Round to 1 decimal place for comparison (LLM may output 89.2 vs 89.20)
    validNumbers.add(Math.round(v * 10) / 10);
  });
  Object.values(input.cohort_mean).forEach((v) => {
    validNumbers.add(Math.round(v * 10) / 10);
  });

  for (const num of narrativeNumbers) {
    const rounded = Math.round(num * 10) / 10;
    if (!validNumbers.has(num) && !validNumbers.has(rounded)) {
      logger.warn('Grounding check: narrative number not in input', { num, validNumbers: Array.from(validNumbers) });
      return false;
    }
  }

  return true;
}

/**
 * Writes a narrative that was drafted elsewhere (a chat session, following the
 * grounding contract above) into the cache — after re-running the same grounding
 * check the API path uses. Rejects (does not store) if the narrative references
 * any number not present in the card's own data.
 */
export async function storeChatBridgeNarrative(
  card: CoachingCardData,
  narrative: string
): Promise<NarrativeResult> {
  if (!validateGrounding(narrative, card)) {
    logger.warn('Chat-bridge narrative failed grounding check', { actor: card.actor, level: card.level });
    return { narrative: null, groundingCheckFailed: true };
  }

  const inputHash = hashCardInputs(card);

  await prisma.coachingNarrative.upsert({
    where: { level_actor: { level: card.level, actor: card.actor } },
    create: { level: card.level, actor: card.actor, inputHash, narrative },
    update: { inputHash, narrative, generatedAt: new Date() },
  });

  return { narrative };
}

/**
 * Generates (or returns the cached) narrative for one coaching card via the
 * Anthropic API directly. Not currently wired into the live recompute pipeline —
 * for now narratives are drafted via storeChatBridgeNarrative() instead, so this
 * function's API-key dependency is dormant until that changes.
 *
 * Caching: keyed by (level, actor). Coaching cards aggregate flags/scores across
 * the entire currently-loaded period, not a single month, so there is no monthly
 * cache dimension — the inputHash is what detects "numbers changed, regenerate."
 */
export async function generateCoachingNarrative(card: CoachingCardData): Promise<NarrativeResult> {
  if (!card.qualifies) {
    // Low volume — skip synthesis
    return { narrative: null };
  }

  const inputHash = hashCardInputs(card);

  const cached = await prisma.coachingNarrative.findUnique({
    where: { level_actor: { level: card.level, actor: card.actor } },
  });
  if (cached && cached.inputHash === inputHash) {
    return { narrative: cached.narrative };
  }

  const apiKey = await getSystemConfig('CLAUDE_API_KEY', 'CLAUDE_API_KEY');
  if (!apiKey) {
    logger.error('CLAUDE_API_KEY not found in SystemConfig or environment — coaching narratives disabled');
    return { narrative: null, error: 'API key not configured' };
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Generate a grounded narrative for this coaching card:

${JSON.stringify(card, null, 2)}

Remember: every number must be from the input, no inferences, no recommendations.`;

  try {
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: GROUNDING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const narrative = (response.content[0] as any).text || '';

    if (!validateGrounding(narrative, card)) {
      logger.warn('Coaching narrative failed grounding check', { actor: card.actor, level: card.level });
      return { narrative: null, groundingCheckFailed: true };
    }

    await prisma.coachingNarrative.upsert({
      where: { level_actor: { level: card.level, actor: card.actor } },
      create: { level: card.level, actor: card.actor, inputHash, narrative },
      update: { inputHash, narrative, generatedAt: new Date() },
    });

    return { narrative };
  } catch (err) {
    logger.error('Error generating coaching narrative', {
      error: err instanceof Error ? err.message : String(err),
      actor: card.actor,
    });
    return { narrative: null, error: String(err) };
  }
}
