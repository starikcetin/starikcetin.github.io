/**
 * @template T
 * @param {T | null | undefined} obj
 * @returns {obj is null | undefined}
 */
const isNullish = (obj) => obj === undefined || obj === null;

/**
 * @template T
 * @param {T | null | undefined} obj
 * @returns {obj is T}
 */
const hasValue = (obj) => !isNullish(obj);

module.exports = {
    isNullish,
    hasValue,
};
