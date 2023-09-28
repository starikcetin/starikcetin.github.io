/*

Generate sources files from a set of config and base files.

Create a folder to host the generated files.
Create a base template file within, named '_sgtemplate.pug' (or .njk, etc.).
Create a config file within, named '_sgconfig.js'.
Create a data file template within, named '_sgdata.js'.
For example:
    - template file: src/categories/_sgtemplate.pug
    - config file: src/categories/_sgconfig.js
A folder called '_sggenerated' will be created as a sibling to the template and config files. (Ignore these folders in source control.)
A set of template and data files will be generated within the '_sggenerated' folder.

Config file should export a function that returns an object as such:
{
    titles: [titles for generation],
}

These will be replaced in generated files:
__SG_TITLE__        ->   title
__SG_SLUG__         ->   slugified title

*/

const path = require('upath');
const { rootPath: rootPathRaw } = require("get-root-path");
const glob = require('fast-glob');
const fs = require('fs');
const normalizePath = require("normalize-path");
const slugify = require("./custom-slugify");

const rootPath = normalizePath(rootPathRaw);

const generatedDirName = '_sggenerated';
const configFileNameWithExtension = '_sgconfig.js';
const baseTemplateFileNameWithoutExtension = '_sgtemplate';
const baseDataFileNameWithExtension = '_sgdata.js';

let watchChangedFiles = [];
let triggerForWatch = false;

const toAbsolutePath = (relativePath) => {
    return path.join(rootPath, relativePath);
};

const getSourcesDirPath = (eleventyConfig) => {
    return path.join(rootPath, eleventyConfig.dir.input);
};

const getPathGroups = (eleventyConfig) => {
    const sourcesDirPath = getSourcesDirPath(eleventyConfig);
    const configGlob = path.join(sourcesDirPath, `**/${configFileNameWithExtension}`);
    const configPaths = glob.sync([configGlob], { absolute: true });
    const dirPaths = configPaths.map(configFile => path.dirname(configFile));
    const baseDataPaths = dirPaths.map(dirPath => path.join(dirPath, baseDataFileNameWithExtension));

    const baseTemplatePaths = dirPaths.map(dirPath => {
        const templateGlob = path.join(dirPath, `${baseTemplateFileNameWithoutExtension}.*`);
        const templateFiles = glob.sync([templateGlob], { absolute: true });
        console.assert(templateFiles.length === 1);
        return templateFiles[0];
    });

    return configPaths.reduce((acc, configPath, i) => {
        acc.push({ dirPath: dirPaths[i], configPath, baseTemplatePath: baseTemplatePaths[i], baseDataPath: baseDataPaths[i] });
        return acc;
    }, []);
};

const replaceTemplate = (content, title) => {
    return content
        .replaceAll('__SG_TITLE__', title)
        .replaceAll('__SG_SLUG__', slugify(title))

        // generated files will be in subfolders, make requires go up one more level
        .replaceAll(/require\((['"])\.\//g, 'require($1../')
        .replaceAll(/require\((['"])\.\.\//g, 'require($1../../');
};

const isGeneratedFile = (filePath) => path.basename(path.dirname(filePath)) === generatedDirName;

const shouldGenerate = () => {
    return !triggerForWatch || watchChangedFiles.some(x => !isGeneratedFile(x));
};

const configure = (eleventyConfig) => {
    eleventyConfig.ignores.add(`**/${configFileNameWithExtension}`);
    eleventyConfig.ignores.add(`**/${baseTemplateFileNameWithoutExtension}*`);
};

const generateReplacedFile = (generatedDirPath, generatedFileExtension, baseContent, title) => {
    const generatedPath = path.join(generatedDirPath, slugify(title) + generatedFileExtension);
    const generatedContent = replaceTemplate(baseContent, title);
    fs.writeFileSync(generatedPath, generatedContent);
    return generatedPath;
};

const generatePage = (title, generatedDirPath, templateExtension, baseTemplateContent, baseDataContent) => {
    console.log("    [Source Generator] Generate:", title);
    const generatedTemplatePath = generateReplacedFile(generatedDirPath, templateExtension, baseTemplateContent, title);
    const generatedDataPath = generateReplacedFile(generatedDirPath, ".11tydata.js", baseDataContent, title);
    return [generatedTemplatePath, generatedDataPath];
};

const generateGroup = (pathGroup, eleventyConfig) => {
    const { dirPath, configPath, baseTemplatePath, baseDataPath } = pathGroup;
    const sourcesDirPath = getSourcesDirPath(eleventyConfig);
    const relativeDirPath = path.relative(sourcesDirPath, dirPath);
    console.log("[Source Generator] Process:", relativeDirPath);
    
    const generatedDirPath = path.join(dirPath, generatedDirName);
    if (!fs.existsSync(generatedDirPath)) fs.mkdirSync(generatedDirPath);

    const config = require(configPath)();
    const baseTemplateContent = fs.readFileSync(baseTemplatePath, 'utf8');
    const baseDataContent = fs.readFileSync(baseDataPath, 'utf8');
    const templateExtension = path.extname(baseTemplatePath);

    const generatedPaths = [];

    for (const title of config.titles) {
        const generatedPagePaths = generatePage(title, generatedDirPath, templateExtension, baseTemplateContent, baseDataContent);
        generatedPaths.push(...generatedPagePaths);
    }

    const allPathsInGeneratedDir = glob.sync([path.join(generatedDirPath, '**/*')], { absolute: true });
    const outdatedPaths = allPathsInGeneratedDir.filter(x => !generatedPaths.includes(x));
    for (const outdatedPath of outdatedPaths) {
        console.log("    [Source Generator] Delete:", path.relative(rootPath, outdatedPath));
        fs.unlinkSync(outdatedPath);
    }
};

const generate = (eleventyConfig) => {
    const pathGroups = getPathGroups(eleventyConfig);
    for (const pathGroup of pathGroups) {
        generateGroup(pathGroup, eleventyConfig);
    }
};

const onBefore = (eleventyConfig) => {
    if(shouldGenerate()) {
        generate(eleventyConfig);
    } else {
        console.log("[Source Generator] Skip (All changes are generated files)");
    }
};

const onBeforeWatch = (eleventyConfig, changedFiles) => {
    triggerForWatch = true;
    watchChangedFiles = changedFiles.map(x => toAbsolutePath(x));
};

const onAfter = (eleventyConfig) => {
    triggerForWatch = false;
};

const onConfig = (eleventyConfig) => {
    configure(eleventyConfig);
};

module.exports = { onBefore, onBeforeWatch, onAfter, onConfig };
