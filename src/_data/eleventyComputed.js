const { isNullish } = require("../../scripts/nullish");
const UniqueSlugifier = require("../../scripts/UniqueSlugifier");

const slugifiers = {};

const getUniqueSlugify = (url, slugifyOptions) => {
    if (isNullish(slugifiers[url])) {
        slugifiers[url] = new UniqueSlugifier(url, slugifyOptions);
    }

    return slugifiers[url];
};

module.exports = {
    uniqueSlugify: (data) => (...args) => getUniqueSlugify(data.page.url, data.slugifyOptions).slugify(...args),
};
