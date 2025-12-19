import fs from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { TEST_CONSTANTS } from '../../constants/test';
import { ECacheKey } from '../../enums';
import { CacheKeyGenerator, Exception } from '../../helpers';
import { env } from '../../libs';
import { getServices } from '../../services';
import { TKeyServiceGetRotateKey } from '../../types';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST);
const type = TEST_CONSTANTS.type.base;
const rotateKeyParams: TKeyServiceGetRotateKey = {
  type,
  options: {
    bytes: 32,
    onGenerateDuration: {
      amount: 30,
      unit: 'd',
    },
  },
};
const expiredContent = `1999-01-01T00:00:00.000Z|2000-01-01T00:01:00.000Z|EXPIRED`;
const notStartContent = `2100-01-01T00:00:00.000Z|2100-01-01T00:01:00.000Z|EXPIRED`;

describe('Key Service / GetRotateKey', () => {
  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey.ne || RUN_FULL_TEST)(
    '(S) Not exist',
    async () => {
      const { keyService } = getServices();

      const typeNonExist = `${type}-${Date.now()}`;

      const key = await keyService.getRotateKey({
        ...rotateKeyParams,
        type: typeNonExist,
      });

      const content = await fs.readFile(`keys/${typeNonExist}/v_${key.version}.txt`, 'utf8');

      expect(content).contain(key.key);
    }
  );

  // Unit test: Edge case
  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey['e-kfne'] || RUN_FULL_TEST)(
    '(S) Exist / Key file not exist',
    async () => {
      const { keyService } = getServices();

      const key = await keyService.getRotateKey(rotateKeyParams);

      const content = await fs.readFile(`keys/${type}/v_${key.version}.txt`, 'utf8');

      expect(content).contain(key.key);
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey['e-kfe-vt'] || RUN_FULL_TEST)(
    '(S) Exist / Key file exist / Valid time',
    async () => {
      const { keyService } = getServices();

      const key = await keyService.getRotateKey(rotateKeyParams);

      const content = await fs.readFile(`keys/${type}/v_${key.version}.txt`, 'utf8');

      expect(content).contain(key.key);
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey['e-kfe-e'] || RUN_FULL_TEST)(
    '(F) Exist / Key file exist / Expire',
    async () => {
      const { keyService, cacheService } = getServices();

      // Make sure this have key file
      const { version } = await keyService.generate({
        type: type,
        bytes: rotateKeyParams.options.bytes,
        duration: rotateKeyParams.options.onGenerateDuration,
        useRotate: true,
      });

      const cacheKey = CacheKeyGenerator.custom(ECacheKey.KEY, type, version);
      const cache = await cacheService.get<string>(cacheKey);
      const content: string | null = await fs.readFile(`keys/${type}/v_${version}.txt`, 'utf8');

      if (cache) {
        await cacheService.set(cacheKey, expiredContent);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, expiredContent, 'utf-8');
      }
      try {
        await keyService.getRotateKey({
          type: type,
          options: {
            ...rotateKeyParams.options,
            version: version,
          },
        });
      } catch (e) {
        expect(e).toBeInstanceOf(Exception);
      }

      if (cache) {
        await cacheService.delete(cacheKey);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, content, 'utf-8');
      }
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey['e-kfe-e-r'] || RUN_FULL_TEST)(
    '(S) Exist / Key file exist / Expire / Renew',
    async () => {
      const { keyService, cacheService } = getServices();

      // Make sure this have key file
      const { version } = await keyService.generate({
        type: type,
        bytes: rotateKeyParams.options.bytes,
        duration: rotateKeyParams.options.onGenerateDuration,
        useRotate: true,
      });

      const cacheKey = CacheKeyGenerator.custom(ECacheKey.KEY, type, version);
      const cache = await cacheService.get<string>(cacheKey);
      const content: string | null = await fs.readFile(`keys/${type}/v_${version}.txt`, 'utf8');

      if (cache) {
        await cacheService.set(cacheKey, expiredContent);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, expiredContent, 'utf-8');
      }

      const renew = await keyService.getRotateKey({
        type: type,
        options: {
          ...rotateKeyParams.options,
          renewOnExpire: true,
          version: version,
        },
      });

      expect(renew.expiredKey).not.toBeNull();

      if (cache) {
        await cacheService.delete(cacheKey);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, content, 'utf-8');
      }
    }
  );

  test.runIf(TEST_CONSTANTS.run.keyService.getRotateKey['e-kfe-ns'] || RUN_FULL_TEST)(
    '(F) Exist / Key file exist / Not Start',
    async () => {
      const { keyService, cacheService } = getServices();

      // Make sure this have key file
      const { version } = await keyService.generate({
        type: type,
        bytes: rotateKeyParams.options.bytes,
        duration: rotateKeyParams.options.onGenerateDuration,
        useRotate: true,
      });

      const cacheKey = CacheKeyGenerator.custom(ECacheKey.KEY, type, version);
      const cache = await cacheService.get<string>(cacheKey);
      const content: string | null = await fs.readFile(`keys/${type}/v_${version}.txt`, 'utf8');

      if (cache) {
        await cacheService.set(cacheKey, notStartContent);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, notStartContent, 'utf-8');
      }

      await expect(
        keyService.getRotateKey({
          type: type,
          options: {
            ...rotateKeyParams.options,
            version: version,
          },
        })
      ).rejects.toThrow(Exception);

      if (cache) {
        await cacheService.delete(cacheKey);
      } else if (content) {
        await fs.writeFile(`keys/${type}/v_${version}.txt`, content, 'utf-8');
      }
    }
  );
});
