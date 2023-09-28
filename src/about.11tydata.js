const dayjs = require("../scripts/augmented-dayjs");
const { mapProxy } = require("../scripts/utils");

const getDatesObjects = (data) => [
    data.ownDates, 
    data.me.dataDates,
    ...mapProxy(data.skills, x => x.dataDates),
    ...mapProxy(data.experience, x => x.dataDates),
    ...mapProxy(data.education, x => x.dataDates),
    ...mapProxy(data.awards, x => x.dataDates),
];

module.exports = {
    eleventyComputed : {
        dates: {
            published: data => data.ownDates.published,
            modified: data => dayjs.fromArray.ofDatesObject.modifiedOrPublished.newest(getDatesObjects(data)),
        },
    },
};
