import z from 'zod';
import { EErrorCode, EResponseStatus } from '../enums';
import { Exception, valueOrDefault } from '../helpers';

export type TValidationResult<T extends unknown> =
  | { success: true; data: T }
  | { success: false; code: EErrorCode | null };

export class Validator<T extends unknown = unknown> {
  private errorCode?: EErrorCode;
  constructor(
    private readonly data: T,
    private schema?: z.ZodSchema
  ) {}

  setError(errorCode: EErrorCode) {
    this.errorCode = errorCode;
  }

  number() {
    this.schema = z.number({ message: this.errorCode });
    return this;
  }

  string() {
    this.schema = z.string({ message: this.errorCode });
    return this;
  }

  boolean() {
    this.schema = z.boolean({ message: this.errorCode });
    return this;
  }

  array(itemSchema: z.ZodSchema = z.unknown()) {
    this.schema = z.array(itemSchema, { message: this.errorCode });
    return this;
  }

  /**
   * If field not have in shape -> remove
   */
  object(shape: z.ZodRawShape = {}) {
    this.schema = z.object(shape, { message: this.errorCode });
    return this;
  }

  custom(schema: z.ZodSchema) {
    this.schema = schema;
    return this;
  }

  execute<S>(): TValidationResult<S> {
    if (!this.schema) {
      throw new Exception(EResponseStatus.BadRequest, EErrorCode.VALIDATOR_NO_SCHEMA);
    }

    try {
      const parsed = this.schema.parse(this.data);
      return { success: true, data: parsed as S };
    } catch {
      return { success: false, code: valueOrDefault(this.errorCode, null) };
    }
  }

  reset() {
    delete this.errorCode;
    delete this.schema;

    return this;
  }
}

export const vSchema = { ...z };
