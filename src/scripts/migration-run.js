const { execSync } = require('child_process');
const path = require('path');

const typeormCli = path.join('node_modules', 'typeorm', 'cli.js');
const dataSource = path.join('src', 'db', 'data-source.ts');

console.log('cleaning dist folder...');
execSync('npm run clean', { stdio: 'inherit', shell: true });

console.log('building project...');
execSync('npm run build', { stdio: 'inherit', shell: true });

const command = `npx tsx ${typeormCli} migration:run -d ${dataSource}`;
console.log('▶️  Running migrations...', command);

try {
  execSync(command, { stdio: 'inherit', shell: true });
} catch {
  process.exit(1);
}
