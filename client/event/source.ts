import { BrowserWindow, ipcMain } from "electron";
import * as utils from "../utils";

export default class SourceEvent {
    browserWindow: BrowserWindow;
    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;
    }

    build() {
        ipcMain.on("addSource", async (event, source) => {
            const sources = utils.getSources();
            const result: any = {};


            for (const _source of sources) {
                if (_source.source === source.source) {
                    result.errorMessage = "依赖源已添加";

                    event.returnValue = result;
                    return;
                }
            }

            source.isDefault = false;
            const newData = utils.addSource(source);

            this.browserWindow.webContents.send("source", utils.getSources());

            result.data = newData;
            event.returnValue = result;
        });

        ipcMain.on("getSource", event => {
            event.returnValue = utils.getSources();
        });

        ipcMain.on("deleteSource", (event, id) => {
            utils.deleteSource(id);
            this.browserWindow.webContents.send("source", utils.getSources());
        });

        ipcMain.on("editSource", (event, data) => {
            utils.editSource(data);
        });
    }
}
