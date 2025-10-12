#!/usr/bin/env ts-node
import 'reflect-metadata';
import { Command } from 'commander';
import { AppDataSource } from '../db';
import { registerAppCommands } from './app';
import chalk from 'chalk';
import { registerApiKeyCommands } from './api-key';
import { connectRedis } from '../libs';

const InitCli = async () => {
  const program = new Command();

  await connectRedis();

  program.name('app_configs').description('CLI to manage Apps and API Keys').version('1.0.0');

  registerAppCommands(program);
  registerApiKeyCommands(program);

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
