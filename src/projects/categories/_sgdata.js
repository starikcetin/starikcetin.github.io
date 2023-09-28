const dayjs = require("../../../scripts/augmented-dayjs");
const { mapProxy } = require("../../../scripts/utils");

const getDatesObjects = (data) => [
    data.ownDates, 
    ...mapProxy(data.pageItems, x => x.dataDates)
];

module.exports = {
    pagination: {
        before: (paginationData, fullData) => fullData.projects.filter(x => x.categories.includes("__SG_TITLE__")),
    },
    eleventyComputed : {
        dates: {
            published: data => data.ownDates.published,
            modified: data => dayjs.fromArray.ofDatesObject.modifiedOrPublished.newest(getDatesObjects(data)),
        },
    },
};
