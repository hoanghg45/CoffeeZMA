import { describe, it, expect } from 'vitest';
import { calculateEarnedPoints, calculateRedeemValue, canRedeem } from '../loyalty';

describe('Loyalty Utils', () => {
    describe('calculateEarnedPoints', () => {
        it('calculates points correctly for standard rate', () => {
            expect(calculateEarnedPoints(100000, 0.05)).toBe(5000);
        });

        it('rounds down to nearest integer', () => {
            expect(calculateEarnedPoints(10050, 0.05)).toBe(502); // 502.5 -> 502
        });

        it('returns 0 for zero amount', () => {
            expect(calculateEarnedPoints(0, 0.05)).toBe(0);
        });

        it('returns 0 for negative amount', () => {
            expect(calculateEarnedPoints(-100, 0.05)).toBe(0);
        });

        it('handles 0% earn rate', () => {
            expect(calculateEarnedPoints(100000, 0)).toBe(0);
        });
    });

    describe('calculateRedeemValue', () => {
        it('converts points to value correctly', () => {
            expect(calculateRedeemValue(100, 1000)).toBe(100000);
        });

        it('returns 0 for 0 points', () => {
            expect(calculateRedeemValue(0, 1000)).toBe(0);
        });
    });

    describe('canRedeem', () => {
        it('returns true if points >= min', () => {
            expect(canRedeem(1000, 1000)).toBe(true);
            expect(canRedeem(1001, 1000)).toBe(true);
        });

        it('returns false if points < min', () => {
            expect(canRedeem(999, 1000)).toBe(false);
        });
    });
});
