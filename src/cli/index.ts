#!/usr/bin/env ts-node
import chalk from 'chalk';
import { Command } from 'commander';
import 'reflect-metadata';
import { initControllers } from '../controllers';
import { AppDataSource } from '../db';
import { connectRedis, createIORedis } from '../libs';
import { initServices } from '../services';
import { registerApiKeyCommands } from './api-key';
import { registerAppCommands } from './app';
import { registerConfigCommands } from './config';

const InitCli = async () => {
  const program = new Command();

  await connectRedis();

  const ioRedis = createIORedis();
  initServices({ ioRedis });
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
      console.error(chalk.red('❌ Error:'), err);
      process.exit(1);
    });
};

InitCli();
