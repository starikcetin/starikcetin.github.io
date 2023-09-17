// sync version of htmlToAbsoluteUrls filter from @11ty/eleventy-plugin-rss
// https://github.com/11ty/eleventy-plugin-rss/blob/master/src/htmlToAbsoluteUrls.js

const absoluteUrl = require('./absoluteUrl');
const urls = require('./posthtml-urls-sync').plugin;
const posthtml = require('posthtml');

module.exports = function(htmlContent, base, processOptions = {}) {
  if( !base ) {
    throw new Error( "eleventy-plugin-rss, htmlToAbsoluteUrls(absolutePostUrl) was missing the full URL base `absolutePostUrl` argument.")
  }

  let options = {
    eachURL: function(url) {
      return absoluteUrl(url.trim(), base);
    }
  };

  let modifier = posthtml().use(urls(options));

  let result = modifier.process(htmlContent, processOptions);
  return result.html;
};
