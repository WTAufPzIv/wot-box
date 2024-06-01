import { copyStaticFile, sleep } from '../core/utils/files';
import { BrowserWindow, app, ipcMain, Tray } from 'electron'
import ipc from '../core/utils/ipc';
import loginIpc from '../core/utils/login-ipc';
import { createServer } from '../core/utils/server';
import { createTray } from '../core/utils/tray';
const path = require('path')

let win: BrowserWindow | null;
let loginWin: BrowserWindow | null;
let tray: Tray | null = null;

Object.defineProperty(app, 'isPackaged', {
    get() {
        return true;
    }
});

const createLoginWindow = () => {
    loginWin = new BrowserWindow({
        autoHideMenuBar: true,
        frame: false,
        resizable: false,
        minWidth: 800,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), //预加载
        },
    })
    process.env.VITE_DEV_SERVER_URL && loginWin.loadURL('http://localhost:3000/#/login') || loginWin.loadURL('file://' + path.join(__dirname, '../dist/index.html') + '#/login');
    loginWin.on('closed', () => {
        loginWin = null;
    });
    loginIpc(loginWin);
    copyStaticFile();
    ipcMain.on('login-window-control', async (event, command) => {
        // 用一下这个参数
        JSON.stringify(event)
        switch (command) {
            case 'login-successful':
                if (loginWin) {
                    loginWin.removeAllListeners();
                    ipcMain.removeAllListeners();
                    await sleep(100)
                    loginWin.close();
                }
                createWindow();
                tray = createTray(win!);
                loginWin = null
                break;
            case 'close':
                loginWin!.close();
                break;
        }
    });
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
        loginWin.webContents.openDevTools();
    }
}

const createWindow = () => {
    win = new BrowserWindow({
        autoHideMenuBar: true,
        frame: false,
        minWidth: 1280,
        minHeight: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'), //预加载
        },
    })
    process.env.VITE_DEV_SERVER_URL && win.loadURL('http://localhost:3000') || win.loadURL('file://' + path.join(__dirname, '../dist/index.html'));
    ipc(win);
    win.on('closed', () => {
        win = null;
    });
    ipcMain.on('login-window-control', async (event, command) => {
        // 用一下这个参数
        JSON.stringify(event)
        switch (command) {
            case 'login-out':
                if (win) {
                    win.removeAllListeners();
                    ipcMain.removeAllListeners();
                    tray && tray.destroy();
                    win.close();
                }
                createLoginWindow();
                win = null;
                break;
        }
    });
    createServer();
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(async () => {
    createLoginWindow();
    // 防止重复打开程序
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', () => {
            if (win) {
                if (win.isMinimized()) win.restore();
                win.show();
                win.focus();
            }
            if (loginWin) {
                loginWin.focus();
            }
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});