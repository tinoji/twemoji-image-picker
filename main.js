'use strict';

const { app, Menu, BrowserWindow, ipcMain, nativeImage, clipboard } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const fs = require('fs');
const pnfs = require("pn/fs");
const os = require('os');
const url = require('url');
const svg2png = require("svg2png");

const tmpDir = os.tmpdir() + '/twemoji-image-picker';
const tmpFilename = 'tmp.svg'; // FIXME
const tmpFilepath = tmpDir + '/' + tmpFilename;
// TODO: png path
global.shared = { tmpFilepath: tmpFilepath, tmpDir: tmpDir };

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
        width: 316,
        height: 386,

        // width: 900,
        // height: 900,

        transparent: true,
        frame: false,
        icon: path.join(__dirname, 'icon/icon.icns')
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // dev
    // mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
        if (fs.existsSync(tmpFilepath)) {
            fs.unlink(tmpFilepath, () => { /* nothin to do */ });
        }
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('download', async (event, url) => {
    const win = BrowserWindow.getFocusedWindow();
    await download(win, url, {
        directory: tmpDir,
        filename: tmpFilename
    });

    const file = await pnfs.readFile(tmpFilepath);
    const outputBuffer = await svg2png(file, { width: 300, height: 300 }); // TODO: size
    await pnfs.writeFile(tmpDir + '/dest.png', outputBuffer);

    const img = nativeImage.createFromPath(tmpDir + '/dest.png');
    clipboard.writeImage(img);

    event.returnValue = 'pong';
});
