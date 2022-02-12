/**
 * Find the value between 0 and 1, that represents it as a percentage of closeness to the upper from lower
 * where 0 means value <= lower, and 1 means value = upper, hence value > 1 means value > upper.
 * @param {*} value , value to convert to percentage
 * @param {*} lower , the lowest bound of percentage
 * @param {*} upper , the upper bound for 100%
 * @returns float between 0 and 1
 */
 export function percentBetween(value, lower, upper) {
    let shifted = value - lower;
    if (shifted <= 0) {
        return 0;
    }

    return shifted / upper;
}