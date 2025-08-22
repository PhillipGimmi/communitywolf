import { describe, it, expect } from 'vitest';

// Simple array filtering functions for testing
function filterByCountry<T extends { country_id?: string }>(items: T[], countryId: string): T[] {
  if (!countryId) return items;
  return items.filter(item => item.country_id === countryId);
}

function isValidCountry(item: { country_id?: string }, countryId: string): boolean {
  if (!countryId) return false;
  return item.country_id === countryId;
}

describe('Simple country filtering', () => {
  const testData = [
    { id: 1, name: 'Item 1', country_id: 'US' },
    { id: 2, name: 'Item 2', country_id: 'CA' },
    { id: 3, name: 'Item 3', country_id: 'US' },
  ];

  describe('filterByCountry', () => {
    it('should filter items by country', () => {
      const result = filterByCountry(testData, 'US');
      expect(result).toHaveLength(2);
      expect(result[0].country_id).toBe('US');
      expect(result[1].country_id).toBe('US');
    });

    it('should return all items when no country specified', () => {
      const result = filterByCountry(testData, '');
      expect(result).toEqual(testData);
    });

    it('should return empty array for unknown country', () => {
      const result = filterByCountry(testData, 'FR');
      expect(result).toEqual([]);
    });
  });

  describe('isValidCountry', () => {
    it('should validate matching country', () => {
      const item = { id: 1, country_id: 'US' };
      expect(isValidCountry(item, 'US')).toBe(true);
    });

    it('should reject non-matching country', () => {
      const item = { id: 1, country_id: 'US' };
      expect(isValidCountry(item, 'CA')).toBe(false);
    });

    it('should reject when no country provided', () => {
      const item = { id: 1, country_id: 'US' };
      expect(isValidCountry(item, '')).toBe(false);
    });
  });
});
