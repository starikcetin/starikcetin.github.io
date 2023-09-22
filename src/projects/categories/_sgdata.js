module.exports = {
    pagination: {
        before: (paginationData, fullData) => fullData.projects.filter(x => x.categories.includes("__SG_TITLE__")),
    },
};
