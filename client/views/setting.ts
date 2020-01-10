import { BrowserWindow } from "electron";
import { MenuBuilder } from "../menu";
import * as path from "path";

const env = process.env.NODE_ENV;

const loadURL = `file://${path.resolve(
    __dirname,
    "../../"
)}/build/index.html#/settingPage`;

function createSettingWindow() {
    let mainWindow = new BrowserWindow({
        width: 500,
        height: 600,
        resizable: false,
        minimizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: "hidden"
    });

    mainWindow.loadURL(loadURL);

    mainWindow.on("closed", function() {
        mainWindow = null;
    });

    if (env === "dev") {
        const menuBuilder = new MenuBuilder(mainWindow);
        menuBuilder.buildMenu();
    }
}

export default createSettingWindow;
