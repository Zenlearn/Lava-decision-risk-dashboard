import { PrismaClient } from '@prisma/client';
import { getFullDashboardData } from './src/services/dashboard.service';

async function testLeakage() {
  const data = await getFullDashboardData();
  const junData = data.kpiMonths.find((m: any) => m.month === 'Jun');
  console.log('June KPI Snapshot:', {
    wo: junData?.wo,
    leak: junData?.leak,
    breakdown: junData?.breakdown
  });
}

testLeakage().catch(console.error);
