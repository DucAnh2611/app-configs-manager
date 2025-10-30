import CliTable3 from 'cli-table3';
import wrap from 'wrap-ansi';
import { logger } from '../libs';
import { removeEndlines, resetTextStyle, serialize, textColor } from './format-string';

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

type TGridRow = { label: string; data: string | any };

type TField<T> = keyof T | [keyof T, string];

type TOptionsFormatGrid = {
  name?: string;
  split: string;
  labelColMaxWidth: number;
  colorize: boolean;
  labelColor: typeof textColor;
  dataColor: typeof textColor;
  tableNameColor: typeof textColor;
  width: number;
};

const defaultOptionFormatGrid: TOptionsFormatGrid = {
  labelColor: textColor.red,
  tableNameColor: textColor.whiteBright.bold,
  dataColor: textColor.white,
  split: '|',
  labelColMaxWidth: -1,
  colorize: true,
  width: terminalWidth,
};

export class GridData<T = any> {
  private readonly isGrid = true;

  constructor(
    private data: T,
    private fields: Array<TField<T>>,
    private options: Partial<TOptionsFormatGrid> = {}
  ) {}

  public setOptions(options: Partial<TOptionsFormatGrid> = {}) {
    this.options = {
      ...this.options,
      ...options,
    };

    return this;
  }

  public create() {
    const opts: TOptionsFormatGrid = {
      ...defaultOptionFormatGrid,
      ...this.options,
    };

    const prints: TGridRow[] = [];

    this.fields.forEach((f) => {
      let printPush: TGridRow = {
        label: '',
        data: '',
      };
      let fieldName = '',
        fieldData: any = '';

      if (typeof f === 'object' && Array.isArray(f)) {
        const [name, alias] = f;

        if (!this.data[name]) return;

        fieldData = this.data[name];
        fieldName = alias;
      } else if (typeof f === 'string') {
        fieldData = this.data[f];
        fieldName = f;
      }

      printPush = {
        label: fieldName,
        data: fieldData,
      };

      prints.push(printPush);
    });

    return formatGrid(prints, opts);
  }
}

export const printGrid = <T>(
  data: T,
  fields: Array<TField<T>>,
  options: Partial<TOptionsFormatGrid> = {}
) => {
  logger.info(createGrid(data, fields, options));
};

export const createGrid = <T>(
  data: T,
  fields: Array<TField<T>>,
  options: Partial<TOptionsFormatGrid> = {}
) => {
  return new GridData<T>(data, fields, options);
};

const formatGrid = (rows: TGridRow[], options: TOptionsFormatGrid): string => {
  const prints = [];
  let widthContents = options.width - 3;
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

  if (options.labelColMaxWidth > 0) {
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
        let rowData = row.data,
          isNestedGrid = false,
          rowDataLength = width.data;

        const factor = 2 / 3;
        const childGridWidth = options.width * factor;
        if (typeof rowData === 'object' && !!rowData.isGrid) {
          rowData = removeEndlines(
            new GridData(rowData.data || {}, rowData.fields || [], rowData.options || {})
              .setOptions({ width: childGridWidth, colorize: false })
              .create()
          );

          isNestedGrid = true;
          rowDataLength = childGridWidth - 1 / factor;
        } else {
          rowData = serialize(rowData);
        }

        const linesLabel = Math.ceil(row.label.length / width.label);
        const linesData = isNestedGrid
          ? Math.ceil(rowData.length / childGridWidth)
          : Math.ceil(rowData.length / width.data);
        let maxLines = Math.max(linesLabel, linesData);

        if (isNestedGrid) {
          maxLines = linesLabel + linesData;
        }

        let lines: string[] = [];

        for (let line = 0; line < maxLines; line++) {
          let lineContent: string[] = [];
          const offsetDataRow = isNestedGrid ? linesLabel : 0;
          const lineLabel = (
            row.label.slice(
              line * width.label,
              Math.min((line + 1) * width.label, row.label.length)
            ) || ''
          ).padEnd(width.label);
          const lineData = (
            rowData.slice(
              (line - offsetDataRow) * rowDataLength,
              Math.min((line - offsetDataRow + 1) * rowDataLength, rowData.length)
            ) || ''
          ).padEnd(rowDataLength);

          if (isNestedGrid) {
            if (line < linesLabel) {
              lineContent.push(options.labelColor(lineLabel), ' ', line > 0 ? '' : options.split);

              lines.push(lineContent.join(''));
              continue;
            }

            lineContent.push(options.dataColor(lineData));

            lines.push(lineContent.join(''));
            continue;
          }

          lineContent.push(
            options.labelColor(lineLabel),
            ' ',
            line > 0 ? ' ' : options.split,
            ' ',
            options.dataColor(lineData)
          );

          lines.push(lineContent.join(''));
        }

        return lines.join('\n');
      })
      .join('\n')
  );

  if (!options.colorize) return resetTextStyle(prints.join('\n'));

  return prints.join('\n');
};
