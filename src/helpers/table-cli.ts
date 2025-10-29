import CliTable3 from 'cli-table3';
import wrap from 'wrap-ansi';
import { logger } from '../libs';
import { serialize, textColor } from './format-string';

const terminalWidth = process.stdout?.columns ?? 240;

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

  logger.info(table.toString());
};

type TGridRow = { label: string; data: string };
type TOptionsFormatGrid = {
  name?: string;
  split: string;
  labelColMaxWidth: number;
  colorize: boolean;
  labelColor: typeof textColor;
  dataColor: typeof textColor;
  tableNameColor: typeof textColor;
};

const defaultOptionFormatGrid: TOptionsFormatGrid = {
  labelColor: textColor.red,
  tableNameColor: textColor.whiteBright.bold,
  dataColor: textColor.white,
  split: '|',
  labelColMaxWidth: -1,
  colorize: true,
};

export const printGrid = <T>(
  data: T,
  fields: Array<keyof T | [keyof T, string]>,
  options: Partial<TOptionsFormatGrid> = {}
) => {
  logger.info(createGrid(data, fields, options));
};

export const createGrid = <T>(
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
      data: serialize(fieldData),
    };

    prints.push(printPush);
  });

  return formatGrid(prints, opts);
};

const formatGrid = (rows: TGridRow[], options: TOptionsFormatGrid): string => {
  const prints = [];
  let widthContents = terminalWidth - 3;
  let maxLabelWidth = 0;

  for (const row of rows) {
    maxLabelWidth = Math.max(row.label.length, maxLabelWidth);
  }

  const width = {
    label: maxLabelWidth,
    data: 0,
    base: widthContents - (options.split?.length || 0),
  };

  if (options.name) {
    prints.push(
      [
        `┌${''.padStart(widthContents, '─')}┐`,
        `│${options.tableNameColor(
          options.name
            .padEnd(Math.floor((widthContents + options.name.length) / 2))
            .padStart(widthContents)
        )}│`,
        `└${''.padStart(widthContents, '─')}┘`,
      ].join('\n')
    );
  }

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
                  Math.min((line + 1) * width.label, row.label.length)
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
