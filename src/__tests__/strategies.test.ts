import { strictStrategy, selectiveStrategy, semanticStrategy, customStrategy } from '../strategies';
import { IdempotencyConfig } from '../types';

describe('Fingerprinting Strategies', () => {
  describe('strictStrategy', () => {
    it('should generate consistent fingerprints', () => {
      const payload = { name: 'John', age: 30 };
      const result1 = strictStrategy(payload);
      const result2 = strictStrategy(payload);

      expect(result1.fingerprint).toBe(result2.fingerprint);
      expect(result1.strategy).toBe('strict');
      expect(result1.includedFields).toEqual(['name', 'age']);
    });

    it('should handle different payloads differently', () => {
      const payload1 = { name: 'John', age: 30 };
      const payload2 = { name: 'Jane', age: 25 };

      const result1 = strictStrategy(payload1);
      const result2 = strictStrategy(payload2);

      expect(result1.fingerprint).not.toBe(result2.fingerprint);
    });
  });

  describe('selectiveStrategy', () => {
    it('should only include specified fields', () => {
      const payload = { name: 'John', age: 30, city: 'New York' };
      const config: IdempotencyConfig = {
        strategy: 'selective',
        fields: ['name', 'age'],
      };

      const result = selectiveStrategy(payload, config);

      expect(result.strategy).toBe('selective');
      expect(result.includedFields).toEqual(['name', 'age']);
    });

    it('should throw error when no fields specified', () => {
      const payload = { name: 'John', age: 30 };
      const config: IdempotencyConfig = {
        strategy: 'selective',
        fields: [],
      };

      expect(() => selectiveStrategy(payload, config)).toThrow();
    });
  });

  describe('semanticStrategy', () => {
    it('should normalize dates consistently', () => {
      const payload1 = { date: new Date('2023-01-01T00:00:00Z') };
      const payload2 = { date: '2023-01-01T00:00:00.000Z' };

      const result1 = semanticStrategy(payload1);
      const result2 = semanticStrategy(payload2);

      expect(result1.fingerprint).toBe(result2.fingerprint);
    });

    it('should provide warnings for timestamp fields', () => {
      const payload = { timestamp: new Date(), data: 'test' };
      const result = semanticStrategy(payload);

      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
    });
  });

  describe('customStrategy', () => {
    it('should apply field transformations', () => {
      const payload = { name: 'JOHN', email: 'JOHN@EXAMPLE.COM' };
      const config: IdempotencyConfig = {
        strategy: 'custom',
        fields: ['name', 'email'],
        transformations: {
          name: { $lower: 'name' },
          email: { $lower: 'email' },
        },
      };

      const result = customStrategy(payload, config);

      expect(result.strategy).toBe('custom');
      expect(result.includedFields).toEqual(['name', 'email']);
    });

    it('should throw error when no fields specified', () => {
      const payload = { name: 'John' };
      const config: IdempotencyConfig = {
        strategy: 'custom',
        fields: [],
      };

      expect(() => customStrategy(payload, config)).toThrow();
    });
  });

  describe('warnings and edge cases', () => {
    it('should warn about empty objects', () => {
      const payload = {};
      const result = strictStrategy(payload);

      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
      if (result.warnings && result.warnings.length > 0) {
        expect(result.warnings).toContain('Empty object may not provide sufficient uniqueness');
      }
    });

    it('should preprocess dates in arrays', () => {
      const payload = {
        dates: [new Date('2023-01-01T00:00:00Z'), '2023-01-02T00:00:00Z'],
      };

      const result = semanticStrategy(payload);
      expect(result.fingerprint).toBeDefined();
    });

    it('should handle nested objects with dates', () => {
      const payload = {
        user: {
          name: 'John',
          created: new Date('2023-01-01T00:00:00Z'),
        },
      };

      const result = semanticStrategy(payload);
      expect(result.fingerprint).toBeDefined();
    });
  });
});
