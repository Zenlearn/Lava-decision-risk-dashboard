import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.workOrder.count();
  console.log('Total WorkOrders in DB:', count);

  const wos = await prisma.workOrder.findMany({
    take: 5000,
    select: {
      rawData: true
    }
  });

  const modelTypes = new Set<string>();
  const warranties = new Set<string>();
  const elsStatuses = new Set<string>();

  wos.forEach((wo: any) => {
    const raw = wo.rawData as any;
    if (raw) {
      const mt = raw['Model type'] || raw['Model Type'] || 'None';
      modelTypes.add(mt);
      
      const w = raw['Warranty'] || 'None';
      warranties.add(w);

      const els = raw['ELS Status'] || raw['ELS status'] || raw['Els Status'] || 'None';
      elsStatuses.add(els);
    }
  });

  console.log('Model types found in DB (up to 5000 rows):', Array.from(modelTypes));
  console.log('Warranties found in DB (up to 5000 rows):', Array.from(warranties));
  console.log('ELS Statuses found in DB (up to 5000 rows):', Array.from(elsStatuses));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
