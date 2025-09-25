/**
 * Configuration options for idempotency fingerprinting
 */
export interface IdempotencyConfig {
  /** Strategy to use for fingerprinting */
  strategy?: 'strict' | 'selective' | 'semantic' | 'custom';

  /** Fields to include in selective/custom strategies */
  fields?: string[];

  /** Custom field transformations */
  transformations?: Record<string, FieldTransformation>;

  /** Normalization options */
  options?: NormalizationOptions;

  /** Hashing configuration */
  hashing?: HashingConfig;
}

/**
 * Field transformation operators (similar to your existing packages)
 */
export type FieldTransformation =
  | { $date: string } // Convert to ISO date string
  | { $round: number } // Round to N decimal places
  | { $lower: string } // Convert to lowercase
  | { $upper: string } // Convert to uppercase
  | { $trim: string } // Trim whitespace
  | { $replace: { from: string; to: string } } // String replacement
  | { $if: { condition: string; then: string; else?: string } } // Conditional
  | { $exists: string } // Check if field exists
  | { $default: any } // Default value if null/undefined
  | string; // Direct field reference

/**
 * Normalization options
 */
export interface NormalizationOptions {
  /** Normalize dates to ISO format */
  normalizeDates?: boolean;

  /** Round numbers to specified decimal places */
  precision?: number;

  /** Exclude null/undefined values */
  excludeNulls?: boolean;

  /** Exclude empty strings */
  excludeEmptyStrings?: boolean;

  /** Sort object keys */
  sortKeys?: boolean;

  /** Remove whitespace from strings */
  trimStrings?: boolean;

  /** Case sensitivity for string comparison */
  caseSensitive?: boolean;

  /** Use JCS (JSON Canonicalization Scheme) for stable serialization */
  useJCS?: boolean;
}

/**
 * Hashing configuration
 */
export interface HashingConfig {
  /** Hashing algorithm to use */
  algorithm?: 'sha256' | 'sha512' | 'hmac-sha256' | 'hmac-sha512';

  /** Secret key for HMAC (required for HMAC algorithms) */
  secretKey?: string;

  /** Key ID for key rotation (optional) */
  keyId?: string;

  /** Generate a random key if none provided (for HMAC) */
  generateKey?: boolean;
}

/**
 * Result of fingerprint generation
 */
export interface FingerprintResult {
  /** The generated fingerprint */
  fingerprint: string;

  /** Strategy used */
  strategy: string;

  /** Fields included in the fingerprint */
  includedFields: string[];

  /** Hashing algorithm used */
  algorithm?: string;

  /** Key ID used (for HMAC) */
  keyId?: string;

  /** Warnings about potential issues */
  warnings?: string[];
}
