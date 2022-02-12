import { percentBetween } from "./percentBetween.js"

/**
 * Convert a value given its own bounds, into the value it would be if it had the new bounds
 * @param {*} value value to convert
 * @param {*} valuesBounds bounds of the supplied value
 * @param {*} newBounds bounds to fit the value between
 */
 export function mapValue(value, valuesBounds, newBounds) {
    const valuePercentage = percentBetween(
        value,
        valuesBounds[0],
        valuesBounds[1]
    );
    const newValue =
        (newBounds[1] - newBounds[0]) * valuePercentage + newBounds[0];
    return newValue;
}