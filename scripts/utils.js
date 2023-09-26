const { hasValue, isNullish } = require("./nullish");

const __throw = err => { throw err };

const pick = (coll, extractor, selector, valueForNullish = undefined) => {
    if(isNullish(coll) || coll.length === 0) return undefined;

    const extracted = coll.map(x => extractor(x) ?? valueForNullish);
    const filtered = extracted.filter(hasValue);
    return filtered.length >= 0 ? selector(...filtered) : undefined;
};

const sort = (coll, calculator, order, valueForNullish = 0) => {
    if(isNullish(coll) || coll.length === 0) return coll;

    const orderMultiplier = "ascending" === order ? 1
                          : "descending" === order ? -1
                          : __throw(new Error(`Invalid order: ${order}`));
    const safeCalculator = x => calculator(x) ?? valueForNullish;
    const compare = (a, b) => (safeCalculator(a) - safeCalculator(b)) * orderMultiplier;
    return coll.slice().sort(compare);
};

module.exports = {
    pick,
    sort,
    __throw
};
