import { BrowserWindow, ipcMain } from "electron";
import * as fs from "fs";
import * as utils from "../utils";
import { spawn, spawnSync } from "child_process";
import * as path from "path";

let downloadShell;
const shellOption = {
    shell: true
};

export default class WorkspaceEvent {
    browserWindow: BrowserWindow;
    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;
    }

    build() {
        ipcMain.on("addWorkspace", async (event, workspace) => {
            const { dirPath } = workspace;
            const isExistDir = fs.existsSync(dirPath);
            const result: any = {};

            if (!isExistDir) {
                result.errorMessage = "目录不存在";

                event.returnValue = result;
                return;
            }

            const isDir = await isDirectory(dirPath);

            if (!isDir) {
                result.errorMessage = "该目录路径不为文件夹";

                event.returnValue = result;
                return;
            }

            const workspaces = utils.getWorkspaces();

            for (const workspace of workspaces) {
                if (workspace.dirPath === dirPath) {
                    result.errorMessage = "目录已添加";

                    event.returnValue = result;
                    return;
                }
            }

            const newData = utils.addWorkspace(workspace);

            this.browserWindow.webContents.send("workspace", utils.getWorkspaces());
            result.data = newData;

            event.returnValue = result;
        });

        ipcMain.on("getWorkspace", event => {
            event.returnValue = utils.getWorkspaces();
        });

        ipcMain.on("deleteWorkspace", (event, id) => {
            utils.deleteWorkspace(id);
            this.browserWindow.webContents.send("workspace", utils.getWorkspaces());
        });

        ipcMain.on("editWorkspace", (event, data) => {
            utils.editWorkspace(data);
        });

        ipcMain.on("downloadDepend", (event, dirPath) => {
            const projects = utils.getProjects();
            let project;

            for (const pro of projects) {
                if (pro.dir === dirPath) {
                    project = pro;

                    break;
                }
            }

            const sources = utils.getSources();
            let source;

            for (const item of sources) {
                if (item.id === project.sourceId) {
                    source = item;

                    break;
                }
            }

            const findFind = spawnSync(`cd ${dirPath} && ls -a`, shellOption);
            if (findFind.error) {
                this.browserWindow.webContents.send("downloadDepend-error", findFind.error);
                return;
            }

            const existNpmrcFile = findFind.stdout.toString().includes(".npmrc");
            if (existNpmrcFile) {
                spawnSync(`cd ${dirPath} && mv .npmrc .npmrc1`, shellOption);
            }

            const findRegistry = spawnSync("npm config get registry", shellOption);
            if (findRegistry.error) {
                this.browserWindow.webContents.send("downloadDepend-error", findRegistry.error);
                return;
            }

            const registry = findRegistry.stdout.toString();
            const needSetNpmRegistry = registry !== source.source;

            if (needSetNpmRegistry) {
                const setNpmRegistry = spawnSync(`npm config set registry ${source.source}`, shellOption);
                if (setNpmRegistry.error) {
                    this.browserWindow.webContents.send("downloadDepend-error", setNpmRegistry.error);
                    return;
                }
            }

            this.browserWindow.webContents.send("downloadDepend-setting");

            this.browserWindow.webContents.send("downloadDepend");

            downloadShell = spawn(`cd ${dirPath} && npm install`, shellOption);

            downloadShell.on("close", code => {
                if(code === null) {
                    downloadShell = null;
                    return;
                }

                if (code === 0) {
                    this.browserWindow.webContents.send("downloadDepend-done");
                } else {
                    this.browserWindow.webContents.send("downloadDepend-error");
                }

                if (existNpmrcFile) {
                    spawnSync(`cd ${dirPath} && mv .npmrc1 .npmrc`, shellOption);
                }

                if (needSetNpmRegistry) {
                    spawnSync(`npm config set registry ${registry}`, shellOption);
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
            const projects = utils.getProjects();
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
