import { RULES } from '../configs/fieldMap.config';
import { MasterDataRuleRow } from './types';

/**
 * Skill Score aggregate — "CPC data": repeat-IMEI rate, DOA rate, and part
 * consumption/value breakdown (Accessories/PCBA/TP-LCD/Battery/Sub-PCBA/Others),
 * all sourced from Master Data alone (Rohit's decision — Skill draws only from
 * this file, never from the compliance/audit sheets).
 */

export interface SkillAggregateResult {
  skillScore: number;
  repeatImeiRate: number | null;
  repeatCountDistribution: Record<string, number>;
  doaRate: number | null;
  partConsumption: {
    pcba: number; tpLcd: number; battery: number; subPcba: number; accessories: number; others: number;
  };
  replacementSchemeRate: number | null;
}

export function computeSkillAggregate(rows: MasterDataRuleRow[]): SkillAggregateResult {
  if (rows.length === 0) {
    return {
      skillScore: 100,
      repeatImeiRate: null,
      repeatCountDistribution: {},
      doaRate: null,
      partConsumption: { pcba: 0, tpLcd: 0, battery: 0, subPcba: 0, accessories: 0, others: 0 },
      replacementSchemeRate: null,
    };
  }

  // Repeat IMEI — counted across this ASP-month's rows
  const imeiCounts = new Map<string, number>();
  for (const r of rows) {
    if (!r.imei) continue;
    imeiCounts.set(r.imei, (imeiCounts.get(r.imei) ?? 0) + 1);
  }

  let repeatFlaggedCount = 0;
  const repeatCountDistribution: Record<string, number> = {};
  for (const r of rows) {
    if (!r.imei) continue;
    const count = imeiCounts.get(r.imei) ?? 0;
    if (count > RULES.repeatImei.threshold) {
      repeatFlaggedCount += 1;
      const bucket = count >= 4 ? '4+' : String(count);
      repeatCountDistribution[bucket] = (repeatCountDistribution[bucket] ?? 0) + 1;
    }
  }
  const repeatImeiRate = repeatFlaggedCount / rows.length;

  // DOA
  const doaFlaggedCount = rows.filter((r) => r.doaType !== null && String(r.doaType).trim() !== '').length;
  const doaRate = doaFlaggedCount / rows.length;

  // Replacement scheme usage (Action Code Desc mentions "replacement")
  const replacementCount = rows.filter((r) =>
    (r.actionDesc ?? '').toLowerCase().includes('replacement')
  ).length;
  const replacementSchemeRate = replacementCount / rows.length;

  // Part consumption breakdown — sum of consumption flags across the ASP-month
  const partConsumption = rows.reduce(
    (acc, r) => ({
      pcba: acc.pcba + (r.pcbaConsumption ?? 0),
      tpLcd: acc.tpLcd + (r.tpLcdConsumption ?? 0),
      battery: acc.battery + (r.batteryConsumption ?? 0),
      subPcba: acc.subPcba + (r.subPcbaConsumption ?? 0),
      accessories: acc.accessories + (r.accessoriesConsumption ?? 0),
      others: acc.others + (r.othersConsumption ?? 0),
    }),
    { pcba: 0, tpLcd: 0, battery: 0, subPcba: 0, accessories: 0, others: 0 }
  );

  const skillPenalty = repeatImeiRate * RULES.repeatImei.penalty + doaRate * RULES.doa.penalty;
  const skillScore = Math.max(0, RULES.scoreBaseline - skillPenalty);

  return {
    skillScore,
    repeatImeiRate,
    repeatCountDistribution,
    doaRate,
    partConsumption,
    replacementSchemeRate,
  };
}
