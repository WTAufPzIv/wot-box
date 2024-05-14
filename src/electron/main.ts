import { sleep } from '../core/utils/files';
import { BrowserWindow, app, ipcMain, Tray, Menu } from 'electron'
import ipc from '../core/utils/ipc';
const path = require('path')
const fsExt = require('fs-extra');

let win: BrowserWindow | null;
let loginWin: BrowserWindow | null;
let tray: Tray | null = null;

function createTray() {
    tray = new Tray(process.env.VITE_DEV_SERVER_URL ? path.join(__dirname, '../public/1.jpg') : path.join(__dirname, '../dist/1.jpg'));
    const contextMenu = Menu.buildFromTemplate([
        { label: '退出', type: 'normal', click: async () => {
            win?.webContents.send('app-quit');
            // await sleep(2000);
            app.quit();
        }}
    ]);
    tray.setToolTip('大德盒子');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        win!.show();
    });
}

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
    const sourcePath = process.env.VITE_DEV_SERVER_URL ? path.join(__dirname, '../public/7z.exe') : path.join(__dirname, '../dist/7z.exe');
    const targetPath = path.join(app.getPath('userData'), '7z.exe');
    fsExt.copyFile(sourcePath, targetPath, (err: any) => {
        if (err) {
            console.error('Error copying 7z.exe:', err);
        } else {
            console.log('7z.exe copied successfully.');
        }
    });
    loginWin.on('closed', () => {
        loginWin = null;
    });
    ipc(loginWin);
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
                createTray();
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
                break;
        }
    });
    win.on('closed', () => {
        win = null;
    });
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(async () => {
    createLoginWindow();
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
//   // 加载构建后的Vue应用，并指定路由
//   const appPath = `file://${path.join(__dirname, '../dist/index.html#/your-route-path')}`;
//   modal.loadURL(appPath);
// }