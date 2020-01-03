import { Menu, BrowserWindow } from "electron";
import createSettingWindow from "./views/setting";

const env = process.env.NODE_ENV;

export class MenuBuilder {
    browserWindow: BrowserWindow;
    constructor(browserWindow: BrowserWindow) {
        this.browserWindow = browserWindow;

        const applicationMenu = Menu.getApplicationMenu();
        const newApplicationMenu = new Menu();
        newApplicationMenu.append(applicationMenu.items[0]);
        newApplicationMenu.append(applicationMenu.items[1]);
        newApplicationMenu.append(applicationMenu.items[2]);

        Menu.setApplicationMenu(newApplicationMenu);
    }

    buildMenu() {
        this.browserWindow.webContents.on("context-menu", (e, props) => {
            const { x, y } = props;
            const menuList = [];

            if (env === "dev") {
                menuList.push({
                    label: "检查元素",
                    role: "toggleDevTools",
                    // icon: `${__dirname}/images/one-piece.png`,
                    accelerator: "Ctrl+Command+J",
                    click: () => {
                        this.browserWindow.webContents.inspectElement(x, y);
                    }
                });
            }

            menuList.push({
                label: "设置",
                // icon: `${__dirname}/images/one-piece.png`,
                accelerator: "Command+,",
                click: () => {
                    createSettingWindow();
                }
            });

            Menu.buildFromTemplate(menuList).popup({
                window: this.browserWindow,
                x,
                y
            });
        });
    }
}
