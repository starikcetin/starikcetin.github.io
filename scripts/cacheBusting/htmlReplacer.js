const { hasValue } = require('../nullish.js');
const convertPath = require('./convertPath.js');

const htmlParser = require('node-html-parser');

/** @type {import('./buster.js').Replacer} */
const htmlReplacer = (content, assetPaths, distDirPath) => {
    const parsed = htmlParser.parse(content);

    parsed.querySelectorAll('link').forEach(linkElm => {
        const oldHrefAttr = linkElm.getAttribute('href');
        const newHrefAttr = convertPath(oldHrefAttr, assetPaths, distDirPath);
        linkElm.setAttribute('href', newHrefAttr);
    });

    parsed.querySelectorAll('script').forEach(scriptElm => {
        const oldHrefAttr = scriptElm.getAttribute('href');
        if(hasValue(oldHrefAttr)) {            
            const newHrefAttr = convertPath(oldHrefAttr, assetPaths, distDirPath);
            scriptElm.setAttribute('href', newHrefAttr);
        }

        const oldSrcAttr = scriptElm.getAttribute('src');
        if(hasValue(oldSrcAttr)) {
            const newSrcAttr = convertPath(oldSrcAttr, assetPaths, distDirPath);
            scriptElm.setAttribute('src', newSrcAttr);
        }
    });

    parsed.querySelectorAll('img').forEach(imgElm => {
        const oldSrcAttr = imgElm.getAttribute('src');
        const newSrcAttr = convertPath(oldSrcAttr, assetPaths, distDirPath);
        imgElm.setAttribute('src', newSrcAttr);
    });

    parsed.querySelectorAll('a').forEach(anchorElm => {
        const oldHrefAttr = anchorElm.getAttribute('href');
        const newHrefAttr = convertPath(oldHrefAttr, assetPaths, distDirPath);
        anchorElm.setAttribute('href', newHrefAttr);
    });

    const newContent = parsed.toString();
    return newContent;
};

module.exports = htmlReplacer;
