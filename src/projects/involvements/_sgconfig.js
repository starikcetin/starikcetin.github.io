const requireYaml = require("require-yml");
const path = require("path");

const projectsDataPath = path.join(__dirname, "/../../_data/projects.yml");

module.exports = () => {
    const projectsData = requireYaml(projectsDataPath);
    return {
        titles: [...new Set(projectsData.map(x => x.involvement).flat())],
    };
};
