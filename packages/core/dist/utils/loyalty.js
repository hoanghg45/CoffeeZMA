"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canRedeem = exports.calculateRedeemValue = exports.calculateEarnedPoints = void 0;
const calculateEarnedPoints = (amount, percent) => {
    if (amount < 0 || percent < 0)
        return 0;
    return Math.floor(amount * percent);
};
exports.calculateEarnedPoints = calculateEarnedPoints;
const calculateRedeemValue = (points, raterPerPoint) => {
    if (points < 0 || raterPerPoint < 0)
        return 0;
    return Math.floor(points * raterPerPoint);
};
exports.calculateRedeemValue = calculateRedeemValue;
const canRedeem = (currentPoints, minPoints) => {
    return currentPoints >= minPoints;
};
exports.canRedeem = canRedeem;
