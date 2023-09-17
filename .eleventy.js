const siteConfig = require("./scripts/siteConfig.js");
const starryNightGutter = require("./scripts/hast-util-starry-night-gutter");
const htmlToAbsoluteUrlsSync = require("./scripts/htmlToAbsoluteUrls-sync");
const dayjs = require("./scripts/augmented-dayjs");
const nullish = require("./scripts/nullish.js");
const absoluteUrl = require("./scripts/absoluteUrl.js");
const utils = require("./scripts/utils.js");
const slugify = require("./scripts/custom-slugify.js");
const factory = require("./scripts/factory.js");

const markdownIt = require("markdown-it");
const yaml = require("js-yaml");
const markdownItInline = require('markdown-it-for-inline');
const esbuild = require("esbuild");
const esBuildSassPlugin = require("esbuild-sass-plugin");
const markdownItAnchor = require("markdown-it-anchor");
const ordinal = require("ordinal");

let starryNight;
let hastToHtml;
async function importEsmDeps() {
  hastToHtml = await import('hast-util-to-html');
  starryNight = await import('@wooorm/starry-night');
}

module.exports = function (eleventyConfig) {
  const isProduction = siteConfig.deployEnv === "prod";

  let starryNightInstance;

  eleventyConfig.on('eleventy.before', async ({}) => {
    await importEsmDeps();
    starryNightInstance = await starryNight.createStarryNight(starryNight.common);
  });

  eleventyConfig.on("afterBuild", async () => {
    await esbuild.build({
      entryPoints: ["src/_styles/main.scss"],
      outdir: 'dist/styles',
      bundle: true,
      minify: isProduction,
      sourcemap: !isProduction,
      target: 'es6',
      plugins: [esBuildSassPlugin.sassPlugin()],
    });

    await esbuild.build({
      entryPoints: ["src/_scripts/main.js"],
      outdir: 'dist/scripts',
      bundle: true,
      minify: isProduction,
      sourcemap: !isProduction,
      target: 'es6',
    });
  });

  const markdownItInstance = new markdownIt({
    html: true,
    highlight: (code, lang) => {
      const scope = starryNightInstance.flagToScope(lang)
      const tree = starryNightInstance.highlight(code, scope);
      starryNightGutter(tree);
      const codeElm = hastToHtml.toHtml({
        type: 'element',
        tagName: 'code',
        properties: {
          className: scope
            ? [
              'highlight',
              'highlight-' + scope.replace(/^source\./, '').replace(/\./g, '-')
            ]
            : undefined
        },
        children: scope
          ? tree.children
          : [{ type: 'text', code }]
      });
      return `<pre class="code-block">${codeElm}</pre>`;
    },
  })
  .use(markdownItInline, 'inline-code-higlight', 'code_inline', function (tokens, idx) {
    tokens[idx].attrPush(['class', 'code-inline']);
  })
  .use(markdownItInline, 'url_new_win', 'link_open', function (tokens, idx) {
    tokens[idx].attrPush([ 'target', '_blank' ]);
  })
  .use(markdownItAnchor, {
    level: 2,
    tabIndex: false,
    slugify,
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      symbol: '<span class="feather-container"><i data-feather="link"></i></span>',
      class: "heading-anchor"
    }),
  });

  eleventyConfig.addCollection("techPost", colApi => dayjs.sortCollection.byPublished(colApi.getFilteredByTags("post", "tech")));
  eleventyConfig.addCollection("lifePost", colApi => dayjs.sortCollection.byPublished(colApi.getFilteredByTags("post", "life")));

  eleventyConfig.addDataExtension("yml, yaml", contents => yaml.load(contents));
  eleventyConfig.setLibrary('md', markdownItInstance);
  eleventyConfig.addPassthroughCopy({ "src/_assets/": "/" });
  eleventyConfig.addWatchTarget("./src/**");
  eleventyConfig.addWatchTarget("./*.js");

  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!--excerpt-->",
  });

  global._ = {
    ...eleventyConfig.javascriptFunctions,
    ...utils,
    ...nullish,
    markdownIt: markdownItInstance,
    slugify,
    dayjs,
    absoluteUrl,
    htmlToAbsoluteUrls: htmlToAbsoluteUrlsSync,
    ordinal,
    factory,
  };

  eleventyConfig.setPugOptions({
    globals: ["_"],
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    }
  };
};
