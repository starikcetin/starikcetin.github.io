const siteConfig = require('../siteConfig.js');
const { isNullish } = require('../nullish.js');

const { URL } = require('url');
const path = require('upath');

const siteUrl = new URL(siteConfig.baseUrl);

/**
 * @param {string} oldUrl
 * @param {import('./buster.js').AssetPathsMap} assetPaths
 * @param {string} distDirPath
 */
const convertPath = (oldUrl, assetPaths, distDirPath) => {
    if (isNullish(oldUrl)) {
        return oldUrl;
    }

    const url = new URL(oldUrl, siteConfig.baseUrl);

    // return third party urls as-is
    if (url.hostname !== siteUrl.hostname) {
        return oldUrl;
    }

    const oldPathname = url.pathname;
    const oldPath = path.join(distDirPath, oldPathname);
    const newPath = assetPaths[oldPath];

    if (isNullish(newPath)) {
        return oldUrl;
    }

    const newPathname = '/' + path.relative(distDirPath, newPath);
    url.pathname = newPathname;

    // get root-relative url
    const rootRelativeUrl = `${url.pathname ?? ""}${url.search ?? ""}${url.hash ?? ""}`;

    return rootRelativeUrl;
};

module.exports = convertPath;
