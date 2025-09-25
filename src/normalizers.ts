import { NormalizationOptions } from './types';
import { toJCSString } from './jcs';

/**
 * Normalizes a JSON value according to the specified options
 */
export function normalizeValue(
  value: any,
  options: NormalizationOptions = {},
  seen = new WeakSet()
): any {
  if (value === null || value === undefined) {
    if (options.excludeNulls) {
      return undefined;
    }
    return value;
  }

  if (typeof value === 'string') {
    if (options.excludeEmptyStrings && value === '') {
      return undefined;
    }
    if (options.trimStrings) {
      value = value.trim();
    }
    if (!options.caseSensitive) {
      value = value.toLowerCase();
    }
    return value;
  }

  if (typeof value === 'number') {
    if (options.precision !== undefined) {
      return Math.round(value * Math.pow(10, options.precision)) / Math.pow(10, options.precision);
    }
    return value;
  }

  if (value instanceof Date) {
    if (options.normalizeDates) {
      return value.toISOString();
    }
    return value;
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalizeValue(item, options, seen))
      .filter((item) => item !== undefined);
    return normalized;
  }

  if (typeof value === 'object') {
    // Check for circular references
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);

    const normalized: Record<string, any> = {};
    const keys = options.sortKeys ? Object.keys(value).sort() : Object.keys(value);

    for (const key of keys) {
      const normalizedKey = options.caseSensitive ? key : key.toLowerCase();
      const normalizedValue = normalizeValue(value[key], options, seen);

      if (normalizedValue !== undefined) {
        normalized[normalizedKey] = normalizedValue;
      }
    }

    return normalized;
  }

  return value;
}

/**
 * Creates a deterministic string representation of a JSON object
 * Uses JCS (JSON Canonicalization Scheme) for maximum stability
 */
export function createDeterministicString(obj: any, options: NormalizationOptions = {}): string {
  const normalized = normalizeValue(obj, options);

  // Use JCS for canonical serialization
  if (options.useJCS !== false) {
    // Default to true
    return toJCSString(normalized);
  }

  // Fallback to regular JSON.stringify if JCS is disabled
  return JSON.stringify(normalized);
}

/**
 * Handles circular references in objects
 */
export function safeStringify(obj: any, options: NormalizationOptions = {}): string {
  const seen = new WeakSet();

  function replacer(key: string, value: any): any {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  }

  const normalized = normalizeValue(obj, options);

  // Use JCS for canonical serialization
  if (options.useJCS !== false) {
    // Default to true
    return toJCSString(normalized);
  }

  // Fallback to regular JSON.stringify if JCS is disabled
  return JSON.stringify(normalized, replacer);
}
