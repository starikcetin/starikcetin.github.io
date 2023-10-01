const buster = require('./buster.js');
const htmlReplacer = require('./htmlReplacer.js');
const webmanifestReplacer = require('./webmanifestReplacer.js');
const xmlReplacer = require('./xmlReplacer.js');

module.exports = {
    buster,    
    replacers: {
        html: htmlReplacer,
        webmanifest: webmanifestReplacer,
        xml: xmlReplacer,
    },
};
