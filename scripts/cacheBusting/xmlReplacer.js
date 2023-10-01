const convertPath = require('./convertPath.js');

const xml = require('xmldom');

/** @type {import('./buster.js').Replacer} */
const xmlReplacer = (content, assetPaths, distDirPath) => {
    const parser = new xml.DOMParser();
    const serializer = new xml.XMLSerializer();

    const parsed = parser.parseFromString(content, 'application/xml');

    const square150x150logoElms = parsed.getElementsByTagName("square150x150logo");
    for (let i = 0; i < square150x150logoElms.length; i++) {
        const square150x150logoElm = square150x150logoElms.item(i);
        const oldSrc = square150x150logoElm.getAttribute('src');
        const newSrc = convertPath(oldSrc, assetPaths, distDirPath);
        square150x150logoElm.setAttribute('src', newSrc);
    }

    const newContent = serializer.serializeToString(parsed);
    return newContent;
};

module.exports = xmlReplacer;
