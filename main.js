'use strict';
const { app, Menu, BrowserWindow, ipcMain, nativeImage, clipboard } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const fs = require('fs');
const os = require('os');
const url = require('url');

const tmpDir = os.tmpdir() + '/twemoji'; // FIXME
const tmpFilename = 'tmp.png';
const tmpFilepath = tmpDir + '/' + tmpFilename;

global.shared = {tmpFilepath: tmpFilepath};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
        // width: 1000,
        // height: 800,

        width: 316,
        height: 380,
        // titleBarStyle: 'hidden-inset' // Mac only?
        transparent: true,
        frame: false
    });

    // mainWindow.webContents.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

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
    event.returnValue = 'pong';
});

ipcMain.on('copy', () => {
    let img = nativeImage.createFromPath(tmpFilepath);
    clipboard.writeImage(img);
});

ipcMain.on('ondragstart', (event) => {
    event.sender.startDrag({
        file: tmpFilepath,
        icon: tmpFilepath
    });
});