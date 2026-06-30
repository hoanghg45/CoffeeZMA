"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const loyalty_1 = require("../utils/loyalty");
(0, vitest_1.describe)("Loyalty Utils", () => {
    (0, vitest_1.describe)("calculateEarnedPoints", () => {
        (0, vitest_1.it)("calculates points correctly for standard rate", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateEarnedPoints)(100000, 0.05)).toBe(5000);
        });
        (0, vitest_1.it)("rounds down to nearest integer", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateEarnedPoints)(10050, 0.05)).toBe(502);
        });
        (0, vitest_1.it)("returns 0 for zero amount", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateEarnedPoints)(0, 0.05)).toBe(0);
        });
        (0, vitest_1.it)("returns 0 for negative amount", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateEarnedPoints)(-100, 0.05)).toBe(0);
        });
        (0, vitest_1.it)("handles 0% earn rate", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateEarnedPoints)(100000, 0)).toBe(0);
        });
    });
    (0, vitest_1.describe)("calculateRedeemValue", () => {
        (0, vitest_1.it)("converts points to value correctly", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateRedeemValue)(100, 1000)).toBe(100000);
        });
        (0, vitest_1.it)("returns 0 for 0 points", () => {
            (0, vitest_1.expect)((0, loyalty_1.calculateRedeemValue)(0, 1000)).toBe(0);
        });
    });
    (0, vitest_1.describe)("canRedeem", () => {
        (0, vitest_1.it)("returns true if points >= min", () => {
            (0, vitest_1.expect)((0, loyalty_1.canRedeem)(1000, 1000)).toBe(true);
            (0, vitest_1.expect)((0, loyalty_1.canRedeem)(1001, 1000)).toBe(true);
        });
        (0, vitest_1.it)("returns false if points < min", () => {
            (0, vitest_1.expect)((0, loyalty_1.canRedeem)(999, 1000)).toBe(false);
        });
    });
});
