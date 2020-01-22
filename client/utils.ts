import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid/v4";
const Store = require('electron-store');

const store = new Store();

export interface Project {
    sourceId: string;
    dir: string;
    name: string;
    description: string;
    version: string;
}

export interface Workspace {
    id: string;
    dirName: string;
    dirPath: string;
}

export interface Source {
    id: string;
    sourceName: string;
    source: string;
}

export function getProjectList() {
    const projects = store.get('projects') || [];

    for (const project of projects) {
        const dir = project.dir;
        const packagePath = path.resolve(dir, "package.json");

        const existPackage = fs.existsSync(packagePath);

        if (existPackage) {
            const packageJson = require(packagePath);
            (project as Project).name = packageJson.name;
            (project as Project).description = packageJson.description;
            (project as Project).version = packageJson.version;
        }
        else {
            (project as Project).name = path.parse(dir).name;
            (project as Project).description = "无";
            (project as Project).version = "无";
        }
    }

    return {
        projects
    };
}

export function getProjects() {
    return store.get('projects') || [];
}

export function setProjectList(list: Project[]) {
    store.set('projects', list);
}

export function editProject(project: Project) {
    const projects = getProjects();

    for (const _project of projects) {
        if (_project.dir === project.dir) {
            _project.sourceId = project.sourceId;
            break;
        }
    }

    setProjectList(projects);
}

export function clear() {
    store.clear();
}

export function getSettings() {
    const workspaces = store.get('workspace') || [];
    const sources = getSources();

    return {
        workspaces,
        sources
    };
}

export function getWorkspaces() {
    return store.get('workspace') || [];
}

export function addWorkspace(workspace: Workspace) {
    const workspaces = store.get('workspace') || [];
    workspace.id = uuid();
    workspaces.unshift(workspace);
    store.set("workspace", workspaces);

    return workspace;
}

export function deleteWorkspace(id) {
    const workspaces = store.get('workspace') || [];
    
    store.set("workspace", workspaces.filter((workspace: Workspace) => workspace.id !== id));
}

export function editWorkspace(data) {
    const newData = data.newData;
    const workspaces = getWorkspaces();

    for (let workspace of workspaces) {
        if (workspace.id === data.id) {
            workspace.dirName = newData.dirName;
            workspace.dirPath = newData.dirPath;
        }
    }

    store.set('workspace', workspaces);
}

export function getSources() {
    return store.get('source') || [];
}

export function addSource(source: Source) {
    const sources = getSources();
    source.id = uuid();
    sources.unshift(source);
    store.set("source", sources);

    return source;
}

export function editSource(data) {
    const newData = data.newData;
    const sources = getSources();

    for (let source of sources) {
        if (source.id === data.id) {
            source.sourceName = newData.sourceName;
            source.source = newData.source;
        }
    }

    store.set('source', sources);
}

export function deleteSource(id) {
    const sources = getSources();
    
    store.set("source", sources.filter((_source) => _source.id !== id));
}
