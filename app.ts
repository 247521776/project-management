import { app, BrowserWindow, globalShortcut } from "electron";
import { MenuBuilder } from "./menu";
import { Shortcut } from "./shortcut";

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: "项目管理",
        webPreferences: {
            nodeIntegration: true
        }
        // titleBarStyle: "hidden"
    });

    mainWindow.loadURL(`file://${__dirname}/index.html`);

    mainWindow.on("closed", function() {
        mainWindow = null;
        app.quit();
    });
    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    const shortcut = new Shortcut(mainWindow);
    shortcut.register();
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
