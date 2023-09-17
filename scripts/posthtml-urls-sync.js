// sync version of posthtml-urls 
// https://github.com/posthtml/posthtml-urls

"use strict";
const HTTP_EQUIV = "http-equiv";
const REFRESH = "refresh";

const isHttpEquiv = ({ attrs }) => HTTP_EQUIV in attrs && attrs[HTTP_EQUIV].toLowerCase() === REFRESH;

const DEFAULT_OPTIONS =
{
    filter:
    {
        "*": { itemtype: true },
        a: { href: true, ping: true },
        applet: { archive: true, code: true, codebase: true, object: true, src: true },
        area: { href: true, ping: true },
        audio: { src: true },
        base: { href: true },
        blockquote: { cite: true },
        body: { background: true },
        button: { formaction: true },
        del: { cite: true },
        embed: { src: true },
        form: { action: true },
        frame: { longdesc: true, src: true },
        head: { profile: true },
        html: { manifest: true },
        iframe: { longdesc: true, src: true },
        img: { longdesc: true, src: true, srcset: true },
        input: { formaction: true, src: true },
        ins: { cite: true },
        link: { href: true },
        menuitem: { icon: true },
        meta: { content: isHttpEquiv },
        object: { codebase: true, data: true },
        q: { cite: true },
        script: { src: true },
        source: { src: true, srcset: true },
        table: { background: true },
        tbody: { background: true },
        td: { background: true },
        tfoot: { background: true },
        th: { background: true },
        thead: { background: true },
        tr: { background: true },
        track: { src: true },
        video: { poster: true, src: true }
    }
};

const evaluateValue = require("evaluate-value");
const list2Array = require("list-to-array");
const parseMetaRefresh = require("http-equiv-refresh");
const parseSrcset = require("parse-srcset");

const CONTENT_ATTR = "content";
const PING_ATTR = "ping";
const SRCSET_ATTR = "srcset";

const DELIMITER = ",";
const EMPTY_STRING = "";
const EMPTY_TAG_GROUP = Object.freeze({});
const FUNCTION_TYPE = "function";
const PRETTY_DELIMITER = ", ";

const plugin = options => {
    const { eachURL, filter } = Object.assign({}, DEFAULT_OPTIONS, options);

    if (typeof eachURL !== FUNCTION_TYPE) {
        throw new TypeError("eachURL option must be a function");
    }

    const allTagsGroup = filter["*"];

    // Called by PostHTML
    return tree => {
        tree.walk(node => {
            if (node.attrs !== undefined) {
                const tagGroup = filter[node.tag] || EMPTY_TAG_GROUP;

                Object.keys(node.attrs).forEach(attrName => {
                    const isAcceptedGlobalAttr = attrName in allTagsGroup && evaluateValue(allTagsGroup[attrName], node, attrName);
                    const isAcceptedTagAttr = attrName in tagGroup && evaluateValue(tagGroup[attrName], node, attrName);

                    if (isAcceptedGlobalAttr || isAcceptedTagAttr) {
                        switch (attrName) {
                            case CONTENT_ATTR:
                            {
                                transformMetaRefresh(node, attrName, eachURL);
                                break;
                            }
                            case PING_ATTR:
                            {
                                transformCommaSeparated(node, attrName, eachURL);
                                break;
                            }
                            case SRCSET_ATTR:
                            {
                                transformSrcset(node, attrName, eachURL);
                                break;
                            }
                            default:
                            {
                                transformDefault(node, attrName, eachURL);
                            }
                        }
                    }
                });
            }

            return node;
        });

        return tree;
    };
};

const transformCommaSeparated = ({ attrs, tag }, attrName, transformer) => {
    const urls = list2Array(attrs[attrName], DELIMITER);

    if (urls.length > 0) {
        const newUrls = urls.map(value => transformer(value, attrName, tag));
        attrs[attrName] = newUrls.join(PRETTY_DELIMITER);
    }
};

const transformDefault = ({ attrs, tag }, attrName, transformer) => {
    const newUrl = transformer(attrs[attrName], attrName, tag);
    attrs[attrName] = newUrl;
};

const transformMetaRefresh = ({ attrs, tag }, attrName, transformer) => {
    const { timeout, url } = parseMetaRefresh(attrs[attrName]);

    if (timeout !== null) {
        const newUrl = transformer(url || "", attrName, tag);
        attrs[attrName] = `${timeout}; url=${newUrl}`;
    }
};

const transformSrcset = ({ attrs, tag }, attrName, transformer) => {
    const values = parseSrcset(attrs[attrName]);

    if (values.length > 0) {
        const newValues = values.map(({ d, h, url, w }) => {
            const newUrl = transformer(url, attrName, tag);
                d = d !== undefined ? ` ${d}x` : EMPTY_STRING;
                h = h !== undefined ? ` ${h}h` : EMPTY_STRING;
                w = w !== undefined ? ` ${w}w` : EMPTY_STRING;
                return `${newUrl}${w}${h}${d}`;
            });

        attrs[attrName] = newValues.join(PRETTY_DELIMITER);
    }
};

module.exports = { DEFAULT_OPTIONS, plugin };
