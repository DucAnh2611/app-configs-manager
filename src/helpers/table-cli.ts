import CliTable3 from 'cli-table3';
import wrap from 'wrap-ansi';
import chalk from 'chalk';

export const printAppTable = <T>(
  list: T[],
  fields: Array<[keyof T, string] | keyof T>,
  slideStr: Array<keyof T> = []
) => {
  const terminalWidth = process.stdout.columns ?? 240;
  const COL_WIDTH = Math.floor(terminalWidth / fields.length) - 5;
  const colWidths = fields.map(() => COL_WIDTH);

  const table = new CliTable3({
    head: fields.map((f) => (typeof f === 'object' ? f[1] : String(f))),
    style: { compact: true, head: ['cyan'], border: ['gray'] },
    colWidths,
  });

  for (const item of list) {
    table.push(
      fields.map((f) => {
        const fieldString = typeof f === 'object' ? f[0] : f;
        let strData = String(item[fieldString]) ?? '';

        if (slideStr.includes(fieldString)) {
          return wrap(strData, COL_WIDTH - 2);
        }

        return wrap(strData, COL_WIDTH - 2, { hard: true, trim: true });
      })
    );
  }

  console.log(table.toString());
};

export const printGrid = <T>(
  data: T,
  fields: Array<keyof T | [keyof T, string]>,
  splitStr = ': '
) => {
  const prints: string[] = [];

  fields.forEach((f) => {
    let printPush: string[] = [];
    let fieldName = '',
      fieldData: any = '';

    if (typeof f === 'object' && Array.isArray(f)) {
      const [name, alias] = f;

      if (!data[name]) return;

      fieldData = data[name];
      fieldName = alias;
    } else if (typeof f === 'string') {
      fieldData = data[f];
      fieldName = f;
    }

    printPush = [
      chalk.red(fieldName),
      typeof fieldData === 'object' ? JSON.stringify(fieldData) : String(fieldData),
    ];

    prints.push(printPush.join(splitStr));
  });

  console.log(prints.join('\n'));
};
