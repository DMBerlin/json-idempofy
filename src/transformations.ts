import { FieldTransformation, IdempotencyConfig } from './types';
import { getNestedValue } from './nested-fields';

/**
 * Applies field transformations to extract and normalize field values
 */
export function applyTransformation(
  payload: Record<string, any>,
  field: string,
  transformation: FieldTransformation
): any {
  if (typeof transformation === 'string') {
    return getNestedValue(payload, transformation);
  }

  if ('$date' in transformation) {
    const value = getNestedValue(payload, transformation.$date);
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  }

  if ('$round' in transformation) {
    const value = getNestedValue(payload, field);
    if (typeof value === 'number') {
      return (
        Math.round(value * Math.pow(10, transformation.$round)) /
        Math.pow(10, transformation.$round)
      );
    }
    return value;
  }

  if ('$lower' in transformation) {
    const value = getNestedValue(payload, transformation.$lower);
    return typeof value === 'string' ? value.toLowerCase() : value;
  }

  if ('$upper' in transformation) {
    const value = getNestedValue(payload, transformation.$upper);
    return typeof value === 'string' ? value.toUpperCase() : value;
  }

  if ('$trim' in transformation) {
    const value = getNestedValue(payload, transformation.$trim);
    return typeof value === 'string' ? value.trim() : value;
  }

  if ('$replace' in transformation) {
    const value = getNestedValue(payload, field);
    if (typeof value === 'string') {
      return value.replace(
        new RegExp(transformation.$replace.from, 'g'),
        transformation.$replace.to
      );
    }
    return value;
  }

  if ('$if' in transformation) {
    const condition = getNestedValue(payload, transformation.$if.condition);
    if (condition) {
      return getNestedValue(payload, transformation.$if.then);
    }
    return transformation.$if.else ? getNestedValue(payload, transformation.$if.else) : undefined;
  }

  if ('$exists' in transformation) {
    const value = getNestedValue(payload, transformation.$exists);
    return value !== undefined && value !== null;
  }

  if ('$default' in transformation) {
    const value = getNestedValue(payload, field);
    return value !== undefined && value !== null ? value : transformation.$default;
  }

  return getNestedValue(payload, field);
}

// getNestedValue is now imported from nested-fields.ts

/**
 * Extracts fields from payload based on configuration
 */
export function extractFields(
  payload: Record<string, any>,
  config: IdempotencyConfig
): Record<string, any> {
  const { fields = [], transformations = {} } = config;

  if (fields.length === 0) {
    return payload;
  }

  const extracted: Record<string, any> = {};

  for (const field of fields) {
    if (transformations[field]) {
      extracted[field] = applyTransformation(payload, field, transformations[field]);
    } else {
      extracted[field] = getNestedValue(payload, field);
    }
  }

  return extracted;
}
