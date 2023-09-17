const factory = require('../../scripts/factory');

module.exports = {
    permalink: (data) => factory.projectLink(data.projectItem.name),
    eleventyComputed: {
        title: (data) => data.projectItem.name,
        dates: {
            modified: (data) => data.projectItem.dataDates?.modified,
            published: (data) => data.projectItem.dataDates?.published,
        },
    },
};
