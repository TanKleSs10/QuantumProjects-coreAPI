/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Schema<T> {
  parse(input: unknown): T;
  optional(): Schema<T | undefined>;
  default(value: T): Schema<T>;
}

abstract class BaseSchema<T> implements Schema<T> {
  abstract parse(input: unknown): T;

  optional(): Schema<T | undefined> {
    return new OptionalSchema(this);
  }

  default(value: T): Schema<T> {
    return new DefaultSchema(this, value);
  }
}

class OptionalSchema<T> extends BaseSchema<T | undefined> {
  constructor(private readonly inner: Schema<T>) {
    super();
  }

  parse(input: unknown): T | undefined {
    if (input === undefined || input === null) {
      return undefined;
    }

    return this.inner.parse(input);
  }
}

class DefaultSchema<T> extends BaseSchema<T> {
  constructor(
    private readonly inner: Schema<T>,
    private readonly fallback: T,
  ) {
    super();
  }

  parse(input: unknown): T {
    if (input === undefined || input === null) {
      return this.fallback;
    }

    return this.inner.parse(input);
  }
}

class StringSchema extends BaseSchema<string> {
  private minLength?: number;
  private maxLength?: number;
  private shouldTrim = false;
  private requireEmailValidation = false;
  private requireUrlValidation = false;

  parse(input: unknown): string {
    if (typeof input !== "string") {
      throw new TypeError("Expected string");
    }

    let value = this.shouldTrim ? input.trim() : input;

    if (this.minLength !== undefined && value.length < this.minLength) {
      throw new Error(`String must contain at least ${this.minLength} characters`);
    }

    if (this.maxLength !== undefined && value.length > this.maxLength) {
      throw new Error(`String must contain at most ${this.maxLength} characters`);
    }

    if (this.requireEmailValidation) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        throw new Error("Invalid email address");
      }
    }

    if (this.requireUrlValidation) {
      try {
        // eslint-disable-next-line no-new
        new URL(value);
      } catch {
        throw new Error("Invalid URL");
      }
    }

    return value;
  }

  trim(): StringSchema {
    const next = this.clone();
    next.shouldTrim = true;
    return next;
  }

  min(length: number, _message?: string): StringSchema {
    const next = this.clone();
    next.minLength = length;
    return next;
  }

  max(length: number, _message?: string): StringSchema {
    const next = this.clone();
    next.maxLength = length;
    return next;
  }

  email(_message?: string): StringSchema {
    const next = this.clone();
    next.requireEmailValidation = true;
    return next;
  }

  url(_message?: string): StringSchema {
    const next = this.clone();
    next.requireUrlValidation = true;
    return next;
  }

  private clone(): StringSchema {
    const schema = new StringSchema();
    schema.minLength = this.minLength;
    schema.maxLength = this.maxLength;
    schema.shouldTrim = this.shouldTrim;
    schema.requireEmailValidation = this.requireEmailValidation;
    schema.requireUrlValidation = this.requireUrlValidation;
    return schema;
  }
}

class BooleanSchema extends BaseSchema<boolean> {
  parse(input: unknown): boolean {
    if (typeof input === "boolean") {
      return input;
    }

    if (input === "true") {
      return true;
    }

    if (input === "false") {
      return false;
    }

    throw new TypeError("Expected boolean");
  }
}

class EnumSchema<T extends string | number> extends BaseSchema<T> {
  private readonly values: Set<T>;

  constructor(private readonly enumObj: Record<string, T>) {
    super();
    this.values = new Set(Object.values(enumObj));
  }

  parse(input: unknown): T {
    if (this.values.has(input as T)) {
      return input as T;
    }

    throw new Error("Invalid enum value");
  }
}

class ArraySchema<T> extends BaseSchema<T[]> {
  constructor(private readonly element: Schema<T>) {
    super();
  }

  parse(input: unknown): T[] {
    if (!Array.isArray(input)) {
      throw new TypeError("Expected array");
    }

    return input.map((item) => this.element.parse(item));
  }
}

class DateSchema extends BaseSchema<Date> {
  parse(input: unknown): Date {
    if (input instanceof Date) {
      return input;
    }

    if (typeof input === "string" || typeof input === "number") {
      const parsed = new Date(input);
      if (Number.isNaN(parsed.getTime())) {
        throw new Error("Invalid date");
      }
      return parsed;
    }

    throw new TypeError("Expected date-like value");
  }
}

type Shape = Record<string, Schema<any>>;

type SchemaInfer<T extends Schema<any>> = T extends Schema<infer U> ? U : never;

type InferShape<S extends Shape> = {
  [K in keyof S]: SchemaInfer<S[K]>;
};

class ObjectSchema<S extends Shape> extends BaseSchema<InferShape<S>> {
  constructor(private readonly shape: S) {
    super();
  }

  parse(input: unknown): InferShape<S> {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      throw new TypeError("Expected object");
    }

    const record = input as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      result[key] = schema.parse(record[key]);
    }

    return result as InferShape<S>;
  }
}

function string() {
  return new StringSchema();
}

export const z = {
  string,
  boolean: () => new BooleanSchema(),
  array: <T>(schema: Schema<T>) => new ArraySchema(schema),
  nativeEnum: <T extends Record<string, string | number>>(enumObj: T) =>
    new EnumSchema<T[keyof T]>(enumObj as unknown as Record<string, T[keyof T]>),
  object: <S extends Shape>(shape: S) => new ObjectSchema(shape),
  coerce: {
    date: () => new DateSchema(),
  },
};

export namespace z {
  export type infer<T extends Schema<any>> = SchemaInfer<T>;
}
