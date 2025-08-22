import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Basic utility functions', () => {
  describe('cn function (class name merger)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).toContain('active');
    });

    it('should ignore falsy values', () => {
      const isActive = false;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('base');
      expect(result).not.toContain('active');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toContain('base');
      expect(result).toContain('end');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(typeof result).toBe('string');
    });
  });
});
