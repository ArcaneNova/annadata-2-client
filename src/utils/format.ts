export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m away`;
  }
  const kilometers = meters / 1000;
  return `${kilometers.toFixed(1)}km away`;
}; 