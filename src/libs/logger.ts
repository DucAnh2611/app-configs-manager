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
  serialize,
  textColor,
} from '../helpers';

type Logger = winston.Logger;

const logDir = path.resolve(process.cwd(), LOGGER_CONSTANTS.BASE_DIR);
const { combine, timestamp, printf } = winston.format;

const levelColor: Record<ELoggerLevel, typeof textColor> = {
  [ELoggerLevel.INFO]: textColor.cyanBright.bold,
  [ELoggerLevel.WARN]: textColor.yellowBright.bold,
  [ELoggerLevel.ERROR]: textColor.redBright.bold,
  [ELoggerLevel.DEBUG]: textColor.magentaBright.bold,
};

export class Log {
  private readonly logger: Logger;

  constructor() {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    this.logger = winston.createLogger({
      format: combine(timestamp({ format: LOGGER_CONSTANTS.FORMAT_TIMESTAMP }), this.formatConsole),
      transports: [new winston.transports.Console(), ...this.fileTransports],
    });
  }

  public info<T extends unknown>(data: T, ...meta: string[]) {
    this.logger.info(serialize(data), { level: ELoggerLevel.INFO }, ...meta);
  }

  public error<T extends unknown>(data: T, ...meta: string[]) {
    this.logger.error(serialize(data), { level: ELoggerLevel.ERROR }, ...meta);
  }

  public warn<T extends unknown>(data: T, ...meta: string[]) {
    this.logger.warn(serialize(data), { level: ELoggerLevel.WARN }, ...meta);
  }

  public debug<T extends unknown>(data: T, ...meta: string[]) {
    this.logger.debug(serialize(data), { level: ELoggerLevel.DEBUG }, ...meta);
  }

  private get formatConsole() {
    return printf(({ level, message, timestamp, [Symbol.for('splat')]: splats = [] }) => {
      let levelTag: string;

      const [customExtras, ...metaSpats]: unknown[] = (splats as unknown[]) ?? [];

      const customLevel = (customExtras as any)?.level ?? level;

      switch (customLevel) {
        case ELoggerLevel.INFO:
        case ELoggerLevel.WARN:
        case ELoggerLevel.ERROR:
        case ELoggerLevel.DEBUG:
          levelTag = levelColor[customLevel as ELoggerLevel](
            boundString(customLevel, LOGGER_CONSTANTS.BOUNDARY_META_CONSOLE)
          );
          break;

        default:
          levelTag = textColor.white(customLevel);
          break;
      }

      const extras =
        (metaSpats as unknown[])
          .map?.((v) =>
            textColor.bgMagentaBright.bold(
              boundString(serialize(v), LOGGER_CONSTANTS.BOUNDARY_META_CONSOLE)
            )
          )
          .join(', ') || 'EMPTY';

      return createGrid(
        {
          timestamp: textColor.greenBright.bold(
            boundString(timestamp as string, LOGGER_CONSTANTS.BOUNDARY_META_CONSOLE)
          ),
          level: levelTag,
          extras,
          message,
        },
        [
          ['timestamp', 'Log Time'],
          ['level', 'Type'],
          ['extras', 'Tags'],
          ['message', 'Detail'],
        ],
        {
          name: 'Logger',
          split: ':',
        }
      );
    });
  }

  private get formatFile() {
    return printf(({ message, timestamp, [Symbol.for('splat')]: splats = [] }) => {
      const [_customExtras, ...metaSpats]: unknown[] = (splats as unknown[]) ?? [];

      const extras =
        (metaSpats as unknown[])
          .map?.((v) => boundString(serialize(v), LOGGER_CONSTANTS.BOUNDARY_META_FILE))
          .join(LOGGER_CONSTANTS.META_SPLIT) || '';

      return [
        boundString(timestamp as string, LOGGER_CONSTANTS.BOUNDARY_META_FILE),
        extras ? `${LOGGER_CONSTANTS.META_SPLIT}${extras}` : '',
        ':',
        serialize(deserialize(message as string), 2),
      ].join('');
    });
  }

  private get fileTransports() {
    const fileTransports = Object.values(ELoggerLevel).map(
      (level) =>
        new winston.transports.File({
          filename: this.getLogFilePath(level),
          level: level.toLowerCase(),
          format: this.formatFile,
        })
    );

    return fileTransports;
  }

  private getLogFilePath(level: ELoggerLevel) {
    const logTimestamp = dayjs();

    return path.join(
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
  }
}

export const logger = new Log();
