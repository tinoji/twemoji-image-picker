'use strict';

const { app, Menu, BrowserWindow, ipcMain, nativeImage, clipboard } = require('electron');
const { download } = require('electron-dl');
const path = require('path');
const pnfs = require("pn/fs");
const os = require('os');
const url = require('url');
const svg2png = require("svg2png");

const tmpDir = os.tmpdir() + '/twemoji-image-picker';
const svgFilename = 'twemoji.svg';
const pngFilename = 'twemoji.png';
const svgFilepath = tmpDir + '/' + svgFilename;
const pngFilepath = tmpDir + '/' + pngFilename;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true },
        width: 302,
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

    // mainWindow.webContents.openDevTools();

    Menu.setApplicationMenu(null);

    mainWindow.on('closed', () => {
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

ipcMain.on('download', async (event, url, svgOptions) => {
    const win = BrowserWindow.getFocusedWindow();
    await download(win, url, {
        directory: tmpDir,
        filename: svgFilename
    });

    const file = await pnfs.readFile(svgFilepath);
    const outputBuffer = await svg2png(file, svgOptions);
    await pnfs.writeFile(pngFilepath, outputBuffer);

    const img = nativeImage.createFromPath(pngFilepath);
    clipboard.writeImage(img);

    event.returnValue = 'pong';
});
