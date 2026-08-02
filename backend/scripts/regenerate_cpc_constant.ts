import prisma from '../src/configs/prisma.config';
import logger from '../src/configs/logger.config';
import { FIELD_MAP } from '../src/configs/fieldMap.config';
import * as fs from 'fs';
import * as path from 'path';

// Helper to parse numbers safely
const parseNumber = (val: any): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

// Helper to normalize keys (case insensitive, trim)
function normalizeKey(str: string): string {
  return (str || '').trim().toLowerCase().replace(/\s+/g, '');
}

async function main() {
  logger.info('Starting regeneration of cpcDataDynamic.ts from clean database...');

  // 1. Fetch all work orders in the database (which are already smartphone & tablet only)
  const workOrders = await prisma.workOrder.findMany({
    select: {
      month: true,
      rawData: true,
      serviceCentre: {
        select: {
          code: true,
          name: true,
          dealer: {
            select: {
              name: true,
              region: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    }
  });

  logger.info(`Loaded ${workOrders.length} work orders for CPC calculation.`);

  const months = ['Jun', 'May', 'Apr', 'All'];
  const resultData: Record<string, any> = {};

  months.forEach((m) => {
    // Filter work orders for this month and apply CPC criteria: Warranty = Yes and ELS Status != No
    const mRows = workOrders.filter((wo) => {
      if (m !== 'All' && wo.month !== m) return false;
      
      const raw = wo.rawData as any;
      const warranty = String(raw[FIELD_MAP.warranty] || raw['Warranty'] || '').trim().toLowerCase();
      const elsStatus = String(raw['Els Status'] || raw['ELS Status'] || raw['ELS status'] || '').trim().toLowerCase();

      return warranty === 'yes' && elsStatus !== 'no';
    });

    // Helper to extract CPC fields for a row
    const getRowCPCStats = (wo: typeof workOrders[0]) => {
      const raw = wo.rawData as any;
      const callType = String(raw[FIELD_MAP.callType] || raw['Call Type'] || '').trim().toUpperCase();
      const isRepl = callType === 'Z9' || String(raw['Action Code Desc'] || raw['Action Taken'] || '').toUpperCase().includes('REPLACEMENT');

      const totalPartVal = parseNumber(raw[FIELD_MAP.totalPartValue] || raw['Total Part Value']);
      const pcbaVal = parseNumber(raw[FIELD_MAP.pcbaValue] || raw['PCBA Value']);
      const lcdVal = parseNumber(raw[FIELD_MAP.tpLcdValue] || raw['TP/LCD Value']);
      const batteryVal = parseNumber(raw[FIELD_MAP.batteryValue] || raw['Battery Value']);
      const subPcbaVal = parseNumber(raw[FIELD_MAP.subPcbaValue] || raw['Sub PCBA Value']);
      const accessoriesVal = parseNumber(raw[FIELD_MAP.accessoriesValue] || raw['Accessories value']);
      const othersVal = parseNumber(raw[FIELD_MAP.othersValue] || raw['Others Value']);

      let partVal = totalPartVal;
      if (partVal === 0) {
        partVal = pcbaVal + lcdVal + batteryVal + subPcbaVal + accessoriesVal + othersVal;
      }
      
      const handsetVal = parseNumber(raw[FIELD_MAP.handsetValue] || raw['Handset Value']);

      return {
        isRepl,
        repairCost: isRepl ? 0 : partVal,
        replCost: isRepl ? (handsetVal || 12000) : 0, // Fallback if handset value is zero
        isRepair: !isRepl && partVal > 0,
      };
    };

    // Grouping structures
    const busmGroups = new Map<string, typeof mRows>();
    const asmGroups = new Map<string, { busm: string; rows: typeof mRows }>();
    const aspGroups = new Map<string, { code: string; asp: string; asm: string; rows: typeof mRows }>();

    let totalRepairCount = 0;
    let totalRepairCost = 0;
    let totalReplCount = 0;
    let totalReplCost = 0;

    mRows.forEach((wo) => {
      const busm = wo.serviceCentre?.dealer?.region?.name || 'Unknown';
      const asm = wo.serviceCentre?.dealer?.name || 'Unknown';
      const aspCode = wo.serviceCentre?.code || 'Unknown';
      const aspName = wo.serviceCentre?.name || 'Unknown';

      if (busm === 'Unknown' || busm.toLowerCase().includes('unknown')) return;

      // Add to BUSM group
      if (!busmGroups.has(busm)) busmGroups.set(busm, []);
      busmGroups.get(busm)!.push(wo);

      // Add to ASM group
      if (!asmGroups.has(asm)) asmGroups.set(asm, { busm, rows: [] });
      asmGroups.get(asm)!.rows.push(wo);

      // Add to ASP group
      const aspKey = `${aspCode}_${aspName}`;
      if (!aspGroups.has(aspKey)) aspGroups.set(aspKey, { code: aspCode, asp: aspName, asm, rows: [] });
      aspGroups.get(aspKey)!.rows.push(wo);

      // Add to National Summary
      const stats = getRowCPCStats(wo);
      if (stats.isRepair) {
        totalRepairCount++;
        totalRepairCost += stats.repairCost;
      }
      if (stats.isRepl) {
        totalReplCount++;
        totalReplCost += stats.replCost;
      }
    });

    const combinedTotal = totalRepairCost + totalReplCost;

    // Build BUSM entries
    const busmEntries = Array.from(busmGroups.entries()).map(([name, rows]) => {
      let repairCount = 0;
      let repairCost = 0;
      let replCount = 0;
      let replCost = 0;

      rows.forEach((wo) => {
        const stats = getRowCPCStats(wo);
        if (stats.isRepair) {
          repairCount++;
          repairCost += stats.repairCost;
        }
        if (stats.isRepl) {
          replCount++;
          replCost += stats.replCost;
        }
      });

      return {
        name,
        repair_count: repairCount,
        repair_avg: repairCount > 0 ? Math.round((repairCost / repairCount) * 100) / 100 : 0,
        repair_total: repairCost,
        repl_count: replCount,
        repl_avg: replCount > 0 ? Math.round((replCost / replCount) * 100) / 100 : 0,
        repl_total: replCost,
        combined_total: repairCost + replCost,
        busm: name
      };
    });

    // Build ASM entries
    const asmEntries = Array.from(asmGroups.entries()).map(([name, group]) => {
      let repairCount = 0;
      let repairCost = 0;
      let replCount = 0;
      let replCost = 0;

      group.rows.forEach((wo) => {
        const stats = getRowCPCStats(wo);
        if (stats.isRepair) {
          repairCount++;
          repairCost += stats.repairCost;
        }
        if (stats.isRepl) {
          replCount++;
          replCost += stats.replCost;
        }
      });

      return {
        name,
        busm: group.busm,
        repair_count: repairCount,
        repair_avg: repairCount > 0 ? Math.round((repairCost / repairCount) * 100) / 100 : 0,
        repair_total: repairCost,
        repl_count: replCount,
        repl_avg: replCount > 0 ? Math.round((replCost / replCount) * 100) / 100 : 0,
        repl_total: replCost,
        combined_total: repairCost + replCost
      };
    });

    // Build ASP entries
    const aspEntries = Array.from(aspGroups.entries()).map(([key, group]) => {
      let repairCount = 0;
      let repairCost = 0;
      let replCount = 0;
      let replCost = 0;

      group.rows.forEach((wo) => {
        const stats = getRowCPCStats(wo);
        if (stats.isRepair) {
          repairCount++;
          repairCost += stats.repairCost;
        }
        if (stats.isRepl) {
          replCount++;
          replCost += stats.replCost;
        }
      });

      return {
        code: group.code,
        asp: group.asp,
        asm: group.asm,
        repair_count: repairCount,
        repair_avg: repairCount > 0 ? Math.round((repairCost / repairCount) * 100) / 100 : 0,
        repair_total: repairCost,
        repl_count: replCount,
        repl_avg: replCount > 0 ? Math.round((replCost / replCount) * 100) / 100 : 0,
        repl_total: replCost,
        combined_total: repairCost + replCost
      };
    });

    resultData[m] = {
      summary: {
        repair_count: totalRepairCount,
        repair_avg: totalRepairCount > 0 ? Math.round((totalRepairCost / totalRepairCount) * 100) / 100 : 0,
        repair_total: totalRepairCost,
        repl_count: totalReplCount,
        repl_avg: totalReplCount > 0 ? Math.round((totalReplCost / totalReplCount) * 100) / 100 : 0,
        repl_total: totalReplCost,
        combined_total: combinedTotal
      },
      busm: busmEntries,
      asm: asmEntries,
      asp: aspEntries
    };
  });

  // Write file to /tmp so it can be docker cp'd out to the host.
  // The container has no access to the frontend folder.
  const targetPath = '/tmp/cpcDataDynamic.ts';
  const codeContent = `export const DYNAMIC_CPC_DATA_BY_MONTH: Record<string, any> = ${JSON.stringify(resultData, null, 2)};\n`;
  
  fs.writeFileSync(targetPath, codeContent, 'utf-8');
  logger.info(`Successfully wrote regenerated CPC data to ${targetPath}`);
  logger.info(`Copy it out with:  docker cp pathwaysbackend-lava-api-1:/tmp/cpcDataDynamic.ts ../frontend/constants/cpcDataDynamic.ts`);
}

main()
  .catch((err) => {
    logger.error('Error during CPC regeneration:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
    process.exit(0);
  });
