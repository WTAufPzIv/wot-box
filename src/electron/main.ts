import { sleep } from '../core/utils/files';
import { BrowserWindow, app, ipcMain, Tray, Menu } from 'electron'
import ipc from '../core/utils/ipc';
const path = require('path')

let win: BrowserWindow | null;
let loginWin: BrowserWindow | null;
let tray: Tray | null = null;

function createTray() {
    tray = new Tray(path.join(__dirname, '../public/1.jpg'));
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
            preload: path.join(__dirname, '../src/render/electron-preload.js'), //预加载
        },
    })
    process.env.VITE_DEV_SERVER_URL && loginWin.loadURL('http://localhost:3000/#/login') || loginWin.loadFile('dist/index.html')
    loginWin.on('closed', () => {
        loginWin = null;
    });
    ipc(loginWin);
    ipcMain.on('login-window-control', async (event, command) => {
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
            preload: path.join(__dirname, '../src/render/electron-preload.js'), //预加载
        },
    })
    process.env.VITE_DEV_SERVER_URL && win.loadURL('http://localhost:3000') || win.loadFile('dist/index.html')
    ipc(win);
    ipcMain.on('login-window-control', async (event, command) => {
        switch (command) {
            case 'login-out':
                if (win) {
                    win.removeAllListeners();
                    ipcMain.removeAllListeners();
                    // await sleep(100)
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