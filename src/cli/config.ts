import { Command } from 'commander';
import { buildCliCommand, ICliCommand, printAppTable } from '../helpers';
import { ConfigService, getServices } from '../services';

const CommandPrefix = 'cfg';

const Commands = (configService: ConfigService): ICliCommand[] => [];

export const registerConfigCommands = (program: Command) => {
  const { configService } = getServices();

  buildCliCommand(Commands(configService), CommandPrefix, program);
};
