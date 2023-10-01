/*
 * Append hashes to asset names and modify referencing sites to use the new names.
 */

/**
 * @typedef {{[oldAssetPath: string]: string;}} AssetPathsMap
 *
 * @callback Replacer
 * @param {string} content The content of the referencer file.
 * @param {AssetPathsMap} assetPaths A map of old asset paths to new asset paths.
 * @param {string} distDirPath Path to the dist folder.
 * @returns {string} The modified content of the referencer file.
 *
 * @typedef {Object} ReplacementConfigs
 * @property {string[]} extensions Array of referencer file extensions without dots.
 * @property {Replacer} replacer A function that performs the replacements.
 *
 * @typedef {Object} Options
 * @property {string[]} assetExtensions Array of asset file extensions without dots.
 * @property {string[]} ignoreAssetPaths Array of dist-relative asset paths to ignore.
 * @property {ReplacementConfigs[]} replacementConfigs Array of reference replacement configs.
 */

const path = require('upath');
const { rootPath: rootPathRaw } = require("get-root-path");
const glob = require('fast-glob');
const fs = require('fs');
const normalizePath = require("normalize-path");
const deepMerge = require('deepmerge');
const md5 = require('md5');

const rootPath = normalizePath(rootPathRaw);

/** @type {Options} */
const defaultOptions = {
    assetExtensions: [],
    replacementProcessors: [],
};

let triggerForWatch = false;

/** @type {string[]} */
let watchChangedFiles = [];

/** @type {AssetPathsMap} */
let lastAssetPathsMap = {};

let distDirPath = "NOT_INITIALIZED_YET";

/** @type {Options} */
let options = {};

/**
 * @param {string} relativePath 
 * @returns {string}
 */
const toAbsolutePath = (relativePath) => {
    return path.join(rootPath, relativePath);
};

/**
 * @param {string} absolutePath 
 * @returns {string}
 */
const toRootRelativePath = (absolutePath) => {
    return path.relative(rootPath, absolutePath);
};

/**
 * @param {string} absolutePath 
 * @returns {string}
 */
const toDistRelativePath = (absolutePath) => {
    return path.relative(distDirPath, absolutePath);
};

const getAllAssetPaths = () => {
    const assetGlobs = options.assetExtensions.map(x => path.join(distDirPath, `**/*.${x}`));
    const assetPaths = assetGlobs.map(x => glob.sync(x)).flat().filter(x => !options.ignoreAssetPaths.includes(toDistRelativePath(x)));
    return assetPaths;
};

const cleanForWatch = () => {
    // build an inverse asset paths map
    const inverseAssetPathsMap = Object.entries(lastAssetPathsMap).reduce((acc, entry) => {
        const [oldAssetPath, newAssetPath] = entry;
        acc[newAssetPath] = oldAssetPath;
        return acc;
    }, {});

    // rename assets back to their original names
    Object.keys(inverseAssetPathsMap).forEach(assetPath => fs.renameSync(assetPath, inverseAssetPathsMap[assetPath]));

    // run the replacers with the inverse map
    replaceReferences(inverseAssetPathsMap);
};

/**
 * @returns {AssetPathsMap}
 */
const hashAssets = () => {
    // get all assets
    const assetPaths = getAllAssetPaths();

    // hash all assets
    const assetHashesMap = assetPaths.reduce((acc, assetPath) => {
        acc[assetPath] = md5(fs.readFileSync(assetPath)).slice(0, 9);
        return acc;
    }, {});

    // calculate new asset paths
    const assetPathsMap = assetPaths.reduce((acc, oldAssetPath) => {
        const assetPathParts = path.parse(oldAssetPath);
        const newAssetFilename = `${assetPathParts.name}.${assetHashesMap[oldAssetPath]}${assetPathParts.ext}`;
        acc[oldAssetPath] = path.join(assetPathParts.dir, newAssetFilename);

        // handle map file, if exists
        const oldMapPath = `${oldAssetPath}.map`;
        if (fs.existsSync(oldMapPath)) {
            const newMapFilename = `${newAssetFilename}.map`;
            acc[oldMapPath] = path.join(assetPathParts.dir, newMapFilename);
        }

        return acc;
    }, {});

    const allFilesToRename = Object.keys(assetPathsMap);

    // rename assets
    allFilesToRename.forEach(assetPath => {
        console.log(`[Cache Buster] Rename ${toRootRelativePath(assetPath)} to ${toRootRelativePath(assetPathsMap[assetPath])}`);
        fs.renameSync(assetPath, assetPathsMap[assetPath]);
    });

    return assetPathsMap;
};

/**
 * @param {AssetPathsMap} assetPathsMap 
 */
const replaceReferences = (assetPathsMap) => {
    for (const replacementConfig of options.replacementConfigs) {
        const { extensions, replacer } = replacementConfig;

        const referencerGlobs = extensions.map(x => path.join(distDirPath, `**/*.${x}`));
        const referencerPaths = referencerGlobs.map(x => glob.sync(x)).flat();

        for (const referencerPath of referencerPaths) {
            const oldContent = fs.readFileSync(referencerPath, 'utf8');
            const newContent = replacer(oldContent, assetPathsMap, distDirPath);

            if (newContent !== oldContent) {
                console.log(`[Cache Buster] Replace ${toRootRelativePath(referencerPath)}`);
                fs.writeFileSync(referencerPath, newContent, 'utf8');
            }
        }
    }
};

const onBeforeWatch = (eleventyConfig, changedFiles) => {
    triggerForWatch = true;
    watchChangedFiles = changedFiles.map(x => toAbsolutePath(x));
    console.log("[Cache Buster] Cleanup for watch");
    cleanForWatch();
};

const onAfter = (eleventyConfig) => {
    distDirPath = path.join(rootPath, eleventyConfig.dir.output);

    const assetPathsMap = hashAssets();
    replaceReferences(assetPathsMap);

    lastAssetPathsMap = assetPathsMap;
    triggerForWatch = false;
    watchChangedFiles = [];
};

/**
 * @param {*} eleventyConfig
 * @param {Options} opts
 */
const onConfig = (eleventyConfig, opts) => {
    options = deepMerge(defaultOptions, opts);
};

module.exports = { onBeforeWatch, onAfter, onConfig };
