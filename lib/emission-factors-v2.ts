// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INDIA EMISSION CONSTANTS — Single source of truth (Section A)
// Import from here everywhere. Never hardcode emission numbers.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const EMISSION_FACTORS_V2 = {
  transport: {
    petrolCar:        0.174,   // kg CO₂/km
    dieselCar:        0.168,
    cngCar:           0.105,
    electricCar:      0.070,   // India grid mix
    petrolBike:       0.041,
    electricScooter:  0.018,
    cngAuto:          0.093,
    electricAuto:     0.045,
    bus:              0.089,
    metro:            0.025,
    train:            0.017,
    flight_domestic:  0.255,   // per km per passenger
    flight_intl:      0.195,
    walking:          0.000,
    cycling:          0.000,
  },
  diet: {
    beef:          27.0,   // kg CO₂e per kg of food
    mutton:        26.0,
    pork:           7.6,
    chicken:        6.9,
    fish:           5.4,
    eggs_dozen:     4.5,
    milk_litre:     3.2,
    paneer_kg:      8.5,
    rice_kg:        2.7,
    wheat_kg:       1.4,
    pulses_kg:      0.9,
    vegetables_kg:  0.4,
    fruits_kg:      0.5,
    processed_kg:   4.2,
  },
  energy: {
    electricity_kwh:  0.716,   // CEA India grid 2023-24
    lpg_per_kg:       2.983,
    cng_cooking_m3:   2.000,
    piped_gas_m3:     2.204,
    diesel_litre:     2.684,
    coal_kg:          2.422,
    solar_kwh:        0.048,   // lifecycle emissions
  },
  shopping: {
    clothing_item:     10.0,   // kg CO₂e per item
    phone:             70.0,
    laptop:           300.0,
    tv:               400.0,
    furniture_piece:   90.0,
    online_delivery:    0.5,   // per order (India avg packaging + logistics)
    plastic_bag:        0.05,
  },
  waste: {
    landfill_kg:       0.50,   // kg CO₂e per kg of waste
    composted_kg:      0.01,
    recycled_kg:       0.03,
    incinerated_kg:    0.90,
    ewaste_kg:         8.00,
  },
} as const;

/** India average monthly CO₂ — 1.9t/year ÷ 12 */
export const INDIA_MONTHLY_BASELINE  = 158;  // kg CO₂/month
/** India NDC net-zero pathway target per month */
export const INDIA_NDC_TARGET        = 125;  // kg CO₂/month
/** CO₂ absorbed per tree per year (FAO) */
export const TREE_ABSORPTION_ANNUAL  = 21;   // kg CO₂/year per tree
/** Score 0 (worst) monthly threshold */
export const SCORE_MAX_MONTHLY_CO2   = 400;  // kg/month

export type TransportModeV2 = keyof typeof EMISSION_FACTORS_V2.transport;
