import { describe, expect, test } from 'vitest';
import { env } from '../../libs';
import { TEST_CONSTANTS } from '../../constants/test';
import { TValidationResult, Validator, vSchema } from '../../utils';
import { EErrorCode } from '../../enums';

const RUN_FULL_TEST = Boolean(env.RUN_FULL_TEST);

type TTestcases = Array<{
  value: unknown;
  rules: Array<{
    ret?: boolean;
    validator: Exclude<keyof Validator, 'execute' | 'setError'>;
    message?: EErrorCode;
    itemSchema?: Parameters<Validator['array']>;
    shape?: Parameters<Validator['object']>;
    custom?: Parameters<Validator['custom']>;
    expect: (result: TValidationResult<any>) => boolean;
  }>;
}>;

describe('Utils / Validator', () => {
  test.runIf(TEST_CONSTANTS.run.utils.validator.ok || RUN_FULL_TEST)('Cases', () => {
    const tests: TTestcases = [
      {
        value: 1,
        rules: [
          {
            ret: true,
            validator: 'string',
            message: EErrorCode.VALIDATOR_MUST_BE_STRING,
            expect(result) {
              expect(result.success).not.toBe(true);
              if (result.success) return false;

              expect(result.code).toBe(EErrorCode.VALIDATOR_MUST_BE_STRING);
              return true;
            },
          },
          {
            ret: true,
            validator: 'number',
            message: EErrorCode.VALIDATOR_MUST_BE_NUMBER,
            expect(result) {
              expect(result.success).not.toBe(false);
              if (!result.success) return false;

              expect(result.data).toBe(1);
              return true;
            },
          },
        ],
      },
      {
        value: 'a',
        rules: [
          {
            ret: true,
            validator: 'number',
            message: EErrorCode.VALIDATOR_MUST_BE_NUMBER,
            expect(result) {
              expect(result.success).not.toBe(true);
              if (result.success) return false;

              expect(result.code).toBe(EErrorCode.VALIDATOR_MUST_BE_NUMBER);
              return true;
            },
          },
          {
            ret: true,
            validator: 'string',
            message: EErrorCode.VALIDATOR_MUST_BE_STRING,
            expect(result) {
              expect(result.success).not.toBe(false);
              if (!result.success) return false;

              expect(result.data).toBe('a');
              return true;
            },
          },
        ],
      },
      {
        value: { nested: { nestedTest: true }, test: true },
        rules: [
          {
            ret: true,
            validator: 'object',
            message: EErrorCode.VALIDATOR_MUST_BE_OBJECT,
            shape: {
              test: vSchema.boolean(),
              nested: vSchema.object({
                nestedTest: vSchema.boolean(),
              }),
            } as any,
            expect: (
              result: TValidationResult<{ nested: { nestedTest: boolean }; test: boolean }>
            ) => {
              expect(result.success).not.toBe(false);
              if (!result.success) return false;

              expect(result.data.test).toBe(true);
              expect(result.data.nested).toBeTypeOf('object');
              expect(result.data.nested.nestedTest).toBe(true);
              return true;
            },
          },
          {
            ret: true,
            validator: 'object',
            message: EErrorCode.VALIDATOR_MUST_BE_OBJECT,
            shape: {
              test: vSchema.boolean(),
            } as any,
            expect: (
              result: TValidationResult<{ nested: { nestedTest: boolean }; test: boolean }>
            ) => {
              expect(result.success).not.toBe(false);
              if (!result.success) return false;

              expect(result.data.test).toBe(true);
              expect(result.data.nested).not.toBeTypeOf('object');
              return true;
            },
          },
          {
            ret: true,
            validator: 'object',
            message: EErrorCode.VALIDATOR_MUST_BE_OBJECT,
            shape: {
              test: vSchema.number(),
              nested: vSchema.object({
                nestedTest: vSchema.boolean(),
              }),
            } as any,
            expect: (
              result: TValidationResult<{ nested: { nestedTest: boolean }; test: boolean }>
            ) => {
              expect(result.success).not.toBe(true);
              if (result.success) return false;

              expect(result.code).toBe(EErrorCode.VALIDATOR_MUST_BE_OBJECT);
              return true;
            },
          },
        ],
      },
    ];

    for (const test of tests) {
      const v = new Validator(test.value);

      for (const rule of test.rules) {
        const { ret, validator } = rule;

        let execute = v;

        if (rule.message) v.setError(rule.message);

        if (validator === 'array' && rule.itemSchema) {
          execute = v.array(rule.itemSchema as any);
        } else if (validator === 'object' && rule.shape) {
          execute = v.object(rule.shape as any);
        } else if (validator === 'custom' && rule.custom) {
          execute = v.custom(rule.custom as any);
        } else {
          execute =
            v[
              validator as Exclude<
                TTestcases[number]['rules'][number]['validator'],
                'array' | 'object' | 'custom' | 'setError'
              >
            ]();
        }

        const validated = execute.execute();
        const expectCheck = rule.expect(validated);

        if (ret && !expectCheck) return;
      }
    }
  });
});
