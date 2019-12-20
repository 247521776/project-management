import { BrowserWindow, app, globalShortcut } from "electron";

export class Shortcut {
    public browserWindow: BrowserWindow;
    public openDevTools: boolean = false;

    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;
    }

    register() {
        this.registerDevTools();
    }

    registerDevTools() {
        const ret = globalShortcut.register("Ctrl+Command+J", () => {
            if (this.openDevTools) {
                this.browserWindow.webContents.closeDevTools();
            }
            else {
                this.browserWindow.webContents.openDevTools();
            }

            this.openDevTools = !this.openDevTools;
        });

        if (!ret) {
            console.log("registration failed");
        }
    }
}
