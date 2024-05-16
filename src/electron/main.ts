import { sleep } from '../core/utils/files';
import { BrowserWindow, app, ipcMain, Tray, Menu } from 'electron'
import ipc from '../core/utils/ipc';
const path = require('path')
const fsExt = require('fs-extra');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let win: BrowserWindow | null;
let loginWin: BrowserWindow | null;
let tray: Tray | null = null;

let yaml = '';
let appName = 'wot-box-updater'
yaml += "provider: generic\n"
yaml += "url: https://wtaufpziv.github.io/static-test\n"
yaml += "updaterCacheDirName: " + appName

let update_file = [path.join(process.resourcesPath, 'app-update.yml'), yaml]
let dev_update_file = [path.join(process.resourcesPath, 'dev-app-update.yml'), yaml]
let chechFiles = [update_file, dev_update_file]

for (let file of chechFiles) {
    if (!fs.existsSync(file[0])) {
        fs.writeFileSync(file[0], file[1], () => { })
    }
}


Object.defineProperty(app, 'isPackaged', {
    get() {
        return true;
    }
});

// 将日志在渲染进程里面打印出来
function printUpdaterMessage(arg: any, ext = '') {
    const message: any = {
        upgradeError: "更新出错",
        checking: "正在检查更新",
        updateAvailable: "检测到新版本 ",
        downloadProgress: "下载中",
        updateNotAvailable: "当前已是最新版本",
        downloaded: '下载完成'
    };
    win && win.webContents.send("printUpdaterMessage", `${message[arg]??arg}${ext}`);
    loginWin && loginWin.webContents.send("printUpdaterMessage", `${message[arg]??arg} ${ext}`);
}

autoUpdater.setFeedURL("https://wtaufpziv.github.io/static-test")

// 是否自动更新，如果为true，当可以更新时(update-available)自动执行更新下载。
autoUpdater.autoDownload = false

autoUpdater.on("error", function () {
    printUpdaterMessage('upgradeError');
    win && win.webContents.send("upgradeError");
    loginWin && loginWin.webContents.send("upgradeError");
});

// 2. 开始检查是否有更新
autoUpdater.on("checking-for-update", function () {
    printUpdaterMessage('checking');
});

// 3. 有更新时触发
autoUpdater.on("update-available", function (info: any) {
    printUpdaterMessage('updateAvailable', ` V${info.version}`);
    // 4. 告诉渲染进程有更新，info包含新版本信息
    win && win.webContents.send("updateAvailable", info.version);
    loginWin && loginWin.webContents.send("updateAvailable", info.version);
});

// 5. 没有新版本时通知
autoUpdater.on("update-not-available", function () {
    printUpdaterMessage('updateNotAvailable');
    win && win.webContents.send("updateNotAvailable");
    loginWin && loginWin.webContents.send("updateNotAvailable");
});

// 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
// ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-updater\pending下的缓存文件将其删除（这是我本地的路径）
autoUpdater.on("download-progress", function (progressObj: any) {
    printUpdaterMessage('downloadProgress');
    win && win.webContents.send("updatadownloadProgress", progressObj);
    loginWin && loginWin.webContents.send("updatadownloadProgress", progressObj);
});

// 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
autoUpdater.on("update-downloaded", function () {
    printUpdaterMessage('downloaded');
  }
);

function createTray() {
    tray = new Tray(process.env.VITE_DEV_SERVER_URL ? path.join(__dirname, '../../public/1.jpg') : path.join(__dirname, '../dist/1.jpg'));
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
    const sourcePathOf7Z = process.env.VITE_DEV_SERVER_URL ? path.join(__dirname, '../../public/7z.exe') : path.join(__dirname, '../dist/7z.exe');
    const targetPathOf7Z = path.join(app.getPath('userData'), '7z.exe');
    fsExt.copyFile(sourcePathOf7Z, targetPathOf7Z, (err: any) => {
        if (err) {
            console.error('Error copying 7z.exe:', err);
        } else {
            console.log('7z.exe copied successfully.');
        }
    });
    // 拷贝vbs目录——vbs来源：regedit组件，这是这个组件的bug，在electron打包后执行包里面的vbs会报错，需要把vbs提取出来到压缩包外
    // 这里提取到userData目录
    const sourcePathOfVbs = path.join(__dirname, '../vbs')
    const targetPathOfVbs = path.join(app.getPath('userData'), 'vbs');
    fsExt.copy(sourcePathOfVbs, targetPathOfVbs, (err: any) => {
        if (err) {
            console.error('Error copying vbs:', err);
        } else {
            console.log('vbs copied successfully.');
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
                loginWin = null
                break;
            case 'close':
                loginWin!.close();
                break;
        }
    });
    ipcMain.on('updater', async (event, command) => {
        // 用一下这个参数
        JSON.stringify(event)
        switch (command) {
            // 1. 在渲染进程里触发获取更新，开始进行更新流程。 (根据具体需求)
            case 'check-for-updates':
                autoUpdater.checkForUpdates();
                break;
            // 7. 收到确认更新提示，执行下载
            case 'comfirm-update':
                autoUpdater.downloadUpdate();
                break;
            case 'update-now':
                 // 12. 立即更新安装
                 autoUpdater.quitAndInstall();
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
                win = null;
                break;
        }
    });
    ipcMain.on('updater', async (event, command) => {
        // 用一下这个参数
        JSON.stringify(event)
        switch (command) {
            // 1. 在渲染进程里触发获取更新，开始进行更新流程。 (根据具体需求)
            case 'check-for-updates':
                autoUpdater.checkForUpdates();
                break;
            // 7. 收到确认更新提示，执行下载
            case 'comfirm-update':
                autoUpdater.downloadUpdate();
                break;
            case 'update-now':
                 // 12. 立即更新安装
                 autoUpdater.quitAndInstall();
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
    // 防止重复打开程序
    const gotTheLock = app.requestSingleInstanceLock();

    if (!gotTheLock) {
        app.quit();
    } else {
        app.on('second-instance', () => {
            if (win) {
                if (win.isMinimized()) win.restore();
                if (win.isHiddenInMissionControl()) win.show();
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
//   // 加载构建后的Vue应用，并指定路由
//   const appPath = `file://${path.join(__dirname, '../dist/index.html#/your-route-path')}`;
//   modal.loadURL(appPath);
// }