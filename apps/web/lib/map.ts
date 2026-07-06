import { LngLat, LngLatBounds } from "maplibre-gl";

const EARTH_RADIUS = 6378137; // metros

export function boundsAddMargin(
  bounds: readonly [number, number, number, number],
  p: number,
): [number, number, number, number] {
  const w = Math.abs(bounds[2] - bounds[0]) * p;
  const h = Math.abs(bounds[3] - bounds[1]) * p;
  return [bounds[0] - w, bounds[1] - h, bounds[2] + w, bounds[3] + h];
}

export function calculateEarthArea(bounds: LngLatBounds) {
  let totalArea = 0;

  const points = [
    bounds.getSouthWest().toArray(),
    bounds.getNorthWest().toArray(),
    bounds.getNorthEast().toArray(),
    bounds.getSouthEast().toArray(),
    bounds.getSouthWest().toArray(),
  ];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const lon1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lon2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;

    totalArea += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  totalArea = (totalArea * EARTH_RADIUS * EARTH_RADIUS) / 2;

  return Math.abs(totalArea);
}

function calculateHaversineDistance(p1: LngLat, p2: LngLat): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

export function hadSignificantMove(
  lastBounds: LngLatBounds,
  currentBounds: LngLatBounds,
): boolean {
  const lastArea = calculateEarthArea(lastBounds);
  const currentArea = calculateEarthArea(currentBounds);

  if (lastArea === 0 || currentArea === 0) {
    return false;
  }

  const areaRatio = currentArea / lastArea;

  const AREA_UPPER_THRESHOLD = 1.5; // +50% de área
  const AREA_LOWER_THRESHOLD = 0.25; // -75% de área

  // Se a área atual for muito maior ou muito menor que a anterior, retorne true
  if (areaRatio > AREA_UPPER_THRESHOLD || areaRatio < AREA_LOWER_THRESHOLD) {
    return true;
  }

  const lastCenter = lastBounds.getCenter();
  const currentCenter = currentBounds.getCenter();

  const centerDistance = calculateHaversineDistance(lastCenter, currentCenter);

  const currentMapDiagonal = calculateHaversineDistance(
    currentBounds.getSouthWest(),
    currentBounds.getNorthEast(),
  );

  // Se o centro se moveu mais do que 40% da diagonal da tela atual, retorne true
  const CENTER_DISTANCE_THRESHOLD_RATIO = 0.4;
  const maxAllowedMovement =
    currentMapDiagonal * CENTER_DISTANCE_THRESHOLD_RATIO;

  if (centerDistance > maxAllowedMovement) {
    return true;
  }

  return false;
}
