import {
  createHashWithConfig,
  generateSecretKey,
  validateHash,
  getCollisionRisk,
} from '../hashing';
import { HashingConfig } from '../types';

describe('Hashing Functions', () => {
  describe('createHashWithConfig', () => {
    it('should create SHA-256 hash by default', () => {
      const data = 'test data';
      const result = createHashWithConfig(data);

      expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
      expect(result.algorithm).toBe('sha256');
      expect(result.keyId).toBe('default');
    });

    it('should create SHA-512 hash when specified', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha512' };
      const result = createHashWithConfig(data, config);

      expect(result.hash).toMatch(/^[a-f0-9]{128}$/); // SHA-512 hex format
      expect(result.algorithm).toBe('sha512');
    });

    it('should create HMAC-SHA256 when secret key provided', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha256',
        secretKey: 'my-secret-key',
        keyId: 'k1',
      };
      const result = createHashWithConfig(data, config);

      expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // HMAC-SHA256 hex format
      expect(result.algorithm).toBe('hmac-sha256');
      expect(result.keyId).toBe('k1');
    });

    it('should create HMAC-SHA512 when secret key provided', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha512',
        secretKey: 'my-secret-key',
        keyId: 'k2',
      };
      const result = createHashWithConfig(data, config);

      expect(result.hash).toMatch(/^[a-f0-9]{128}$/); // HMAC-SHA512 hex format
      expect(result.algorithm).toBe('hmac-sha512');
      expect(result.keyId).toBe('k2');
    });

    it('should generate random key when generateKey is true', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha256',
        generateKey: true,
      };
      const result = createHashWithConfig(data, config);

      expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.algorithm).toBe('hmac-sha256');
    });

    it('should throw error for HMAC without secret key', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'hmac-sha256' };

      expect(() => createHashWithConfig(data, config)).toThrow(
        'Secret key is required for HMAC-SHA256'
      );
    });

    it('should produce consistent results for same input', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha256' };

      const result1 = createHashWithConfig(data, config);
      const result2 = createHashWithConfig(data, config);

      expect(result1.hash).toBe(result2.hash);
    });

    it('should produce different results for different inputs', () => {
      const data1 = 'test data 1';
      const data2 = 'test data 2';
      const config: HashingConfig = { algorithm: 'sha256' };

      const result1 = createHashWithConfig(data1, config);
      const result2 = createHashWithConfig(data2, config);

      expect(result1.hash).not.toBe(result2.hash);
    });
  });

  describe('generateSecretKey', () => {
    it('should generate keys of specified length', () => {
      const key16 = generateSecretKey(16);
      const key32 = generateSecretKey(32);
      const key64 = generateSecretKey(64);

      expect(key16).toMatch(/^[a-f0-9]{32}$/); // 16 bytes = 32 hex chars
      expect(key32).toMatch(/^[a-f0-9]{64}$/); // 32 bytes = 64 hex chars
      expect(key64).toMatch(/^[a-f0-9]{128}$/); // 64 bytes = 128 hex chars
    });

    it('should generate different keys each time', () => {
      const key1 = generateSecretKey(32);
      const key2 = generateSecretKey(32);

      expect(key1).not.toBe(key2);
    });
  });

  describe('validateHash', () => {
    it('should validate correct hash', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha256' };
      const result = createHashWithConfig(data, config);

      expect(validateHash(data, result.hash, config)).toBe(true);
    });

    it('should reject incorrect hash', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha256' };
      const result = createHashWithConfig(data, config);

      expect(validateHash(data, 'wrong-hash', config)).toBe(false);
    });

    it('should validate HMAC hash', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha256',
        secretKey: 'my-secret-key',
      };
      const result = createHashWithConfig(data, config);

      expect(validateHash(data, result.hash, config)).toBe(true);
    });
  });

  describe('getCollisionRisk', () => {
    it('should return low risk for SHA-256', () => {
      expect(getCollisionRisk('sha256')).toBe('low');
    });

    it('should return low risk for SHA-512', () => {
      expect(getCollisionRisk('sha512')).toBe('low');
    });

    it('should return low risk for HMAC algorithms', () => {
      expect(getCollisionRisk('hmac-sha256')).toBe('low');
      expect(getCollisionRisk('hmac-sha512')).toBe('low');
    });
  });

  describe('HMAC security', () => {
    it('should produce different hashes with different keys', () => {
      const data = 'test data';
      const config1: HashingConfig = {
        algorithm: 'hmac-sha256',
        secretKey: 'key1',
      };
      const config2: HashingConfig = {
        algorithm: 'hmac-sha256',
        secretKey: 'key2',
      };

      const result1 = createHashWithConfig(data, config1);
      const result2 = createHashWithConfig(data, config2);

      expect(result1.hash).not.toBe(result2.hash);
    });

    it('should produce same hash with same key', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha256',
        secretKey: 'same-key',
      };

      const result1 = createHashWithConfig(data, config);
      const result2 = createHashWithConfig(data, config);

      expect(result1.hash).toBe(result2.hash);
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported algorithm', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'unsupported-algorithm' as any,
      };

      expect(() => {
        createHashWithConfig(data, config);
      }).toThrow('Unsupported hashing algorithm: unsupported-algorithm');
    });

    it('should throw error when secret key is missing for HMAC-SHA512', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha512',
      };

      expect(() => {
        createHashWithConfig(data, config);
      }).toThrow('Secret key is required for HMAC-SHA512');
    });
  });

  describe('validateHash', () => {
    it('should return true for valid hash', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha256' };
      const result = createHashWithConfig(data, config);

      expect(validateHash(data, result.hash, config)).toBe(true);
    });

    it('should return false for invalid hash', () => {
      const data = 'test data';
      const config: HashingConfig = { algorithm: 'sha256' };

      expect(validateHash(data, 'invalid-hash', config)).toBe(false);
    });

    it('should return false when hashing throws error', () => {
      const data = 'test data';
      const config: HashingConfig = {
        algorithm: 'hmac-sha256', // Missing secret key will cause error
      };

      expect(validateHash(data, 'some-hash', config)).toBe(false);
    });
  });

  describe('getCollisionRisk', () => {
    it('should return low risk for sha256', () => {
      expect(getCollisionRisk('sha256')).toBe('low');
    });

    it('should return low risk for hmac-sha256', () => {
      expect(getCollisionRisk('hmac-sha256')).toBe('low');
    });

    it('should return low risk for sha512', () => {
      expect(getCollisionRisk('sha512')).toBe('low');
    });

    it('should return low risk for hmac-sha512', () => {
      expect(getCollisionRisk('hmac-sha512')).toBe('low');
    });

    it('should return medium risk for unknown algorithm', () => {
      expect(getCollisionRisk('unknown' as any)).toBe('medium');
    });
  });
});
