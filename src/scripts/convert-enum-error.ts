import chalk from 'chalk';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

interface EnumConfig {
  filePath: string;
  enumNames: string[];
}

const CONFIG: EnumConfig[] = [
  {
    filePath: 'src/enums/response.ts',
    enumNames: ['EErrorCode'],
  },
];

function processEnumFile(config: EnumConfig): boolean {
  const { filePath, enumNames } = config;

  if (!existsSync(filePath)) {
    console.warn(chalk.red(`File not found: ${chalk.white(filePath)}`));
    return false;
  }

  let content = readFileSync(filePath, 'utf-8');

  const hasLF = content.includes('\n');
  const hasCRLF = content.includes('\r\n');
  const lineEnding = hasCRLF ? '\r\n' : '\n';

  content = content.replace(/\r\n/g, '\n');

  let modified = false;

  enumNames.forEach((enumName) => {
    const enumRegex = new RegExp(`export enum ${enumName}\\s*{([^}]*)}`, 'gs');

    content = content.replace(enumRegex, (match, enumBody: string) => {
      const processedBody = enumBody.replace(
        /^\s*([A-Z_][A-Z0-9_]*)\s*(?:,|\s*$)/gm,
        (line: string, memberName: string) => {
          if (line.includes('=')) {
            return line;
          }

          modified = true;
          const indent = line.match(/^\s*/)?.[0] || '  ';
          const trailingComma = line.trim().endsWith(',') ? ',' : '';
          const res = `${indent}${memberName} = '${memberName}'${trailingComma}`;

          console.log(
            `[${chalk.white(filePath)}] [${chalk.magenta(enumName)}]: ${chalk.blue(memberName)} => ${chalk.blue(`${memberName} = '${memberName}'`)} `
          );
          return `${indent}${memberName} = '${memberName}'${trailingComma}`;
        }
      );

      return `export enum ${enumName} {${processedBody}}`;
    });
  });

  if (modified) {
    if (lineEnding === '\r\n') {
      content = content.replace(/\n/g, '\r\n');
    }

    writeFileSync(filePath, content, 'utf-8');
    console.log(
      chalk.green(
        `Updated ${chalk.magenta(JSON.stringify(enumNames))} in: ${chalk.white(filePath)}\r\n`
      )
    );
    return true;
  }

  console.log(
    chalk.green(
      `Have no changes of ${chalk.magenta(JSON.stringify(enumNames))} in: ${chalk.white(filePath)}\r\n`
    )
  );
  return false;
}

function main(): void {
  let filesModified = false;

  CONFIG.forEach((config) => {
    const wasModified = processEnumFile(config);
    if (wasModified) {
      filesModified = true;
    }
  });

  if (filesModified) {
    console.log(
      chalk.green('Enum files have been updated. Please review and stage the changes.\r\n')
    );
    process.exit(1);
  } else {
    console.log(chalk.green('All enum files are up to date.\r\n'));
    process.exit(0);
  }
}

main();
