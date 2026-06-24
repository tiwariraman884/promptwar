import { describe, it, expect } from 'vitest';
import {
  EMISSION_FACTORS_V2,
  INDIA_MONTHLY_BASELINE,
  INDIA_NDC_TARGET,
  TREE_ABSORPTION_ANNUAL,
  SCORE_MAX_MONTHLY_CO2,
} from '@/lib/emission-factors-v2';

describe('EMISSION_FACTORS_V2', () => {
  describe('transport', () => {
    it('has all expected transport modes', () => {
      const keys = Object.keys(EMISSION_FACTORS_V2.transport);
      expect(keys).toContain('petrolCar');
      expect(keys).toContain('dieselCar');
      expect(keys).toContain('electricCar');
      expect(keys).toContain('metro');
      expect(keys).toContain('train');
      expect(keys).toContain('walking');
      expect(keys).toContain('cycling');
      expect(keys).toContain('flight_domestic');
      expect(keys).toContain('flight_intl');
    });

    it('all transport factors are >= 0', () => {
      for (const [mode, val] of Object.entries(EMISSION_FACTORS_V2.transport)) {
        expect(val, `${mode} should be >= 0`).toBeGreaterThanOrEqual(0);
      }
    });

    it('walking and cycling are zero', () => {
      expect(EMISSION_FACTORS_V2.transport.walking).toBe(0);
      expect(EMISSION_FACTORS_V2.transport.cycling).toBe(0);
    });

    it('electric < petrol for cars', () => {
      expect(EMISSION_FACTORS_V2.transport.electricCar).toBeLessThan(
        EMISSION_FACTORS_V2.transport.petrolCar
      );
    });

    it('metro < bus < car', () => {
      expect(EMISSION_FACTORS_V2.transport.metro).toBeLessThan(EMISSION_FACTORS_V2.transport.bus);
      expect(EMISSION_FACTORS_V2.transport.bus).toBeLessThan(EMISSION_FACTORS_V2.transport.petrolCar);
    });
  });

  describe('diet', () => {
    it('has all expected food types', () => {
      const keys = Object.keys(EMISSION_FACTORS_V2.diet);
      expect(keys).toContain('beef');
      expect(keys).toContain('chicken');
      expect(keys).toContain('rice_kg');
      expect(keys).toContain('vegetables_kg');
    });

    it('all diet factors are > 0', () => {
      for (const [item, val] of Object.entries(EMISSION_FACTORS_V2.diet)) {
        expect(val, `${item} should be > 0`).toBeGreaterThan(0);
      }
    });

    it('beef > chicken > vegetables', () => {
      expect(EMISSION_FACTORS_V2.diet.beef).toBeGreaterThan(EMISSION_FACTORS_V2.diet.chicken);
      expect(EMISSION_FACTORS_V2.diet.chicken).toBeGreaterThan(EMISSION_FACTORS_V2.diet.vegetables_kg);
    });
  });

  describe('energy', () => {
    it('solar < grid electricity', () => {
      expect(EMISSION_FACTORS_V2.energy.solar_kwh).toBeLessThan(
        EMISSION_FACTORS_V2.energy.electricity_kwh
      );
    });

    it('all energy factors are > 0', () => {
      for (const [src, val] of Object.entries(EMISSION_FACTORS_V2.energy)) {
        expect(val, `${src} should be > 0`).toBeGreaterThan(0);
      }
    });
  });

  describe('waste', () => {
    it('composted < recycled < landfill', () => {
      expect(EMISSION_FACTORS_V2.waste.composted_kg).toBeLessThan(EMISSION_FACTORS_V2.waste.recycled_kg);
      expect(EMISSION_FACTORS_V2.waste.recycled_kg).toBeLessThan(EMISSION_FACTORS_V2.waste.landfill_kg);
    });
  });
});

describe('constants', () => {
  it('INDIA_MONTHLY_BASELINE is reasonable (~158 kg/month)', () => {
    expect(INDIA_MONTHLY_BASELINE).toBeGreaterThan(100);
    expect(INDIA_MONTHLY_BASELINE).toBeLessThan(300);
  });

  it('NDC target is less than baseline', () => {
    expect(INDIA_NDC_TARGET).toBeLessThan(INDIA_MONTHLY_BASELINE);
  });

  it('tree absorption is positive', () => {
    expect(TREE_ABSORPTION_ANNUAL).toBeGreaterThan(0);
  });

  it('score max monthly CO2 is > baseline', () => {
    expect(SCORE_MAX_MONTHLY_CO2).toBeGreaterThan(INDIA_MONTHLY_BASELINE);
  });
});
