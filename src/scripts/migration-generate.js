const { execSync } = require('child_process');
const path = require('path');

const name = process.argv[2];

if (!name) {
  console.error('❌ Missing migration name');
  console.log('Usage: npm run migration:generate <migration-name>');
  process.exit(1);
}

const typeormCli = path.join('node_modules', 'typeorm', 'cli.js');
const dataSource = path.join('src', 'db', 'data-source.ts');
const migrationPath = path.join('src', 'migrations', name);

const command = `npx tsx ${typeormCli} migration:generate -d ${dataSource} ${migrationPath}`;
console.log('▶️  Generating migration...', command);

try {
  execSync(command, { stdio: 'inherit', shell: true });
} catch {
  process.exit(1);
}
