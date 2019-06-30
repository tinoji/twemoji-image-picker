"use strict";
const { app, Menu, BrowserWindow, ipcMain, nativeImage, clipboard } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const fs = require('fs');
const url = require('url');

// TODO: fix 
const tmpDir = "/tmp/twemoji";
const tmpFilename = "tmp.png";
const tmpFilepath = tmpDir + "/" + tmpFilename;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
        width: 800,
        height: 600,
        transparent: true,
        frame: false
    });

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