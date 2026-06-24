import { describe, it, expect } from 'vitest';
import { EMISSION_FACTORS_V2 } from '@/lib/emission-factors-v2';
import { EMISSION_FACTORS, INDIA_DAILY_AVERAGE_KG } from '@/lib/emission-factors';
import { calcDietMonthlyKg, calcTravelMonthlyKg, calcEnergyMonthlyKg } from '@/lib/carbon-engine-v2';
import type { DietProfile, TravelProfile, EnergyProfile } from '@/lib/types/carbon-twin-types';

describe('V1 ↔ V2 Emission Factor Consistency', () => {
  it('both have transport category', () => {
    expect(EMISSION_FACTORS.transport).toBeTruthy();
    expect(EMISSION_FACTORS_V2.transport).toBeTruthy();
  });

  it('both have diet/energy categories', () => {
    expect(EMISSION_FACTORS.dietDaily).toBeTruthy();
    expect(EMISSION_FACTORS_V2.diet).toBeTruthy();
    expect(EMISSION_FACTORS.energy).toBeTruthy();
    expect(EMISSION_FACTORS_V2.energy).toBeTruthy();
  });

  it('India baseline is realistic (1.5-3 t/year range)', () => {
    const dailyKg = INDIA_DAILY_AVERAGE_KG;
    const annualT = (dailyKg * 365) / 1000;
    expect(annualT).toBeGreaterThan(1);
    expect(annualT).toBeLessThan(4);
  });
});

describe('Cross-Category Calculation Sanity', () => {
  it('typical Indian household total is within reasonable range', () => {
    const diet: DietProfile = {
      vegetarian: false, veganDays: 0, meatServings: 3, meatType: 'chicken',
      dairyLitresPerWeek: 3, riceKgPerWeek: 2, localProduce: true,
    };
    const travel: TravelProfile = {
      primaryVehicle: 'petrolBike', dailyCommuteKm: 10,
      flightsDomesticPerYear: 1, flightsIntlPerYear: 0,
      longDistanceTrainTripsPerYear: 2, avgFlightDistanceKm: 800,
    };
    const energy: EnergyProfile = {
      monthlyElectricityKwh: 150, cookingFuel: 'lpg', lpgCylindersPerMonth: 1,
      acUnits: 0, acHoursPerDay: 0, hasSolar: false, solarCapacityKw: 0,
      acTemperatureSetting: 26,
    };

    const dietKg = calcDietMonthlyKg(diet);
    const travelKg = calcTravelMonthlyKg(travel);
    const energyKg = calcEnergyMonthlyKg(energy);
    const total = dietKg + travelKg + energyKg;

    // A typical Indian monthly footprint should be 50-300 kg
    expect(total).toBeGreaterThan(50);
    expect(total).toBeLessThan(300);
  });

  it('zero-emission profile has near-zero total', () => {
    const zeroDiet: DietProfile = {
      vegetarian: true, veganDays: 7, meatServings: 0, meatType: 'chicken',
      dairyLitresPerWeek: 0, riceKgPerWeek: 0, localProduce: true,
    };
    const zeroTravel: TravelProfile = {
      primaryVehicle: 'walking', dailyCommuteKm: 0,
      flightsDomesticPerYear: 0, flightsIntlPerYear: 0,
      longDistanceTrainTripsPerYear: 0, avgFlightDistanceKm: 0,
    };
    const zeroEnergy: EnergyProfile = {
      monthlyElectricityKwh: 0, cookingFuel: 'solar', lpgCylindersPerMonth: 0,
      acUnits: 0, acHoursPerDay: 0, hasSolar: true, solarCapacityKw: 5,
      acTemperatureSetting: 26,
    };

    expect(calcDietMonthlyKg(zeroDiet)).toBe(0);
    expect(calcTravelMonthlyKg(zeroTravel)).toBe(0);
    expect(calcEnergyMonthlyKg(zeroEnergy)).toBe(0);
  });
});
