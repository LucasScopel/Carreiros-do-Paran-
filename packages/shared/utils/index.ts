export * from "./users";

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function minutesToText(t: number) {
  const h = Math.floor(t / 60);
  const m = t % 60;

  if (h === 0) {
    return `${m} min`;
  }

  if (m === 0) {
    return `${h} h`;
  }

  return `${h} h ${m} min`;
}
