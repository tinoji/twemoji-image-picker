"use strict";

import { App, app as application, BrowserWindow, clipboard, ipcMain, Menu, nativeImage } from "electron";
import { download } from "electron-dl";
import * as os from "os";
import * as path from "path";
import * as sharp from "sharp";

const tmpDir = os.tmpdir() + "/twemoji-image-picker";
const svgFilename = "twemoji.svg";
const svgFilepath = tmpDir + "/" + svgFilename;
const svgSize: number = 36;
const defaultSvgDpi: number = 72;

class MyApp {
    private mainWindow: BrowserWindow | null = null;
    private app: App;
    private mainURL: string = `file://${__dirname}/index.html`;

    constructor(app: App) {
        this.app = app;
        this.app.on("window-all-closed", this.onWindowAllClosed.bind(this));
        this.app.on("ready", this.create.bind(this));
        this.app.on("activate", this.onActivated.bind(this));
    }

    private create() {
        if (process.platform === "darwin") {
            this.mainWindow = new BrowserWindow({
                // width: 302,
                // height: 386,
                width: 900,
                height: 900,
                webPreferences: { nodeIntegration: true },
                transparent: true,
                frame: false,
                icon: path.join(__dirname, "icons/icon.icns"),
            });
        } else {
            this.mainWindow = new BrowserWindow({
                width: 300,
                height: 386,
                webPreferences: { nodeIntegration: true },
            });
        }

        this.mainWindow.loadURL(this.mainURL);

        this.mainWindow.webContents.openDevTools();

        Menu.setApplicationMenu(null);

        this.mainWindow.on("closed", () => {
            this.mainWindow = null;
        });
    }

    private onReady() {
        this.create();
    }

    private onActivated() {
        if (this.mainWindow === null) {
            this.create();
        }
    }

    private onWindowAllClosed() {
        if (process.platform !== "darwin") {
            this.app.quit();
        }
    }
}

ipcMain.on("download", async (event: Event, url: string, size: number) => {
    const win = BrowserWindow.getFocusedWindow() as BrowserWindow;
    await download(win, url, {
        directory: tmpDir,
        filename: svgFilename,
    });

    let img;
    if (process.platform === "win32") {
        // See: https://github.com/electron/electron/issues/17081
        img = nativeImage.createFromPath(svgFilepath);
    } else {
        // See: https://github.com/lovell/sharp/issues/729
        let density = defaultSvgDpi * size / svgSize;
        if (density > 2400) { density = 2400; }

        const buffer = await sharp(svgFilepath, { density })
            .resize(size, size)
            .png()
            .toBuffer();

        img = nativeImage.createFromBuffer(buffer);
    }

    clipboard.writeImage(img);
    event.returnValue = true;
});

const AppInstance: MyApp = new MyApp(application);
