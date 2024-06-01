import { BrowserWindow, ipcMain } from "electron";
const { autoUpdater } = require('electron-updater');
const fs = require('fs');
const path = require('path')

export function startListenUpdata(mainWindow: BrowserWindow) {
    let yaml = '';
    let appName = 'wot-box-updater'
    yaml += "provider: generic\n"
    yaml += "url: https://vip.123pan.cn/1815268517/wot-box-upgrade\n"
    yaml += "updaterCacheDirName: " + appName
    let update_file = [path.join(process.resourcesPath, 'app-update.yml'), yaml]
    let dev_update_file = [path.join(process.resourcesPath, 'dev-app-update.yml'), yaml]
    let chechFiles = [update_file, dev_update_file]

    for (let file of chechFiles) {
        if (!fs.existsSync(file[0])) {
            fs.writeFileSync(file[0], file[1], () => { })
        }
    }
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
        mainWindow && mainWindow.webContents.send("printUpdaterMessage", `${message[arg]??arg}${ext}`);
    }
    autoUpdater.setFeedURL("https://vip.123pan.cn/1815268517/wot-box-upgrade")

    // 是否自动更新，如果为true，当可以更新时(update-available)自动执行更新下载。
    autoUpdater.autoDownload = false

    autoUpdater.on("error", function () {
        printUpdaterMessage('upgradeError');
        mainWindow && mainWindow.webContents.send("upgradeError");
    });

    // 2. 开始检查是否有更新
    autoUpdater.on("checking-for-update", function () {
        printUpdaterMessage('checking');
    });

    // 3. 有更新时触发
    autoUpdater.on("update-available", function (info: any) {
        printUpdaterMessage('updateAvailable', ` V${info.version}`);
        // 4. 告诉渲染进程有更新，info包含新版本信息
        mainWindow && mainWindow.webContents.send("updateAvailable", info.version);
    });

    // 5. 没有新版本时通知
    autoUpdater.on("update-not-available", function () {
        printUpdaterMessage('updateNotAvailable');
        mainWindow && mainWindow.webContents.send("updateNotAvailable");
    });

    // 8. 下载进度，包含进度百分比、下载速度、已下载字节、总字节等
    // ps: 调试时，想重复更新，会因为缓存导致该事件不执行，下载直接完成，可找到C:\Users\40551\AppData\Local\xxx-updater\pending下的缓存文件将其删除（这是我本地的路径）
    autoUpdater.on("download-progress", function (progressObj: any) {
        printUpdaterMessage('downloadProgress');
        mainWindow && mainWindow.webContents.send("updatadownloadProgress", progressObj);
    });

    // 10. 下载完成，告诉渲染进程，是否立即执行更新安装操作
    autoUpdater.on("update-downloaded", function () {
        printUpdaterMessage('downloaded');
    });
    return ipcMain.on('updater', async (event, command) => {
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
}