const slugifyPkg = require("slugify");

const opts = {
    lower: true,
    strict: true,
    locale: "en",
    remove: /["]/g,
};

module.exports = (str, arrayDelim = "-") => { 
    const finalStr = str instanceof Array ? str.join(arrayDelim) : str;
    return slugifyPkg(finalStr, opts);
};
