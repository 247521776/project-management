import { ipcMain, BrowserWindow } from "electron";
import { spawn } from "child_process";
import { getProjectList, setProjectList } from "./utils";
import * as path from "path";

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

        this.browserWindow.webContents.send("data", getProjectList());
        this.browserWindow.webContents.send("loaded", "");
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
            this.browserWindow.webContents.send("data", getProjectList());
            this.browserWindow.webContents.send("loaded", "");
        });

    }
}
