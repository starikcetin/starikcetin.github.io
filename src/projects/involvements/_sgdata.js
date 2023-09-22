module.exports = {
    pagination: {
        before: (paginationData, fullData) => fullData.projects.filter(x => x.involvement.includes("__SG_TITLE__")),
    },
};
