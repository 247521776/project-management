import { ipcMain, BrowserWindow } from "electron";
import { spawn, spawnSync } from "child_process";
import {
    getProjectList,
    setProjectList,
    getSettings,
    addWorkspace,
    getWorkspaces,
    deleteWorkspace,
    getProjects,
    editWorkspace
} from "./utils";
import * as path from "path";
import * as fs from "fs";

let downloadShell;

export class Event {
    data: any;
    browserWindow: BrowserWindow;
    constructor(browserWindow: BrowserWindow, data: any) {
        this.browserWindow = browserWindow;
        this.data = data;
    }

    build() {
        ipcMain.on("openProject", (event, index) => {
            this.openProject(index);
        });

        ipcMain.on("deleteProject", (event, index) => {
            this.deleteProject(index);
        });

        ipcMain.on("addProject", (event, data) => {
            const { projectDir, type, projectPath, gitPath } = data;
            if (type === "add") {
                this.addProject(projectDir);
            } else if (type === "new") {
                this.newAddProject(projectPath, gitPath);
            }
        });

        ipcMain.on("getSetting", event => {
            event.returnValue = getSettings();
        });

        ipcMain.on("addWorkspace", async (event, workspace) => {
            const { dirPath } = workspace;
            const isExistDir = fs.existsSync(dirPath);

            if (!isExistDir) {
                return (event.returnValue = "目录不存在");
            }

            const isDir = await isDirectory(dirPath);

            if (!isDir) {
                return (event.returnValue = "该目录路径不为文件夹");
            }

            const workspaces = getWorkspaces();

            for (const workspace of workspaces) {
                if (workspace.dirPath === dirPath) {
                    return (event.returnValue = "目录已添加");
                }
            }

            addWorkspace(workspace);

            this.browserWindow.webContents.send("workspace", getWorkspaces());
            event.returnValue = "";
        });

        ipcMain.on("getWorkspace", event => {
            event.returnValue = getWorkspaces();
        });

        ipcMain.on("deleteWorkspace", (event, dirPath) => {
            deleteWorkspace(dirPath);
            this.browserWindow.webContents.send("workspace", getWorkspaces());
        });

        ipcMain.on("editWorkspace", (event, data) => {
            editWorkspace(data);
        });

        ipcMain.on("downloadDepend", (event, dirPath) => {
            this.browserWindow.webContents.send("downloadDepend-setting");

            this.browserWindow.webContents.send("downloadDepend");

            downloadShell = spawn(`cd ${dirPath} && npm install`, {
                shell: true
            });

            downloadShell.on("close", code => {
                if (code === 0) {
                    this.browserWindow.webContents.send("downloadDepend-done");
                } else {
                    this.browserWindow.webContents.send("downloadDepend-error");
                }

                downloadShell = null;
            });
        });

        ipcMain.on("downloadDepend-cancel", event => {
            if (downloadShell) {
                downloadShell.kill();
            }
        });

        ipcMain.on("getWorkspaceDirectories", (event, dirPath) => {
            const projects = getProjects();
            const directories = fs.readdirSync(dirPath);
            const projectPaths = projects.map(project => project.dir);

            const filterAfterDirectories = directories.filter(dirName => {
                return (
                    dirName.indexOf(".") === -1 &&
                    !projectPaths.includes(path.resolve(dirPath, dirName))
                );
            });

            event.returnValue = filterAfterDirectories;
        });
    }

    openProject(index) {
        const project = this.data.projects[index];
        spawn(`code -n ${project.dir}`, {
            shell: true
        });
    }

    deleteProject(index) {
        const project = this.data.projects.splice(index, 1)[0];

        setProjectList(this.data.projects);

        spawn(`rm -rf ${project.dir}`, {
            shell: true
        });
    }

    addProject(projectDir) {
        this.data.projects.unshift({
            dir: projectDir
        });

        setProjectList(this.data.projects);

        this.browserWindow.webContents.send("loaded", getProjectList());
    }

    newAddProject(projectPath, gitPath) {
        const splitResult = gitPath.split("/");
        const projectName = splitResult[splitResult.length - 1].split(".")[0];
        this.data.projects.unshift({
            dir: path.resolve(projectPath, projectName)
        });

        setProjectList(this.data.projects);

        const result = spawn(
            `mkdir -p ${projectPath} && cd ${projectPath} && git clone ${gitPath}`,
            {
                shell: true
            }
        );

        result.on("close", () => {
            this.browserWindow.webContents.send("loaded", getProjectList());
        });
    }
}

async function isDirectory(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err) {
                return reject(err);
            }

            return resolve(stats.isDirectory());
        });
    });
}
