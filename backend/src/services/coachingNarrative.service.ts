import { Anthropic } from '@anthropic-ai/sdk';
import logger from '../configs/logger.config';
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
 */

const GROUNDING_SYSTEM_PROMPT = `You are a coaching narrative generator for service centre performance data.

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

function extractNumbers(text: string): number[] {
  const matches = text.match(/\d+\.?\d*/g) || [];
  return matches.map(m => parseFloat(m));
}

function validateGrounding(narrative: string, input: CoachingCardData): boolean {
  const narrativeNumbers = extractNumbers(narrative);
  const validNumbers = new Set<number>();

  // Collect all numbers from the input
  validNumbers.add(input.wo);
  Object.values(input.flags).forEach(v => validNumbers.add(v));
  Object.values(input.pct).forEach(v => {
    // Round to 1 decimal place for comparison (LLM may output 89.2 vs 89.20)
    validNumbers.add(Math.round(v * 10) / 10);
  });
  Object.values(input.cohort_mean).forEach(v => {
    validNumbers.add(Math.round(v * 10) / 10);
  });

  // Check each number in the narrative
  for (const num of narrativeNumbers) {
    const rounded = Math.round(num * 10) / 10;
    if (!validNumbers.has(num) && !validNumbers.has(rounded)) {
      logger.warn('Grounding check: narrative number not in input', { num, validNumbers: Array.from(validNumbers) });
      return false;
    }
  }

  return true;
}

export async function generateCoachingNarrative(card: CoachingCardData): Promise<NarrativeResult> {
  if (!card.qualifies) {
    // Low volume — skip synthesis
    return { narrative: null };
  }

  // Read from DB first, fall back to env var
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

    // Validate grounding
    if (!validateGrounding(narrative, card)) {
      logger.warn('Coaching narrative failed grounding check', { actor: card.actor, level: card.level });
      return { narrative: null, groundingCheckFailed: true };
    }

    return { narrative };
  } catch (err) {
    logger.error('Error generating coaching narrative', {
      error: err instanceof Error ? err.message : String(err),
      actor: card.actor,
    });
    return { narrative: null, error: String(err) };
  }
}
