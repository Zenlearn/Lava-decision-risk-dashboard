import { getFullDashboardData } from './src/services/dashboard.service';

async function main() {
  const data = await getFullDashboardData();
  const months = Object.keys(data.orgKpis.by_month || {});
  console.log('months:', months);
  const m = 'Jun';
  const monthData = data.orgKpis.by_month[m];
  console.log(`\n--- Month: ${m} ---`);
  console.log('Overall national:', JSON.stringify(monthData.overall.national, null, 2).slice(0, 400));
  console.log('\nInWarranty national:', JSON.stringify(monthData.inWarranty.national, null, 2).slice(0, 400));
  console.log('\nOverall busms (wo, tat):', monthData.overall.busms.map((b: any) => ({ name: b.name, wo: b.wo, tat: b.tat })));
  console.log('\nInWarranty busms (wo, tat):', monthData.inWarranty.busms.map((b: any) => ({ name: b.name, wo: b.wo, tat: b.tat })));
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
