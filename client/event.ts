import { ipcMain } from "electron";
import { spawn } from "child_process"
import * as path from "path";

export class Event {
    data: any;
    constructor(data: any) {
        this.data = data;
    }

    build() {
        ipcMain.on("openProject", (event, index) => {
            this.openProject(index);
        });
    }

    openProject(index) {
        const dir = this.data.dir;
        const project = this.data.projects[index];
        spawn(
            `code ${path.resolve(dir, project.name)}`,
            {
                shell: true
            }
        );
    }
}
