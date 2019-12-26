import * as path from "path";
const Store = require('electron-store');

const store = new Store();

interface IProject {
    dir: string;
    name: string;
    description: string;
    version: string;
}

export function getProjectList() {
    
    const projects = store.get('projects') || [];

    for (const project of projects) {
        const dir = project.dir;
        const packagePath = path.resolve(dir, "package.json");
        const packageJson = require(packagePath);
        (project as IProject).name = packageJson.name;
        (project as IProject).description = packageJson.description;
        (project as IProject).version = packageJson.version;
    }

    return {
        projects
    };
}

export function setProjectList(list: any[]) {
    store.set('projects', list);
}
