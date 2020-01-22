import { ipcMain, BrowserWindow } from "electron";
import { spawn } from "child_process";
import * as utils from "./utils";
import * as path from "path";
import WorkspaceEvent from "./event/workspace";
import SourceEvent from "./event/source";

export class Event {
    data: any;
    browserWindow: BrowserWindow;
    workspace: WorkspaceEvent;
    source: SourceEvent;
    constructor(browserWindow: BrowserWindow, data: any) {
        this.browserWindow = browserWindow;
        this.data = data;
        this.workspace = new WorkspaceEvent(browserWindow);
        this.source = new SourceEvent(browserWindow);
    }

    build() {
        ipcMain.on("openProject", (event, index) => {
            this.openProject(index);
        });

        ipcMain.on("deleteProject", (event, index) => {
            this.deleteProject(index);
        });

        ipcMain.on("addProject", (event, data) => {
            const { projectDir, type, projectPath, gitPath, sourceId } = data;
            if (type === "add") {
                this.addProject(projectDir, sourceId);
            } else if (type === "new") {
                this.newAddProject(projectPath, gitPath, sourceId);
            }
        });

        ipcMain.on("getSetting", event => {
            event.returnValue = utils.getSettings();
        });

        ipcMain.on("editProject", (event, project) => {
            utils.editProject(project);
        });

        this.workspace.build();
        this.source.build();
    }

    openProject(index) {
        const project = this.data.projects[index];
        spawn(`code -n ${project.dir}`, {
            shell: true
        });
    }

    deleteProject(index) {
        const project = this.data.projects.splice(index, 1)[0];

        utils.setProjectList(this.data.projects);

        spawn(`rm -rf ${project.dir}`, {
            shell: true
        });
    }

    addProject(projectDir, sourceId) {
        this.data.projects.unshift({
            dir: projectDir,
            sourceId
        });

        utils.setProjectList(this.data.projects);

        this.browserWindow.webContents.send("loaded", utils.getProjectList());
    }

    newAddProject(projectPath, gitPath, sourceId) {
        const splitResult = gitPath.split("/");
        const projectName = splitResult[splitResult.length - 1].split(".")[0];
        this.data.projects.unshift({
            dir: path.resolve(projectPath, projectName),
            sourceId
        });

        utils.setProjectList(this.data.projects);

        const result = spawn(
            `mkdir -p ${projectPath} && cd ${projectPath} && git clone ${gitPath}`,
            {
                shell: true
            }
        );

        result.on("close", () => {
            this.browserWindow.webContents.send("loaded", utils.getProjectList());
        });
    }
}
