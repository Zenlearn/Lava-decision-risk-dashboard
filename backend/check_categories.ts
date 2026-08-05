import prisma from './src/configs/prisma.config';

async function main() {
  const nps = await prisma.npsSurveyRecord.findMany({ select: { rawData: true } });
  const cats = [...new Set(nps.map((n: any) => n.rawData['Model Segment'] || n.rawData['Device Category']))];
  console.log('Categories:', cats);
}
main();
