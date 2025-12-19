import { describe, expect, test } from 'vitest';
import { TEST_CONSTANTS } from '../../constants/test';
import { bindStringFormat, decrypt, encrypt, randNumber } from '../../helpers';
import { env, uuid } from '../../libs';
import { getServices } from '../../services';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST);

describe('Helper / Crypto', () => {
  test.runIf(TEST_CONSTANTS.run.helpers.crypto.e || RUN_FULL_TEST)('(S) Encrypt', async () => {
    const { keyService } = getServices();

    const { key, hashBytes } = await keyService.getRotateKey({
      type: bindStringFormat('{uuid}', { uuid: uuid() }),
      options: {
        bytes: randNumber({ from: 32, to: 64, decimal: 0 }),
        renewOnExpire: true,
        onGenerateDuration: {
          amount: 30,
          unit: 's',
        },
      },
    });

    const payload = {
      foo: 'bar',
      count: 123,
      nested: { ok: true },
    };

    const result = encrypt(payload, key, hashBytes);

    expect(result).toBeDefined();
    expect(result.encryptedPayload).toBeTypeOf('string');
    expect(result.encryptedPayload.length).toBeGreaterThan(0);

    const decoded = Buffer.from(result.encryptedPayload, 'base64');
    expect(decoded.length).toBeGreaterThan(hashBytes);
  });

  test.runIf(TEST_CONSTANTS.run.helpers.crypto['e+d'] || RUN_FULL_TEST)(
    '(S) Encrypt + Decrypt',
    async () => {
      const { keyService } = getServices();

      const { key, hashBytes } = await keyService.getRotateKey({
        type: bindStringFormat('crypto_test', {}),
        options: {
          bytes: randNumber({ from: 32, to: 64, decimal: 0 }),
          renewOnExpire: true,
          onGenerateDuration: {
            amount: 30,
            unit: 's',
          },
        },
      });

      const payload = {
        string: '(S) Encrypt + Decrypto',
        number: 1,
        array: [],
        object: { ok: true },
      };

      const { encryptedPayload } = encrypt(payload, key, hashBytes);

      expect(encryptedPayload).toBeTypeOf('string');
      expect(encryptedPayload.length).toBeGreaterThan(0);

      const decrypted = decrypt<typeof payload>(encryptedPayload, key);

      expect(decrypted).toEqual(payload);
    }
  );
});
