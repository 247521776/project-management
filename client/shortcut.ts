import { BrowserWindow, globalShortcut } from "electron";
import createSettingWindow from "./views/setting";

export class Shortcut {
    public browserWindow: BrowserWindow;
    public openDevTools: boolean = false;

    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;
    }

    register() {
        this.registerDevTools();
        this.registerSetting();
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

    registerSetting() {
        const ret = globalShortcut.register("Ctrl+,", () => {
            createSettingWindow();
        });

        if (!ret) {
            console.log("registration failed");
        }
    }
}
