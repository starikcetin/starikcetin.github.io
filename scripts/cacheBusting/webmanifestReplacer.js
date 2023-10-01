const convertPath = require('./convertPath.js');

/** @type {import('./buster.js').Replacer} */
const webmanifestReplacer = (content, assetPaths, distDirPath) => {
    const parsed = JSON.parse(content);

    parsed.icons.forEach(icon => {
        const oldSrc = icon.src;
        const newSrc = convertPath(oldSrc, assetPaths, distDirPath);
        icon.src = newSrc;
    });

    return JSON.stringify(parsed);
};

module.exports = webmanifestReplacer;
