import { app, BrowserWindow, globalShortcut } from "electron";
import { MenuBuilder } from "./menu";
import { Shortcut } from "./shortcut";
import { Event } from "./event";
import * as path from "path";
import { getProjectList, setProjectList } from "./utils";

const loadURL = `file://${path.resolve(__dirname, "../")}/build/index.html`;

let mainWindow: BrowserWindow | null;

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

    mainWindow.loadURL(loadURL);

    const data = getProjectList();

    mainWindow.on("closed", function() {
        mainWindow = null;
        app.quit();
        setProjectList(data.projects);
    });
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();


    const event = new Event(mainWindow, data);
    event.build();

    const shortcut = new Shortcut(mainWindow);
    shortcut.register();

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
