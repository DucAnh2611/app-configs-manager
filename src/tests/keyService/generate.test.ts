import fs from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { TEST_CONSTANTS } from '../../constants/test';
import { Exception } from '../../helpers';
import { env } from '../../libs';
import { getServices } from '../../services';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST);

describe('Key Service / Generate', () => {
  test.runIf(TEST_CONSTANTS.run.keyService.generate.rk || RUN_FULL_TEST)(
    '(S) Rotate key',
    async () => {
      const { keyService } = getServices();
      const type = TEST_CONSTANTS.type.base;

      const key = await keyService.generate({
        bytes: 32,
        type,
        duration: {
          amount: 30,
          unit: 'd',
        },
        useRotate: true,
      });

      const content = await fs.readFile(`keys/${type}/v_${key.version}.txt`, 'utf8');

      expect(content).contain(key.key);
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.generate.ik || RUN_FULL_TEST)(
    '(S) Infinity key',
    async () => {
      const { keyService } = getServices();
      const type = TEST_CONSTANTS.type.inf;

      const key = await keyService.generate({
        bytes: 32,
        type,
      });

      const content = await fs.readFile(`keys/${type}/v_${key.version}.txt`, 'utf8');

      expect(content).contain(key.key);
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.generate.rkmd || RUN_FULL_TEST)(
    '(F) Rotate key missing duration',
    async () => {
      const { keyService } = getServices();

      await expect(
        keyService.generate({
          bytes: 32,
          type: TEST_CONSTANTS.type.base,
          useRotate: true,
        })
      ).rejects.toThrow(Exception);
    }
  );
});
