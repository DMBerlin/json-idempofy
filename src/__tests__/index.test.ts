import { Idempofy } from '../index';

describe('Idempofy', () => {
  describe('strict strategy', () => {
    it('should generate consistent fingerprints for identical payloads', () => {
      const payload = { name: 'John', age: 30, city: 'New York' };
      const fingerprint1 = Idempofy.strict(payload);
      const fingerprint2 = Idempofy.strict(payload);

      expect(fingerprint1).toBe(fingerprint2);
      expect(fingerprint1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it('should generate different fingerprints for different payloads', () => {
      const payload1 = { name: 'John', age: 30 };
      const payload2 = { name: 'Jane', age: 25 };

      const fingerprint1 = Idempofy.strict(payload1);
      const fingerprint2 = Idempofy.strict(payload2);

      expect(fingerprint1).not.toBe(fingerprint2);
    });

    it('should handle nested objects consistently', () => {
      const payload = {
        user: { name: 'John', age: 30 },
        metadata: { source: 'api', version: '1.0' },
      };

      const fingerprint1 = Idempofy.strict(payload);
      const fingerprint2 = Idempofy.strict(payload);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should normalize object key order', () => {
      const payload1 = { name: 'John', age: 30 };
      const payload2 = { age: 30, name: 'John' };

      const fingerprint1 = Idempofy.strict(payload1);
      const fingerprint2 = Idempofy.strict(payload2);

      expect(fingerprint1).toBe(fingerprint2);
    });
  });

  describe('selective strategy', () => {
    it('should only include specified fields', () => {
      const payload = { name: 'John', age: 30, city: 'New York', country: 'USA' };
      const fields = ['name', 'age'];

      const result = Idempofy.detailed(payload, { strategy: 'selective', fields });

      expect(result.strategy).toBe('selective');
      expect(result.includedFields).toEqual(['name', 'age']);
    });

    it('should generate same fingerprint when non-selected fields change', () => {
      const payload1 = { name: 'John', age: 30, city: 'New York' };
      const payload2 = { name: 'John', age: 30, city: 'Boston' };
      const fields = ['name', 'age'];

      const fingerprint1 = Idempofy.selective(payload1, fields);
      const fingerprint2 = Idempofy.selective(payload2, fields);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should throw error when no fields specified', () => {
      const payload = { name: 'John', age: 30 };

      expect(() => {
        Idempofy.selective(payload, []);
      }).toThrow('Selective strategy requires fields to be specified');
    });
  });

  describe('semantic strategy', () => {
    it('should handle date normalization', () => {
      const payload1 = { date: new Date('2023-01-01T00:00:00Z') };
      const payload2 = { date: '2023-01-01T00:00:00.000Z' };

      const fingerprint1 = Idempofy.semantic(payload1);
      const fingerprint2 = Idempofy.semantic(payload2);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should exclude null values', () => {
      const payload1 = { name: 'John', age: 30, city: null };
      const payload2 = { name: 'John', age: 30 };

      const fingerprint1 = Idempofy.semantic(payload1);
      const fingerprint2 = Idempofy.semantic(payload2);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should handle number precision', () => {
      const payload1 = { price: 19.999 };
      const payload2 = { price: 20.001 };

      const fingerprint1 = Idempofy.semantic(payload1, { precision: 1 });
      const fingerprint2 = Idempofy.semantic(payload2, { precision: 1 });

      expect(fingerprint1).toBe(fingerprint2);
    });
  });

  describe('custom strategy', () => {
    it('should apply field transformations', () => {
      const payload = { name: 'JOHN DOE', email: 'JOHN@EXAMPLE.COM' };
      const fields = ['name', 'email'];
      const transformations = {
        name: { $lower: 'name' },
        email: { $lower: 'email' },
      };

      const result = Idempofy.detailed(payload, {
        strategy: 'custom',
        fields,
        transformations,
      });

      expect(result.strategy).toBe('custom');
      expect(result.includedFields).toEqual(fields);
    });

    it('should handle conditional transformations', () => {
      const payload = { type: 'premium', discount: 0.1 };
      const fields = ['type', 'discount'];
      const transformations = {
        discount: { $if: { condition: 'type', then: 'discount', else: '0' } },
      };

      const result = Idempofy.detailed(payload, {
        strategy: 'custom',
        fields,
        transformations,
      });

      expect(result.strategy).toBe('custom');
    });
  });

  describe('compare method', () => {
    it('should return true for identical payloads', () => {
      const payload1 = { name: 'John', age: 30 };
      const payload2 = { name: 'John', age: 30 };

      expect(Idempofy.compare(payload1, payload2)).toBe(true);
    });

    it('should return false for different payloads', () => {
      const payload1 = { name: 'John', age: 30 };
      const payload2 = { name: 'Jane', age: 25 };

      expect(Idempofy.compare(payload1, payload2)).toBe(false);
    });

    it('should work with different strategies', () => {
      const payload1 = { name: 'John', age: 30, city: 'New York' };
      const payload2 = { name: 'John', age: 30, city: 'Boston' };

      // Should be different with strict strategy
      expect(Idempofy.compare(payload1, payload2, { strategy: 'strict' })).toBe(false);

      // Should be same with selective strategy (excluding city)
      expect(
        Idempofy.compare(payload1, payload2, {
          strategy: 'selective',
          fields: ['name', 'age'],
        })
      ).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty objects', () => {
      const payload = {};
      const fingerprint = Idempofy.strict(payload);

      expect(fingerprint).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should handle arrays', () => {
      const payload = { items: [1, 2, 3] };
      const fingerprint1 = Idempofy.strict(payload);
      const fingerprint2 = Idempofy.strict(payload);

      expect(fingerprint1).toBe(fingerprint2);
    });

    it('should handle circular references', () => {
      const payload: any = { name: 'John' };
      payload.self = payload; // Create circular reference

      // Should not throw error
      expect(() => Idempofy.strict(payload)).not.toThrow();
    });

    it('should handle null and undefined values consistently', () => {
      const payload1 = { name: 'John', age: null };
      const payload2 = { name: 'John' }; // undefined is omitted

      const fingerprint1 = Idempofy.strict(payload1);
      const fingerprint2 = Idempofy.strict(payload2);

      // These should be different because one has null explicitly, other doesn't have the field
      expect(fingerprint1).not.toBe(fingerprint2);
    });
  });

  describe('warnings and validation', () => {
    it('should provide warnings for potential issues', () => {
      const payload = { timestamp: new Date() };
      const result = Idempofy.detailed(payload, { strategy: 'semantic' });

      expect(result.warnings).toBeDefined();
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should assess collision risk', () => {
      const payload = { name: 'John' };
      const result = Idempofy.detailed(payload);
      const risk = Idempofy.getCollisionRisk(result.fingerprint);

      expect(['low', 'medium', 'high']).toContain(risk);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown strategy in this method', () => {
      expect(() => {
        Idempofy.this({ name: 'John' }, { strategy: 'unknown' as any });
      }).toThrow('Unknown strategy: unknown');
    });
  });

  describe('custom method edge cases', () => {
    it('should work without transformations', () => {
      const payload = { name: 'John', age: 30 };
      const result = Idempofy.custom(payload, ['name', 'age']);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getCollisionRisk', () => {
    it('should return high risk for short fingerprints', () => {
      expect(Idempofy.getCollisionRisk('short')).toBe('high');
      expect(Idempofy.getCollisionRisk('a'.repeat(31))).toBe('high');
    });

    it('should return medium risk for medium fingerprints', () => {
      expect(Idempofy.getCollisionRisk('a'.repeat(32))).toBe('medium');
      expect(Idempofy.getCollisionRisk('a'.repeat(47))).toBe('medium');
    });

    it('should return low risk for long fingerprints', () => {
      expect(Idempofy.getCollisionRisk('a'.repeat(48))).toBe('low');
      expect(Idempofy.getCollisionRisk('a'.repeat(64))).toBe('low');
    });
  });

  describe('this method with default config', () => {
    it('should work with default config', () => {
      const payload = { name: 'John', age: 30 };
      const result = Idempofy.this(payload);

      expect(result.strategy).toBe('strict');
      expect(typeof result.fingerprint).toBe('string');
    });
  });
});
