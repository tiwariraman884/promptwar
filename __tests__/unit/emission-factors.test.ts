import { describe, it, expect } from 'vitest';
import {
  EMISSION_FACTORS,
  INDIA_DAILY_AVERAGE_KG,
  INDIA_ANNUAL_AVERAGE_KG,
  INDIA_ANNUAL_TARGET_KG,
  INDIA_PARIS_TARGET_KG_DAY,
  WORLD_DAILY_AVERAGE_KG,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '@/lib/emission-factors';

describe('EMISSION_FACTORS (V1)', () => {
  it('has all expected top-level categories', () => {
    expect(EMISSION_FACTORS).toHaveProperty('transport');
    expect(EMISSION_FACTORS).toHaveProperty('energy');
    expect(EMISSION_FACTORS).toHaveProperty('dietDaily');
    expect(EMISSION_FACTORS).toHaveProperty('shopping');
    expect(EMISSION_FACTORS).toHaveProperty('wastePerKg');
    expect(EMISSION_FACTORS).toHaveProperty('digitalPerHour');
  });

  it('transport factors are all >= 0', () => {
    for (const [mode, val] of Object.entries(EMISSION_FACTORS.transport)) {
      expect(val, `transport.${mode}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('has sources metadata', () => {
    expect(EMISSION_FACTORS.sources).toBeTruthy();
  });
});

describe('India constants', () => {
  it('daily average is positive', () => {
    expect(INDIA_DAILY_AVERAGE_KG).toBeGreaterThan(0);
  });

  it('annual ≈ daily × 365', () => {
    expect(INDIA_ANNUAL_AVERAGE_KG).toBeCloseTo(INDIA_DAILY_AVERAGE_KG * 365, -1);
  });

  it('target < current', () => {
    expect(INDIA_ANNUAL_TARGET_KG).toBeLessThan(INDIA_ANNUAL_AVERAGE_KG);
  });

  it('Paris target < daily average', () => {
    expect(INDIA_PARIS_TARGET_KG_DAY).toBeLessThan(INDIA_DAILY_AVERAGE_KG);
  });

  it('world average > India average (India is lower emitter)', () => {
    expect(WORLD_DAILY_AVERAGE_KG).toBeGreaterThan(INDIA_DAILY_AVERAGE_KG);
  });
});

describe('CATEGORY_LABELS', () => {
  it('has labels for all categories in CATEGORY_ORDER', () => {
    for (const cat of CATEGORY_ORDER) {
      expect(CATEGORY_LABELS[cat], `Label for ${cat}`).toBeTruthy();
    }
  });
});

describe('CATEGORY_ORDER', () => {
  it('has at least 5 categories', () => {
    expect(CATEGORY_ORDER.length).toBeGreaterThanOrEqual(5);
  });

  it('includes core categories', () => {
    expect(CATEGORY_ORDER).toContain('transport');
    expect(CATEGORY_ORDER).toContain('energy');
    expect(CATEGORY_ORDER).toContain('diet');
  });
});
