import { canonicalize, toJCSString, isJCSCompliant } from '../jcs';

describe('JCS (JSON Canonicalization Scheme)', () => {
  describe('canonicalize', () => {
    it('should handle primitive values', () => {
      expect(canonicalize(null)).toBe('null');
      expect(canonicalize(true)).toBe('true');
      expect(canonicalize(false)).toBe('false');
      expect(canonicalize(42)).toBe('42');
      expect(canonicalize(3.14)).toBe('3.14');
      expect(canonicalize('hello')).toBe('"hello"');
    });

    it('should handle arrays', () => {
      expect(canonicalize([])).toBe('[]');
      expect(canonicalize([1, 2, 3])).toBe('[1,2,3]');
      expect(canonicalize(['a', 'b', 'c'])).toBe('["a","b","c"]');
      expect(canonicalize([1, 'hello', true])).toBe('[1,"hello",true]');
    });

    it('should handle objects with sorted keys', () => {
      const obj = { c: 3, a: 1, b: 2 };
      const result = canonicalize(obj);
      expect(result).toBe('{"a":1,"b":2,"c":3}');
    });

    it('should handle nested objects', () => {
      const obj = {
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
      };
      const result = canonicalize(obj);
      expect(result).toBe('{"items":[1,2,3],"user":{"age":30,"name":"John"}}');
    });

    it('should handle empty objects', () => {
      expect(canonicalize({})).toBe('{}');
    });

    it('should handle special numbers', () => {
      expect(canonicalize(NaN)).toBe('null');
      expect(canonicalize(Infinity)).toBe('null');
      expect(canonicalize(-Infinity)).toBe('null');
    });
  });

  describe('toJCSString', () => {
    it('should produce consistent results for identical objects', () => {
      const obj1 = { b: 2, a: 1 };
      const obj2 = { a: 1, b: 2 };

      const result1 = toJCSString(obj1);
      const result2 = toJCSString(obj2);

      expect(result1).toBe(result2);
      expect(result1).toBe('{"a":1,"b":2}');
    });

    it('should handle complex nested structures', () => {
      const obj = {
        users: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
        metadata: {
          version: '1.0',
          timestamp: '2023-01-01T00:00:00Z',
        },
      };

      const result = toJCSString(obj);
      expect(result).toContain('"users"');
      expect(result).toContain('"metadata"');
      expect(result).toContain('"version"');
    });
  });

  describe('isJCSCompliant', () => {
    it('should identify JCS-compliant strings', () => {
      expect(isJCSCompliant('{"a":1,"b":2}')).toBe(true);
      expect(isJCSCompliant('[1,2,3]')).toBe(true);
      expect(isJCSCompliant('"hello"')).toBe(true);
      expect(isJCSCompliant('42')).toBe(true);
    });

    it('should identify non-JCS-compliant strings', () => {
      expect(isJCSCompliant('{ "a": 1, "b": 2 }')).toBe(false); // Has spaces
      expect(isJCSCompliant('{"b":2,"a":1}')).toBe(false); // Wrong key order
      expect(isJCSCompliant('invalid json')).toBe(false);
    });
  });

  describe('JCS compliance', () => {
    it('should produce identical results for semantically equivalent objects', () => {
      const obj1 = { name: 'John', age: 30, city: 'NYC' };
      const obj2 = { age: 30, city: 'NYC', name: 'John' };

      const jcs1 = toJCSString(obj1);
      const jcs2 = toJCSString(obj2);

      expect(jcs1).toBe(jcs2);
    });

    it('should handle arrays consistently', () => {
      const arr1 = [3, 1, 2];
      const arr2 = [3, 1, 2];

      const jcs1 = toJCSString(arr1);
      const jcs2 = toJCSString(arr2);

      expect(jcs1).toBe(jcs2);
      expect(jcs1).toBe('[3,1,2]');
    });

    it('should handle mixed types consistently', () => {
      const obj = {
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 'two', false],
        object: { nested: 'value' },
      };

      const jcs = toJCSString(obj);
      expect(jcs).toContain('"string":"hello"');
      expect(jcs).toContain('"number":42');
      expect(jcs).toContain('"boolean":true');
      expect(jcs).toContain('"null":null');
      expect(jcs).toContain('"array":[1,"two",false]');
      expect(jcs).toContain('"object":{"nested":"value"}');
    });

    it('should handle functions and symbols', () => {
      const result1 = canonicalize(() => {});
      const result2 = canonicalize(Symbol('test'));
      expect(result1).toBe('null');
      expect(result2).toBe('null');
    });
  });
});
