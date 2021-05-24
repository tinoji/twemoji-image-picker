'use strict';

const { app, Menu, BrowserWindow, ipcMain, nativeImage, clipboard, Notification } = require('electron');
const { download } = require('electron-dl');
const appName = require('./package.json').name;
const emoji = require('emoji.json');
const path = require('path');
const os = require('os');
const url = require('url');
const sharp = require('sharp');

const tmpDir = `${os.tmpdir()}/${appName}`;
const svgFilename = 'twemoji.svg';
const svgFilepath = tmpDir + '/' + svgFilename;
const svgSize = 36;
const defaultSvgDpi = 72;

let mainWindow;

function createWindow() {
    if (process.platform == 'darwin') {
        mainWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                worldSafeExecuteJavaScript: true,
                preload: path.join(__dirname, 'preload.js')
            },
            width: 302,
            height: 386,
            transparent: true,
            frame: false,
            icon: path.join(__dirname, 'icon/icon.icns')
        });
    } else {
        mainWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                worldSafeExecuteJavaScript: true,
                preload: path.join(__dirname, 'preload.js')
            },
            width: 300,
            height: 386,
        });
    }

    if (!app.isPackaged)
        mainWindow.webContents.openDevTools({ mode: 'detach' });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

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

ipcMain.handle('download', async (event, url, size) => {
    const win = BrowserWindow.getFocusedWindow();
    await download(win, url, {
        directory: tmpDir,
        filename: svgFilename
    });

    let img;
    if (process.platform === 'win32' || process.platform === 'win64') {
        // See: https://github.com/electron/electron/issues/17081
        img = nativeImage.createFromPath(svgFilepath);
    } else {
        // See: https://github.com/lovell/sharp/issues/729
        let density = parseInt(defaultSvgDpi * size / svgSize);
        if (density > 2400) density = 2400;

        const buffer = await sharp(svgFilepath, { density: density })
            .resize(size, size)
            .png()
            .toBuffer();

        img = nativeImage.createFromBuffer(buffer);
    }

    clipboard.writeImage(img);
    event.returnValue = 'pong';
});

ipcMain.handle('closeWindow', () => {
    mainWindow.close();
});

ipcMain.handle('filterEmoji', (_, regex) => {
    return emoji.filter((el) => el['codes'].match(/ /) == null) // exclude surrogate pair
                .filter((el) => el['name'].match(regex) != null);
});

ipcMain.handle('notifySuccess', (_, message) => {
    const notification = {
        title: appName,
        body: message,
        icon: './assets/check.png'
    };
    new Notification(notification).show();
});

ipcMain.handle('notifyError', (_, message) => {
    const notification = {
        title: appName,
        body: message,
        icon: './assets/warning.png'
    };
    new Notification(notification).show();
});
