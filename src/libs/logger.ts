import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
import winston from 'winston';
import { LOGGER_CONSTANTS } from '../constants';
import { ELoggerLevel } from '../enums';
import {
  bindStringFormat,
  boundString,
  createGrid,
  deserialize,
  padNumberString,
  resetTextStyle,
  serialize,
  textColor,
} from '../helpers';

type Logger = winston.Logger;

const logDir = path.resolve(process.cwd(), LOGGER_CONSTANTS.BASE_DIR);
const { combine, timestamp, printf } = winston.format;
export class Log {
  private readonly logger: Logger;

  constructor() {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    this.logger = winston.createLogger({
      levels: this.customLevels,
      level: this.getLevel(ELoggerLevel.ERROR),
      format: combine(timestamp({ format: LOGGER_CONSTANTS.FORMAT_TIMESTAMP }), this.formatConsole),
      transports: [new winston.transports.Console()],
    });
  }

  public error<T>(data: T, ...meta: any[]) {
    this.log(ELoggerLevel.ERROR, data, ...meta);
  }

  public warn<T>(data: T, ...meta: any[]) {
    this.log(ELoggerLevel.WARN, data, ...meta);
  }

  public info<T>(data: T, ...meta: any[]) {
    this.log(ELoggerLevel.INFO, data, ...meta);
  }

  public debug<T>(data: T, ...meta: any[]) {
    this.log(ELoggerLevel.DEBUG, data, ...meta);
  }

  private log<T>(level: ELoggerLevel, data: T, ...meta: any[]) {
    const message = serialize(data);

    this.writeLogFile(level, message, ...meta);
    this.logger.log(this.getLevel(level), message, ...meta);
  }

  private get formatConsole() {
    return printf(({ level, message, timestamp, [Symbol.for('splat')]: splats = [] }) => {
      const levelTag = this.getLevelColor(level, LOGGER_CONSTANTS.BOUNDARY_META_CONSOLE);

      const extras = (splats as unknown[]).map?.(serialize).join(' ') || level.toUpperCase();

      return createGrid(
        {
          timestamp: textColor.greenBright.bold(
            boundString(timestamp as string, LOGGER_CONSTANTS.BOUNDARY_META_CONSOLE)
          ),
          level: levelTag,
          message: serialize(deserialize(message as string), 2),
        },
        [
          ['timestamp', 'Log Time'],
          ['level', 'Type'],
          ['message', 'Detail'],
        ],
        {
          name: extras,
          split: ':',
        }
      );
    });
  }

  private formatFile({
    message,
    timestamp,
    [Symbol.for('splat')]: splats = [],
  }: winston.Logform.TransformableInfo): string {
    const extras =
      (splats as unknown[])
        .map?.((v) => boundString(serialize(v), LOGGER_CONSTANTS.BOUNDARY_META_FILE))
        .join(LOGGER_CONSTANTS.META_SPLIT) || '';

    return resetTextStyle(
      [
        boundString(timestamp as string, LOGGER_CONSTANTS.BOUNDARY_META_FILE),
        extras ? `${LOGGER_CONSTANTS.META_SPLIT}${extras}` : '',
        ': ',
        message,
      ].join('')
    );
  }

  private getLogFilePath(level: ELoggerLevel) {
    const logTimestamp = dayjs();

    const filePath = path.join(
      logDir,
      bindStringFormat(LOGGER_CONSTANTS.FORMAT_FILES, {
        level: level.toString().toLowerCase(),
        second: padNumberString(logTimestamp.second(), 2),
        minute: padNumberString(logTimestamp.minute(), 2),
        hour: padNumberString(logTimestamp.hour(), 2),
        date: padNumberString(logTimestamp.date(), 2),
        month: padNumberString(logTimestamp.month(), 2),
        year: logTimestamp.year(),
      })
    );

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    return filePath;
  }

  private writeLogFile(level: ELoggerLevel, message: string, ...meta: any[]) {
    const filePath = this.getLogFilePath(level);

    fs.writeFileSync(
      filePath,
      this.formatFile({
        message,
        level,
        timestamp: dayjs().format(LOGGER_CONSTANTS.FORMAT_TIMESTAMP),
        [Symbol.for('splat')]: meta,
      }) + '\n',
      { flag: 'a' }
    );
  }

  private getLevel(level: ELoggerLevel) {
    return level.toLowerCase();
  }

  private getLevelColor(level: string, boundChars: string[]) {
    const color = {
      [this.getLevel(ELoggerLevel.INFO)]: textColor.cyanBright.bold,
      [this.getLevel(ELoggerLevel.WARN)]: textColor.yellowBright.bold,
      [this.getLevel(ELoggerLevel.ERROR)]: textColor.redBright.bold,
      [this.getLevel(ELoggerLevel.DEBUG)]: textColor.magentaBright.bold,
    };

    return (color[level as ELoggerLevel] || textColor.white)(boundString(level, boundChars));
  }

  private get customLevels() {
    return {
      [this.getLevel(ELoggerLevel.DEBUG)]: 0,
      [this.getLevel(ELoggerLevel.INFO)]: 1,
      [this.getLevel(ELoggerLevel.WARN)]: 2,
      [this.getLevel(ELoggerLevel.ERROR)]: 3,
    };
  }
}

export const logger = new Log();
