/**
 * Interactive script to set a SystemConfig value (e.g. CLAUDE_API_KEY) without
 * putting the secret in a shell command, .env file, or bash history.
 *
 * Run interactively (note the -it, required for the prompt to work):
 *   docker compose exec -it lava-api npx ts-node --transpileOnly src/scripts/setSystemConfig.ts
 *
 * It will ask for the config key name, then the value (typed input, not an argv
 * argument — never recorded in shell history, never written to disk except the DB).
 */

import readline from 'readline';
import prisma from '../configs/prisma.config';

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('SystemConfig setter — value is read from stdin, never logged or written to a file.\n');

  const key = await ask('Config key (e.g. CLAUDE_API_KEY): ');
  if (!key) {
    console.error('Key cannot be empty.');
    process.exit(1);
  }

  const value = await ask(`Value for "${key}": `);
  if (!value) {
    console.error('Value cannot be empty.');
    process.exit(1);
  }

  await prisma.systemConfig.upsert({
    where: { key },
    create: { key, value },
    update: { value, updatedAt: new Date() },
  });

  console.log(`\n✓ Stored "${key}" in SystemConfig (value not printed).`);
  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to set SystemConfig:', err);
  process.exit(1);
});
