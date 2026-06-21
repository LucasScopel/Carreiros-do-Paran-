export function createTrailImageFileName(
  publicTrailId: string,
  imageId: number,
  format: string,
) {
  return `${publicTrailId}-${imageId}.${format}`;
}
