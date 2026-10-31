/**
 * Unit conversion helpers.
 *
 * The database always stores metric values (kg, cm, meters). The UI lets users
 * work in imperial or metric; convert at the API boundary so storage stays
 * consistent and comparisons/deltas are always apples-to-apples.
 */

export const LB_PER_KG = 2.2046226218
export const CM_PER_IN = 2.54
export const M_PER_MILE = 1609.344
export const M_PER_KM = 1000

// ---- Weight ----
export function lbsToKg(lbs: number): number {
  return lbs / LB_PER_KG
}
export function kgToLbs(kg: number): number {
  return kg * LB_PER_KG
}

// ---- Length (measurements) ----
export function inToCm(inches: number): number {
  return inches * CM_PER_IN
}
export function cmToIn(cm: number): number {
  return cm / CM_PER_IN
}

// ---- Distance (cardio) ----
export function milesToMeters(miles: number): number {
  return miles * M_PER_MILE
}
export function kmToMeters(km: number): number {
  return km * M_PER_KM
}
export function metersToMiles(m: number): number {
  return m / M_PER_MILE
}
export function metersToKm(m: number): number {
  return m / M_PER_KM
}

/** Round a number to `decimals` places, returning a Number (not string). */
export function round(value: number, decimals = 1): number {
  const f = 10 ** decimals
  return Math.round(value * f) / f
}

/** Convert a stored metric weight (kg) to the user's preferred display unit. */
export function displayWeight(kg: number, unit: 'kg' | 'lbs'): number {
  return round(unit === 'kg' ? kg : kgToLbs(kg), 1)
}

/** Convert a stored metric length (cm) to the user's preferred display unit. */
export function displayLength(cm: number, unit: 'cm' | 'in'): number {
  return round(unit === 'cm' ? cm : cmToIn(cm), 1)
}
