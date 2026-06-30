export const calculateEarnedPoints = (amount: number, percent: number): number => {
  if (amount < 0 || percent < 0) return 0;
  return Math.floor(amount * percent);
};

export const calculateRedeemValue = (
  points: number,
  raterPerPoint: number,
): number => {
  if (points < 0 || raterPerPoint < 0) return 0;
  return Math.floor(points * raterPerPoint);
};

export const canRedeem = (currentPoints: number, minPoints: number): boolean => {
  return currentPoints >= minPoints;
};
