import { normalizeValue, createDeterministicString, safeStringify } from '../normalizers';
import { NormalizationOptions } from '../types';

describe('Normalizers', () => {
  describe('normalizeValue', () => {
    it('should handle null and undefined values', () => {
      const options: NormalizationOptions = { excludeNulls: true };

      expect(normalizeValue(null, options)).toBeUndefined();
      expect(normalizeValue(undefined, options)).toBeUndefined();
    });

    it('should trim strings when specified', () => {
      const options: NormalizationOptions = { trimStrings: true };

      expect(normalizeValue('  hello  ', options)).toBe('hello');
    });

    it('should handle case sensitivity', () => {
      const options: NormalizationOptions = { caseSensitive: false };

      expect(normalizeValue('Hello', options)).toBe('hello');
    });

    it('should round numbers to specified precision', () => {
      const options: NormalizationOptions = { precision: 2 };

      expect(normalizeValue(3.14159, options)).toBe(3.14);
    });

    it('should normalize dates to ISO strings', () => {
      const options: NormalizationOptions = { normalizeDates: true };
      const date = new Date('2023-01-01T00:00:00Z');

      expect(normalizeValue(date, options)).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should sort object keys when specified', () => {
      const options: NormalizationOptions = { sortKeys: true };
      const obj = { c: 3, a: 1, b: 2 };

      const normalized = normalizeValue(obj, options);
      expect(Object.keys(normalized)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('createDeterministicString', () => {
    it('should create consistent strings for identical objects', () => {
      const obj = { name: 'John', age: 30 };
      const options: NormalizationOptions = { sortKeys: true };

      const str1 = createDeterministicString(obj, options);
      const str2 = createDeterministicString(obj, options);

      expect(str1).toBe(str2);
    });

    it('should handle different key orders consistently', () => {
      const obj1 = { name: 'John', age: 30 };
      const obj2 = { age: 30, name: 'John' };
      const options: NormalizationOptions = { sortKeys: true };

      const str1 = createDeterministicString(obj1, options);
      const str2 = createDeterministicString(obj2, options);

      expect(str1).toBe(str2);
    });
  });

  describe('safeStringify', () => {
    it('should handle circular references', () => {
      const obj: any = { name: 'John' };
      obj.self = obj; // Create circular reference

      expect(() => safeStringify(obj)).not.toThrow();
    });

    it('should replace circular references with [Circular]', () => {
      const obj: any = { name: 'John' };
      obj.self = obj;

      const result = safeStringify(obj);
      expect(result).toContain('[Circular]');
    });

    it('should handle normal objects', () => {
      const obj = { name: 'John', age: 30 };
      const result = safeStringify(obj);
      expect(result).toContain('"age":30');
      expect(result).toContain('"name"');
    });

    it('should handle arrays without circular references', () => {
      const arr = [1, 2, 3];
      const result = safeStringify(arr);
      expect(result).toBe('[1,2,3]');
    });
  });

  describe('createDeterministicString JCS options', () => {
    it('should use JCS by default', () => {
      const obj = { b: 2, a: 1 };
      const result = createDeterministicString(obj);
      expect(result).toBe('{"a":1,"b":2}');
    });

    it('should use JCS when useJCS is true', () => {
      const obj = { b: 2, a: 1 };
      const result = createDeterministicString(obj, { useJCS: true });
      expect(result).toBe('{"a":1,"b":2}');
    });

    it('should fallback to JSON.stringify when useJCS is false', () => {
      const obj = { b: 2, a: 1 };
      const result = createDeterministicString(obj, { useJCS: false });
      expect(result).toBe('{"b":2,"a":1}'); // Regular JSON.stringify order
    });
  });
});
