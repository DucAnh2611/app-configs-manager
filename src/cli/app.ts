import { Command } from 'commander';
import { AppService, CacheService } from '../services';
import { appRepository } from '../repositories';
import { DtoAppCreate, DtoAppDetail, DtoAppUpdate } from '../types';
import { printAppTable, buildCliCommand, ICliCommand } from '../helpers';
import { IApp } from '../db';

const CommandPrefix = 'app';

const Commands = (appService: AppService): ICliCommand[] => [
  {
    name: 'create',
    description: 'Create an app',
    options: [
      { required: true, flags: '--code <code>', description: 'App code' },
      { required: true, flags: '--name <name>', description: 'App name' },
    ],
    action: async (opts: DtoAppCreate) => {
      const saveApp = await appService.create(opts);

      printAppTable([saveApp], ['id', 'code', 'name', 'createdAt', 'updatedAt']);
    },
  },
  {
    name: 'update',
    description: 'Update an existing app',
    options: [
      { required: true, flags: '--id <id>', description: 'App ID' },
      { flags: '--code <code>', description: 'New app code' },
      { flags: '--name <name>', description: 'New app name' },
    ],
    action: async (opts: DtoAppUpdate) => {
      const updateApp = await appService.update(opts);
      console.log('✅ App updated:', updateApp);
    },
  },
  {
    name: 'delete',
    description: 'Delete an app',
    options: [{ required: true, flags: '--ids <ids>', description: 'Comma-separated App IDs' }],
    action: async (opts) => {
      const ids = opts.ids.split(',').map((id: string) => id.trim());
      await appService.delete({ ids });

      printAppTable(
        ids.map((id: string) => ({ id, deleted: true })),
        ['id', 'deleted']
      );
    },
  },
  {
    name: 'list',
    description: 'List all apps',
    action: async () => {
      const list = await appService.find();

      printAppTable(list, ['id', 'code', 'name', 'createdAt', 'updatedAt']);
    },
  },
  {
    name: 'detail',
    description: 'Get app details',
    options: [{ required: true, flags: '--id <id>', description: 'App ID' }],
    action: async (opts: DtoAppDetail) => {
      const detail = await appService.detail(opts);

      const data: IApp[] = [];

      if (detail) {
        data.push(detail);
      }

      printAppTable(data, ['id', 'code', 'name', 'createdAt', 'updatedAt']);
    },
  },
];

export const registerAppCommands = (program: Command) => {
  const appService = new AppService(appRepository, new CacheService());

  buildCliCommand(Commands(appService), CommandPrefix, program);
};
