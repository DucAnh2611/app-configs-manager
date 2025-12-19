import { describe, expect, test } from 'vitest';
import { TEST_CONSTANTS } from '../../constants/test';
import { Exception, randNumber } from '../../helpers';
import { env } from '../../libs';
import { getServices } from '../../services';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST);
const APP_CODE = 'test',
  APP_NAME = 'Test',
  APP_NAMESPACE = 'test';

describe('Config Service / up', () => {
  test.runIf(TEST_CONSTANTS.run.configService.up.o || RUN_FULL_TEST)('(S) UP One', async () => {
    const { configService, appService } = getServices();
    let app = await appService.getByCode(APP_CODE);

    if (!app) {
      await appService.create({
        code: APP_CODE,
        name: APP_NAME,
        namespace: APP_NAMESPACE,
      });

      app = await appService.getByCode(APP_CODE);
    }

    expect(app).not.toBeNull();
    if (!app) return;

    try {
      await configService.up({
        appCode: APP_CODE,
        appNamespace: APP_NAMESPACE,
        appId: app.id,
        configs: {
          [randNumber({ from: 1, to: 10_000_000, decimal: 10 }).toString()]: 'test',
          testing: true,
        },
      });

      return;
    } catch (error) {
      expect(error).toBeInstanceOf(Exception);
      if (!(error instanceof Exception)) return;
    }
  });
});
