import { Command } from 'commander';
import { EApiKeyType } from '../enums';
import { buildCliCommand, ICliCommand, printAppTable, printGrid } from '../helpers';
import { ApiKeyService, getServices } from '../services';
import {
  DtoApiKeyGenerate,
  DtoApiKeyList,
  DtoApiKeyReset,
  DtoApiKeyToggle,
  DtoApiKeyUpdate,
} from '../types';

const CommandPrefix = 'api_key';

const Commands = (apiKeyService: ApiKeyService): ICliCommand[] => [
  {
    name: 'toggle',
    description: 'Toggle active of api key',
    options: [
      { required: true, flags: '--code <code>', description: 'App code' },
      { required: true, flags: '--id <id>', description: 'API key id' },
    ],
    action: async (opts: DtoApiKeyToggle) => {
      const toggled = await apiKeyService.toggle(opts);

      printAppTable(
        [toggled],
        [
          ['id', 'Api Key Id'],
          ['type', 'Api key Type'],
          ['code', 'App Code'],
          ['active', 'Active'],
        ]
      );

      process.exit(1);
    },
  },
  {
    name: 'new',
    description: 'Generate api key',
    options: [
      { required: true, flags: '--code <code>', description: 'App code' },
      { required: true, flags: '--namespace <namespace>', description: 'Namespace of config' },
      { flags: '--description <description>', description: 'Api key description', default: '' },
      { flags: '--type <type>', description: 'Api key type', default: EApiKeyType.CONFIG },
      { flags: '--length <length>', description: 'Api key length', default: '32' },
    ],
    action: async (opts: DtoApiKeyGenerate) => {
      const generate = await apiKeyService.generate(opts);

      const cols: Array<[keyof typeof generate, string]> = [
        ['id', 'Id'],
        ['formattedKey', 'Auth Key'],
        ['type', 'Api Key Type'],
      ];

      if (opts.type === EApiKeyType.THIRD_PARTY) {
        cols.push(['publicKey', 'Third Party public key']);
      }

      printGrid(generate, cols);

      process.exit(1);
    },
  },
  {
    name: 'list',
    description: 'list api key',
    options: [{ flags: '--code <code>', description: 'App code', default: '' }],
    action: async (opts: DtoApiKeyList) => {
      const list = await apiKeyService.list(opts);

      printAppTable(list, [
        ['id', 'Id'],
        ['description', 'Description'],
        ['type', 'Api Type'],
        ['publicKey', 'Public Key'],
        ['active', 'Active'],
      ]);

      process.exit(1);
    },
  },
  {
    name: 'reset',
    description: 'Reset api key',
    options: [
      { required: true, flags: '--code <code>', description: 'App code' },
      { required: true, flags: '--id <id>', description: 'Api key id', default: '' },
      { required: true, flags: '--namespace <namespace>', description: 'Namespace of config' },
      { flags: '--length <length>', description: 'Api key length', default: '32' },
    ],
    action: async (opts: DtoApiKeyReset) => {
      const reset = await apiKeyService.reset(opts);

      const cols: Array<[keyof typeof reset, string]> = [
        ['id', 'Id'],
        ['formattedKey', 'Auth Key'],
        ['type', 'Api Key Type'],
      ];

      if (reset.type === EApiKeyType.THIRD_PARTY) {
        cols.push(['publicKey', 'Third Party public key']);
      }

      printGrid(reset, cols);

      process.exit(1);
    },
  },
  {
    name: 'edit',
    description: 'update api key',
    options: [
      { required: true, flags: '--code <code>', description: 'App code' },
      { required: true, flags: '--id <id>', description: 'Api key id' },
      { flags: '--description <description>', description: 'Api key length', default: '' },
      { flags: '--isDelete [boolean]', description: 'Is Delete Api Key', default: false },
    ],
    action: async (opts: DtoApiKeyUpdate) => {
      await apiKeyService.update(opts);

      const cols: Array<[keyof DtoApiKeyUpdate, string]> = [
        ['id', 'Id'],
        ['description', 'Description'],
        ['isDelete', 'Delete'],
      ];

      printGrid(opts, cols);

      process.exit(1);
    },
  },
];

export const registerApiKeyCommands = (program: Command) => {
  const { apiKeyService } = getServices();

  buildCliCommand(Commands(apiKeyService), CommandPrefix, program);
};
