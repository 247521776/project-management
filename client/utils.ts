import * as path from "path";
import * as fs from "fs";
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

        const existPackage = fs.existsSync(packagePath);

        if (existPackage) {
            const packageJson = require(packagePath);
            (project as IProject).name = packageJson.name;
            (project as IProject).description = packageJson.description;
            (project as IProject).version = packageJson.version;
        }
        else {
            (project as IProject).name = path.parse(dir).name;
            (project as IProject).description = "无";
            (project as IProject).version = "无";
        }
    }

    return {
        projects
    };
}

export function getProjects() {
    return store.get('projects') || [];
}

export function setProjectList(list: any[]) {
    store.set('projects', list);
}

export function clearProject() {
    store.clear();
}

export function getSettings() {
    const workspaces = store.get('workspace') || [];
    return {
        workspaces,
    };
}

export function getWorkspaces() {
    return store.get('workspace') || [];
}

export function addWorkspace(workspace) {
    const workspaces = store.get('workspace') || [];
    workspaces.unshift(workspace);
    store.set("workspace", workspaces);
}

export function deleteWorkspace(dirPath) {
    const workspaces = store.get('workspace') || [];
    
    store.set("workspace", workspaces.filter((workspace) => workspace.dirPath !== dirPath));
}

export function editWorkspace(data) {
    const newData = data.newData;
    const workspaces = getWorkspaces();

    for (let workspace of workspaces) {
        if (workspace.dirPath === data.dirPath) {
            workspace.dirName = newData.dirName;
            workspace.dirPath = newData.dirPath;
        }
    }

    store.set('workspace', workspaces);
}
