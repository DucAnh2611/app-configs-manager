import { describe, expect, test } from 'vitest';
import { TEST_CONSTANTS } from '../../constants/test';
import { EErrorCode } from '../../enums';
import { Exception } from '../../helpers';
import { env } from '../../libs';
import { getServices } from '../../services';
import { TConfigDecoded } from '../../types';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST),
  APP_CODE = 'test',
  APP_NAME = 'Test',
  APP_NAMESPACE = 'test';

describe('Config Service / get', () => {
  test.runIf(TEST_CONSTANTS.run.configService.get.o || RUN_FULL_TEST)('(S) Get one', async () => {
    const { configService, appService } = getServices();

    let testApp = await appService.getByCode(APP_CODE);

    if (!testApp) {
      testApp = await appService.create({
        code: APP_CODE,
        name: APP_NAME,
        namespace: APP_NAMESPACE,
      });
    }

    expect(testApp).toBeDefined();

    if (!testApp) return;
    try {
      const appConfig = await configService.get({ appCode: APP_CODE, appNamespace: APP_NAMESPACE });

      expect((appConfig as TConfigDecoded).configs).not.toBeTypeOf('string');
    } catch (error) {
      expect(error).toBeInstanceOf(Exception);
      if (!(error instanceof Exception)) return;

      expect(error.resJson.error).toBe(EErrorCode.CONFIG_NOT_EXIST);
    }
  });
});
