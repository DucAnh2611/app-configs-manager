const { execSync } = require('child_process');
const path = require('path');

const typeormCli = path.join('node_modules', 'typeorm', 'cli.js');
const dataSource = path.join('src', 'db', 'data-source.ts');

const command = `npx tsx ${typeormCli} migration:revert -d ${dataSource}`;
console.log('▶️  Reverting migrations...', command);

try {
  execSync(command, { stdio: 'inherit', shell: true });
} catch {
  process.exit(1);
}
