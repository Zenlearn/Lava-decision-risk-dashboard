import { getFullDashboardData } from './src/services/dashboard.service';

async function test() {
  const data = await getFullDashboardData();
  console.log('Summary:', data.summary);
  console.log('BUSM Stats count:', data.busm?.length);
  if (data.busm?.length > 0) {
    console.log('First BUSM Stat object keys:', Object.keys(data.busm[0]));
    console.log('First BUSM Stat childMetrics:', JSON.stringify(data.busm[0].childMetrics, null, 2));
  }
}

test().catch(console.error);
