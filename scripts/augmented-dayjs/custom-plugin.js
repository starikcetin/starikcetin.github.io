const { hasValue } = require("../nullish.js");
const { pick, sort, mapProxy } = require("../utils.js");

const pickValueForNullishForSort = (order) => "ascending" === order ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

const plugin = (option, Dayjs, dayjs) => {
    // https://www.w3.org/TR/NOTE-datetime
    Dayjs.prototype.toW3C = function () { return this.format("YYYY-MM-DDTHH:mm:ssZ"); };

    // https://en.wikipedia.org/wiki/ISO_8601
    Dayjs.prototype.toISO8601 = function () { return this.toISOString(); };

    // https://datatracker.ietf.org/doc/html/rfc3339
    Dayjs.prototype.toRfc3339 = function () { return this.format("YYYY-MM-DDTHH:mm:ssZ"); };

    // https://www.w3.org/Protocols/rfc822/#z28
    Dayjs.prototype.toRfc822 = function () { return this.format("ddd, DD MMM YYYY HH:mm:ss ZZ"); };

    dayjs.now = function () { return dayjs(); };
    dayjs.sane = function (date) { return hasValue(date) ? dayjs(date) : undefined; };

    dayjs.fromDates = {
        published: function (dates) { return dayjs.sane(dates?.published); },
        modified: function (dates) { return dayjs.sane(dates?.modified); },
        modifiedOrPublished: function (dates) { return dayjs.fromDates.modified(dates) ?? dayjs.fromDates.published(dates); },
    };

    dayjs.fromData = {
        published: function (data) { return dayjs.fromDates.published(data?.dates); },
        modified: function (data) { return dayjs.fromDates.modified(data?.dates); },
        modifiedOrPublished: function (data) { return dayjs.fromDates.modifiedOrPublished(data?.dates); },
    };

    dayjs.fromPage = {
        published: function (page) { return dayjs.fromData.published(page?.data); },
        modified: function (page) { return dayjs.fromData.modified(page?.data); },
        modifiedOrPublished: function (page) { return dayjs.fromData.modifiedOrPublished(page?.data); },
    };

    dayjs.fromArray = {
        ofDate: {
            newest: function (arr) { return dayjs.sane(pick(arr, x => dayjs.sane(x)?.valueOf(), Math.max)) },
            oldest: function (arr) { return dayjs.sane(pick(arr, x => dayjs.sane(x)?.valueOf(), Math.min)) },
        },
        ofDatesObject: {
            published: {
                newest: function (arr) { return dayjs.fromArray.ofDate.newest(mapProxy(arr, x => dayjs.fromDates.published(x))) },
                oldest: function (arr) { return dayjs.fromArray.ofDate.oldest(mapProxy(arr, x => dayjs.fromDates.published(x))) },
            },
            modifiedOrPublished: {
                newest: function (arr) { return dayjs.fromArray.ofDate.newest(mapProxy(arr, x => dayjs.fromDates.modifiedOrPublished(x))) },
                oldest: function (arr) { return dayjs.fromArray.ofDate.oldest(mapProxy(arr, x => dayjs.fromDates.modifiedOrPublished(x))) },
            },
        },
    };

    dayjs.fromCollection = {
        published: {
            newest: function (collection) { return dayjs.fromArray.ofDatesObject.published.newest(mapProxy(collection, x => dayjs.fromPage.published(x))) },
            oldest: function (collection) { return dayjs.fromArray.ofDatesObject.published.oldest(mapProxy(collection, x => dayjs.fromPage.published(x))) },
        },
        modifiedOrPublished: {
            newest: function (collection) { return dayjs.fromArray.ofDatesObject.modifiedOrPublished.newest(mapProxy(collection, x => dayjs.fromPage.modifiedOrPublished(x))) },
            oldest: function (collection) { return dayjs.fromArray.ofDatesObject.modifiedOrPublished.oldest(mapProxy(collection, x => dayjs.fromPage.modifiedOrPublished(x))) },
        },
    };

    dayjs.sortCollection = {
        byPublished: function (collection, order = "descending") { return sort(collection, x => dayjs.fromPage.published(x)?.valueOf(), order, pickValueForNullishForSort(order)); },
        byModifiedOrPublished: function (collection, order = "descending") { return sort(collection, x => dayjs.fromPage.modifiedOrPublished(x)?.valueOf(), order, pickValueForNullishForSort(order)); },
    };
}

module.exports = plugin;
