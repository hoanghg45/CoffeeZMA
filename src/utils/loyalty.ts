
/**
 * Calculates the number of points earned for a given amount.
 * @param amount The total transaction amount.
 * @param percent The percentage of the amount to convert to points (0-1). e.g. 0.05 for 5%
 * @returns The number of points (integer).
 */
export const calculateEarnedPoints = (amount: number, percent: number): number => {
    if (amount < 0 || percent < 0) return 0;
    return Math.floor(amount * percent);
};

/**
 * Calculates the monetary value of a given number of points.
 * @param points The number of points to redeem.
 * @param rate The value of 1 point in currency units. e.g. 1 point = 1 VND (or 1000 VND?) - usually 1 point = 1 unit or similar.
 *             Wait, usually it's like 1000 VND = 1 point, and 1 point = X VND redeem.
 *             Let's assume `rate` is "Value per point".
 * @returns The redeemable value.
 */
export const calculateRedeemValue = (points: number, raterPerPoint: number): number => {
    if (points < 0 || raterPerPoint < 0) return 0;
    return Math.floor(points * raterPerPoint);
};

/**
 * Checks if the user has enough points to redeem.
 * @param currentPoints User's current point balance.
 * @param minPoints Minimum points required to redeem.
 * @returns True if redeem is allowed.
 */
export const canRedeem = (currentPoints: number, minPoints: number): boolean => {
    return currentPoints >= minPoints;
};
