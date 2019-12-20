import { Menu, BrowserWindow } from "electron";

export class MenuBuilder {
    browserWindow: BrowserWindow;
    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;
    }

    buildMenu() {
        this.browserWindow.webContents.on("context-menu", (e, props) => {
            const { x, y } = props;
        
            Menu.buildFromTemplate([
                {
                    label: "检查元素",
                    role: "toggleDevTools",
                    // icon: `${__dirname}/images/one-piece.png`,
                    accelerator: "Ctrl+Command+J",
                    click: () => {
                        this.browserWindow.webContents.inspectElement(x, y);
                    }
                }
            ]).popup({
                window: this.browserWindow,
                x,
                y
            });
        });
    }
}

