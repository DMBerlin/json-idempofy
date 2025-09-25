import { IdempotencyConfig, FingerprintResult } from './types';
import { createDeterministicString } from './normalizers';
import { extractFields } from './transformations';
import { createHashWithConfig } from './hashing';

/**
 * Strict strategy: Full payload normalization with SHA-256
 */
export function strictStrategy(payload: any, config: IdempotencyConfig = {}): FingerprintResult {
  const options = {
    normalizeDates: true,
    sortKeys: true,
    excludeNulls: false,
    trimStrings: true,
    caseSensitive: false,
    ...config.options,
  };

  const normalizedString = createDeterministicString(payload, options);
  const hashResult = createHashWithConfig(normalizedString, config.hashing);

  return {
    fingerprint: hashResult.hash,
    strategy: 'strict',
    includedFields: Object.keys(payload || {}),
    algorithm: hashResult.algorithm,
    ...(hashResult.keyId && { keyId: hashResult.keyId }),
    warnings: [],
  };
}

/**
 * Selective strategy: Only include specified fields
 */
export function selectiveStrategy(payload: any, config: IdempotencyConfig): FingerprintResult {
  if (!config.fields || config.fields.length === 0) {
    throw new Error('Selective strategy requires fields to be specified');
  }

  const extracted = extractFields(payload, config);
  const options = {
    normalizeDates: true,
    sortKeys: true,
    excludeNulls: true,
    trimStrings: true,
    caseSensitive: false,
    ...config.options,
  };

  const normalizedString = createDeterministicString(extracted, options);
  const hashResult = createHashWithConfig(normalizedString, config.hashing);

  return {
    fingerprint: hashResult.hash,
    strategy: 'selective',
    includedFields: config.fields,
    algorithm: hashResult.algorithm,
    ...(hashResult.keyId && { keyId: hashResult.keyId }),
    warnings: [],
  };
}

/**
 * Semantic strategy: Smart normalization for business logic
 */
export function semanticStrategy(payload: any, config: IdempotencyConfig = {}): FingerprintResult {
  const options = {
    normalizeDates: true,
    sortKeys: true,
    excludeNulls: true,
    excludeEmptyStrings: true,
    trimStrings: true,
    caseSensitive: false,
    precision: 2,
    ...config.options,
  };

  // Handle common business scenarios
  const warnings: string[] = [];

  // Check for potential issues
  if (typeof payload === 'object' && payload !== null) {
    const keys = Object.keys(payload);
    if (keys.length === 0) {
      warnings.push('Empty object may not provide sufficient uniqueness');
    }

    // Check for timestamp fields that might cause issues
    const timestampFields = keys.filter(
      (key) =>
        key.toLowerCase().includes('timestamp') ||
        key.toLowerCase().includes('time') ||
        key.toLowerCase().includes('date')
    );

    if (timestampFields.length > 0) {
      warnings.push(
        `Timestamp fields detected: ${timestampFields.join(', ')}. Consider using selective strategy for better control.`
      );
    }
  }

  // Pre-process dates to ensure consistent handling
  const preprocessedPayload = preprocessDates(payload);
  const normalizedString = createDeterministicString(preprocessedPayload, options);
  const hashResult = createHashWithConfig(normalizedString, config.hashing);

  return {
    fingerprint: hashResult.hash,
    strategy: 'semantic',
    includedFields: Object.keys(payload || {}),
    algorithm: hashResult.algorithm,
    ...(hashResult.keyId && { keyId: hashResult.keyId }),
    warnings,
  };
}

/**
 * Pre-process dates to ensure consistent handling
 */
function preprocessDates(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (typeof obj === 'string' && isISODateString(obj)) {
    return new Date(obj).toISOString();
  }

  if (Array.isArray(obj)) {
    return obj.map(preprocessDates);
  }

  if (typeof obj === 'object') {
    const processed: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      processed[key] = preprocessDates(value);
    }
    return processed;
  }

  return obj;
}

/**
 * Check if a string is a valid ISO date string
 */
function isISODateString(str: string): boolean {
  if (typeof str !== 'string') return false;
  const date = new Date(str);
  return !isNaN(date.getTime()) && str.includes('T') && str.includes('Z');
}

/**
 * Custom strategy: User-defined field selection and transformations
 */
export function customStrategy(payload: any, config: IdempotencyConfig): FingerprintResult {
  if (!config.fields || config.fields.length === 0) {
    throw new Error('Custom strategy requires fields to be specified');
  }

  const extracted = extractFields(payload, config);
  const options = {
    normalizeDates: true,
    sortKeys: true,
    excludeNulls: true,
    trimStrings: true,
    caseSensitive: false,
    ...config.options,
  };

  const normalizedString = createDeterministicString(extracted, options);
  const hashResult = createHashWithConfig(normalizedString, config.hashing);

  return {
    fingerprint: hashResult.hash,
    strategy: 'custom',
    includedFields: config.fields,
    algorithm: hashResult.algorithm,
    ...(hashResult.keyId && { keyId: hashResult.keyId }),
    warnings: [],
  };
}
