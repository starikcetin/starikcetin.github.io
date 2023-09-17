const customSlugify = require("./custom-slugify");

const projectLink = (name) => `/projects/${customSlugify(name, "-")}/`;

module.exports = {
    projectLink,
};