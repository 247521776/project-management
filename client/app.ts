import { app, BrowserWindow, globalShortcut } from "electron";
import { MenuBuilder } from "./menu";
import { Shortcut } from "./shortcut";
import { Event } from "./event";
import * as path from "path";
import { getProjectList, setProjectList, addSource, getSources } from './utils';

const loadURL = `file://${path.resolve(__dirname, "../")}/build/index.html#/homePage`;

let mainWindow: BrowserWindow | null;

init();

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
        // titleBarStyle: "hidden"
        frame: false
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

function init() {
    const sources = getSources();
    const defaultSource = [
        {
            sourceName: "npm",
            source: "https://registry.npmjs.org/",
            isDefault: true,
        },
        {
            sourceName: "taobao",
            source: "https://registry.npm.taobao.org/",
            isDefault: true,
        },
    ];

    for (const source of sources) {
        for (const def of defaultSource) {
            if (source.source === def.source) {
                return;
            }
        }
    }

    for (const def of defaultSource) {
        addSource(def);
    }
}
