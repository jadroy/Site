/** Compute sunrise/sunset in local decimal hours for a given lat/lng and today's date. */
export function getSunTimes(lat: number, lng: number): { sunrise: number; sunset: number } {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1;

  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const declination = -23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));
  const decRad = toRad(declination);
  const latRad = toRad(lat);

  const cosHA =
    (Math.sin(toRad(-0.83)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad));

  // Polar edge cases
  if (cosHA > 1) return { sunrise: 7, sunset: 17 };
  if (cosHA < -1) return { sunrise: 3, sunset: 23 };

  const ha = toDeg(Math.acos(cosHA));

  // Equation of time correction
  const B = toRad((360 / 365) * (dayOfYear - 81));
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  const solarNoon = 12 - lng / 15 - EoT / 60; // UTC hours
  const tzOffset = now.getTimezoneOffset() / -60;

  return {
    sunrise: solarNoon - ha / 15 + tzOffset,
    sunset: solarNoon + ha / 15 + tzOffset,
  };
}

/** Returns true if current local time is past sunset or before sunrise. */
export function isPastSundown(lat: number, lng: number): boolean {
  const { sunrise, sunset } = getSunTimes(lat, lng);
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  return currentHour >= sunset || currentHour < sunrise;
}
