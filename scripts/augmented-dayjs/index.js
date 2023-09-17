const dayjs = require("dayjs");
const advancedFormat = require('dayjs/plugin/advancedFormat');
const customPlugin = require("./custom-plugin.js");

dayjs.extend(advancedFormat);
dayjs.extend(customPlugin);

module.exports = dayjs;
