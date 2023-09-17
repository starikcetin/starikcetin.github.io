const siteConfig = require("./siteConfig.js");

module.exports = function (relative, base=siteConfig.baseUrl) { return new URL(relative, base).toString(); };
