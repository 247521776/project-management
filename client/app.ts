import { app, BrowserWindow, globalShortcut } from "electron";
import { MenuBuilder } from "./menu";
import { Shortcut } from "./shortcut";
import { Event } from "./event";
import * as data from "./data.json";
import * as path from "path";

let mainWindow: BrowserWindow | null;

interface IProject {
    name: string;
    description: string;
    version: string;
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 310,
        height: 600,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: "项目管理",
        webPreferences: {
            nodeIntegration: true
        },
        titleBarStyle: "hidden"
    });

    mainWindow.loadURL(
        `file://${path.resolve(__dirname, "../")}/build/index.html`
    );

    mainWindow.on("closed", function() {
        mainWindow = null;
        app.quit();
    });
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    const event = new Event(data);
    event.build();

    const shortcut = new Shortcut(mainWindow);
    shortcut.register();

    const projects = data.projects;
    const dir = data.dir;

    for (const project of projects) {
        const packagePath = path.resolve(dir, project.name, "package.json");
        const packageJson = require(packagePath);
        (project as IProject).description = packageJson.description;
        (project as IProject).version = packageJson.version;
    }

    mainWindow.webContents.on("did-finish-load", function() {
        mainWindow.webContents.send("data", data);
    });
}

app.on("ready", createWindow);

app.on("window-all-closed", function() {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", function() {
    if (mainWindow === null) createWindow();
});

app.on("will-quit", () => {
    // 注销所有快捷键
    globalShortcut.unregisterAll();
});
