#!/usr/bin/env ts-node
import { Command } from 'commander';
import 'reflect-metadata';
import { initControllers } from '../controllers';
import { AppDataSource } from '../db';
import { printAppTable } from '../helpers';
import { connectRedis, logger } from '../libs';
import { initServices } from '../services';
import { registerApiKeyCommands } from './api-key';
import { registerAppCommands } from './app';
import { registerConfigCommands } from './config';

const InitCli = async () => {
  const program = new Command();

  await connectRedis();

  initServices();
  initControllers();

  program.name('app_configs').description('CLI to manage Apps and API Keys').version('1.0.0');

  registerAppCommands(program);
  registerApiKeyCommands(program);
  registerConfigCommands(program);

  AppDataSource.initialize()
    .then(async () => {
      await program.parseAsync(process.argv);
      await AppDataSource.destroy();
    })
    .catch((err) => {
      printAppTable([{ list: true }], ['list']);
      logger.error(err);
      process.exit(1);
    });
};

InitCli();
