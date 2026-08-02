import { PrismaClient } from '@prisma/client';
import { getFullDashboardData } from './src/services/dashboard.service';

const prisma = new PrismaClient();

async function test() {
  const data = await getFullDashboardData();
  console.log('Summary:', data.summary);
  
  const msmCount = await prisma.msmDailyRecord.count();
  const qcCount = await prisma.complianceQcRecord.count();
  const elsCount = await prisma.complianceElsDoaRecord.count();
  const defCount = await prisma.complianceDefectiveSpareRecord.count();

  console.log('DB Counts:');
  console.log('  msmDailyRecord:', msmCount);
  console.log('  complianceQcRecord:', qcCount);
  console.log('  complianceElsDoaRecord:', elsCount);
  console.log('  complianceDefectiveSpareRecord:', defCount);

  if (data.busm?.length > 0) {
    const jiteshJun = data.busm.find((b: any) => b.actor === 'Jitesh S Rath' && b.month === 'Jun');
    console.log('Jitesh S Rath (Jun) overall:', jiteshJun?.overall);
    console.log('Jitesh S Rath (Jun) childMetrics:', JSON.stringify(jiteshJun?.childMetrics, null, 2));
  }
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
