import chalk from 'chalk';
import CliTable3 from 'cli-table3';
import wrap from 'wrap-ansi';

const terminalWidth = 50;

export const printAppTable = <T>(
  list: T[],
  fields: Array<[keyof T, string] | keyof T>,
  slideStr: Array<keyof T> = []
) => {
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

type TGridRow = { label: string; data: string };

type TOptionsFormatGrid = {
  name?: string;
  split: string;
  labelColMaxWidth: number;
  labelColor: (str: string) => string;
  dataColor: (str: string) => string;
  tableNameColor: (str: string) => string;
};

const defaultOptionFormatGrid: TOptionsFormatGrid = {
  labelColor: chalk.red,
  tableNameColor: chalk.whiteBright.bold,
  dataColor: chalk.white,
  split: '|',
  labelColMaxWidth: -1,
};

export const printGrid = <T>(
  data: T,
  fields: Array<keyof T | [keyof T, string]>,
  options: Partial<TOptionsFormatGrid> = {}
) => {
  const opts: TOptionsFormatGrid = {
    ...defaultOptionFormatGrid,
    ...options,
  };

  const prints: TGridRow[] = [];

  fields.forEach((f) => {
    let printPush: TGridRow = { label: '', data: '' };
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

    printPush = {
      label: fieldName,
      data: typeof fieldData === 'object' ? JSON.stringify(fieldData) : String(fieldData),
    };

    prints.push(printPush);
  });

  console.log(formatGrid(prints, opts));
};

const formatGrid = (rows: TGridRow[], options: TOptionsFormatGrid): string => {
  const prints = [],
    widthContents = terminalWidth - 2;

  if (options.name) {
    prints.push(
      [
        `┌${''.padStart(terminalWidth - 2, '─')}┐`,
        `│${options.tableNameColor(
          options.name
            .padEnd(Math.floor((terminalWidth - 2 + options.name.length) / 2))
            .padStart(terminalWidth - 2)
        )}│`,
        `└${''.padStart(terminalWidth - 2, '─')}┘`,
      ].join('\n')
    );
  }

  let maxLabelWidth = 0;

  for (const row of rows) {
    maxLabelWidth = Math.max(row.label.length, maxLabelWidth);
  }

  const width = {
    label: maxLabelWidth,
    data: 0,
    base: widthContents - (options.split?.length || 0),
  };

  if (options.labelColMaxWidth! > 0) {
    maxLabelWidth = Math.min(
      Math.ceil(widthContents * (options.labelColMaxWidth / 100)),
      maxLabelWidth
    );
  }

  width.label = maxLabelWidth;
  width.data = width.base - width.label;

  prints.push(
    rows
      .map((row) => {
        const maxLines = Math.max(
          Math.ceil(row.label.length / width.label),
          Math.ceil(row.data.length / width.data)
        );

        let lines: string[] = [];

        for (let line = 0; line < maxLines; line++) {
          let lineContent: string[] = [];

          lineContent.push(
            options.labelColor(
              (
                row.label.slice(
                  line * width.label,
                  Math.min((line + 1) * width.label, row.label.length - line * width.label)
                ) || ''
              ).padEnd(width.label)
            )
          );

          lineContent.push(line > 0 ? ' ' : options.split);

          lineContent.push(
            options.dataColor(
              (
                row.data.slice(
                  line * width.data,
                  Math.min((line + 1) * width.data, row.data.length)
                ) || ''
              ).padEnd(width.data)
            )
          );

          lines.push(lineContent.join(' '));
        }

        return lines.join('\n');
      })
      .join('\n')
  );

  return prints.join('\n');
};
