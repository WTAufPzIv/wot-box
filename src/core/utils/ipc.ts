import { ipcMain, BrowserWindow, dialog, shell } from 'electron'
import { IipcMessage } from '../const/type';
import { readAndParseXML } from './files';
import { app } from 'electron'
const path = require('path')
const fs = require('fs');
const axios = require('axios');
const fsExt = require('fs-extra');

// 程序app data相关路径
export const STORE_PATH = path.join(app.getPath('userData'), 'store.json');

function createSuccessIpcMessage(payload: any): IipcMessage {
  return {
    status: 1,
    payload,
    message: '',
  }
}

function createFailIpcMessage(message: string): IipcMessage {
  return {
    status: 0,
    payload: null,
    message,
  }
}

function createModalWindow(mainWindow: BrowserWindow) {
  let modal = new BrowserWindow({
      parent: mainWindow, // 设置父窗口
      modal: true, // 设置为模态窗口
      show: true, // 初始时不显示窗口
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // 根据需要调整这些选项
      },
      autoHideMenuBar: true,
      width: 1500,
      height: 1000,
      minWidth: 1500,
      minHeight: 1000,
  });

  modal.loadURL('http://localhost:3000/#/editor'); // 加载子窗口内容
  modal.once('ready-to-show', () => {
      modal.show(); // 当页面加载完成后显示窗口
  });
}

export default (mainWindow: BrowserWindow) => {
    // 窗口控制监听
  ipcMain.on('window-control', (event, command) => {
    switch (command) {
      case 'minimize':
        mainWindow.minimize();
        break;
      case 'maximize-restore':
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case 'close':
        mainWindow.close();
        // event.preventDefault();
        // mainWindow.hide();
        break;
      case 'open-editor':
        createModalWindow(mainWindow)
    }
  });
  // 弹窗调用监听
  ipcMain.on('dialog', (event, command, args) => {
    switch (command) {
      case 'open-directory-dialog':
        dialog.showOpenDialog(mainWindow, {
          properties: ['openDirectory']
        }).then(result => {
          if (!result.canceled && result.filePaths.length > 0) {
            // 发送所选文件夹的路径回渲染进程
            event.sender.send('selected-directory', createSuccessIpcMessage(result.filePaths[0]));
          }
          event.sender.send('selected-directory', createSuccessIpcMessage(''));
        }).catch(err => {
          event.sender.send('selected-directory', createFailIpcMessage(err));
        });
        break;
      case 'show-error-dialog':
        const { title, message } = args;
        dialog.showErrorBox(title, message);
        break;
    }
  })
  // 文件读取监听
  ipcMain.on('file', async (event, command, args) => {
    switch (command) {
      case 'read-version-xml':
        try {
          const { path: wotpath } = args;
          const filePath = path.join(wotpath, 'version.xml');
          const xmlObject = await readAndParseXML(filePath);
          event.sender.send('send-version-xml', createSuccessIpcMessage(JSON.stringify(xmlObject)));
          return;
        } catch (error) {
          console.error('读取或解析XML文件时出错:', error);
          event.sender.send('send-version-xml', createFailIpcMessage('读取或解析XML文件时出错'));
          return null; // 或者根据需要返回错误信息
        }
      case 'get-file-list':
        try {
          const { path: wotpath } = args;
          const files = fs.readdirSync(wotpath);
          event.sender.send('send-file-list', createSuccessIpcMessage(files));
          return
        } catch (error) {
          console.error('读取文件列表时出错:', error);
          event.sender.send('send-file-list', createFailIpcMessage('读取文件列表时出错'));
          return
        }
      case 'open-folder':
        try {
          const { path: wotpath } = args;
          await shell.openPath(wotpath);
          return;
        } catch {
          return;
        }
      case 'get-installed-mods':
        try {
          const { path: wotModsPath } = args;
          const result = [];
          const versions = fs.readdirSync(wotModsPath).filter((folder: any) => folder.startsWith('1.'));

          for (const version of versions) {
            const versionPath = path.join(wotModsPath, version);
            const files = fs.readdirSync(versionPath);

            for (const file of files) {
              if (file.startsWith('[大德]') && file.endsWith('.wotmod')) {
                result.push({
                  fullName: file,
                  path: `${wotModsPath}\\${version}\\${file}`,
                  name: file.replace('[大德]', '').replace('.wotmod', '').split('-')[0],
                  updataTime: Number(file.replace('[大德]', '').replace('.wotmod', '').split('-')[1]),
                  gameVersion: version
                });
              }
            }
          }
          event.sender.send('installed-mods', createSuccessIpcMessage(result));
        } catch (error) {
          console.error('Error scanning mods directory:', error);
          event.sender.send('installed-mods', createFailIpcMessage('读取已安装mod失败'));
        }
        return;
      case 'delete-file':
        try {
          const { pathList } = args;
          pathList.forEach((path: string) => {
            fs.unlinkSync(path); // 同步删除文件
            event.sender.send('delete-file-res', createSuccessIpcMessage(1));
          });
          return;
        } catch (error: any) {
          event.sender.send('delete-file-res', createFailIpcMessage(JSON.stringify(error)));
          return
        }
      case 'clear-all-mods':
        try {
          const { path: wotpath, gameVersion } = args;
          const mods_versions = fs.readdirSync(`${wotpath}\\mods`).filter((folder: any) => folder.startsWith('1.'));
          for (const version of mods_versions) {
            const targetpath = path.join(wotpath, 'mods', version);
            fsExt.removeSync(targetpath)
          }
          fsExt.ensureDirSync(path.join(wotpath, 'mods', gameVersion));
          const res_mods_versions = fs.readdirSync(`${wotpath}\\res_mods`).filter((folder: any) => folder.startsWith('1.'));
          for (const version of res_mods_versions) {
            const targetpath = path.join(wotpath, 'res_mods', version);
            fsExt.removeSync(targetpath)
          }
          fsExt.ensureDirSync(path.join(wotpath, 'res_mods', gameVersion));
          event.sender.send('clear-all-mods-res', createSuccessIpcMessage(1));
        } catch (error) {
          event.sender.send('clear-all-mods-res', createFailIpcMessage(JSON.stringify(error)));
        }
        break;
    }
  });
  // vuex持久化存储监听
  ipcMain.on('vuex', async (event, command, args) => {
    switch (command) {
      case 'vuex-write':
        const { state } = args;
        fs.writeFile(STORE_PATH, state, (err: any) => {
          if (err) {
            event.reply('vuex-error', err);
          }
        });
        break;
      case 'vuex-read':
        fs.readFile(STORE_PATH, (err: any, data: any) => {
          if (err) {
            // 如果文件不存在，则初始化为空对象或默认状态
            if (err.code === 'ENOENT') {
              event.sender.send('vuex-initial-stat', createFailIpcMessage('文件不存在'));
            } else {
              // 其他错误类型，返回错误信息
              event.sender.send('vuex-initial-stat', createFailIpcMessage(JSON.stringify(err)));
            }
            return;
          }
          event.sender.send('vuex-initial-stat', createSuccessIpcMessage(data.toString()));
        });
        break;
    }
  });
  // 文件下载监听
  ipcMain.on('download-file', async (event, command, args) => {
    switch (command) {
      case 'download':
        console.log(JSON.parse(args))
        const { path: wotmodpath, url } = JSON.parse(args);
        const writer = fs.createWriteStream(wotmodpath);
        try {
          const response = await axios({
              url,
              method: 'GET',
              responseType: 'stream'
          });

          const totalLength = response.headers['content-length'];

          let receivedLength = 0;
          let lastReceivedTime = Date.now();

          let lastUpdateTime = 0;
          const updateInterval = 50; // Update every 500 milliseconds (0.5 second)

          response.data.on('data', (chunk: any) => {
              receivedLength += chunk.length;
              const now = Date.now();
              const timeElapsed = (now - lastReceivedTime) / 1000; // seconds
              const speed = chunk.length / timeElapsed; // bytes per second
              lastReceivedTime = now;

              if (now - lastUpdateTime > updateInterval) {
                const progress = Math.round((receivedLength / totalLength) * 100);
                event.sender.send('download-progress', { progress, speed: (speed / 1024 / 1024).toFixed(2) });
                lastUpdateTime = now;
              }
          });

          response.data.pipe(writer);

          writer.on('finish', () => {
              event.sender.send('download-complete', createSuccessIpcMessage(''));
          });
        } catch (e: any) {
          event.sender.send('download-complete', createFailIpcMessage(JSON.stringify(e)));
        }
        break;
    }
  });
  // shell执行监听
  ipcMain.on('shell', async (event, command, args) => {
    switch (command) {
      case 'open-url-by-browser':
        const { url } = args;
        shell.openExternal(url);
        break;
    }
  });
  // 接口请求监听
  ipcMain.on('axios', async (event, command, args) => {
    switch (command) {
      case 'get-gameuser-id':
        try {
          const { gameUsername } = args;
          const response = await axios({
            url: `https://tanki.su/ru/community/accounts/search?name=${gameUsername}`,
            method: 'GET',
            headers: {
              'x-requested-with': 'XMLHttpRequest'
            }
          });
          if (response.status === 200) {
            event.sender.send('send-gameuser-id', createSuccessIpcMessage(response.data));
          }
          event.sender.send('send-gameuser-id', createFailIpcMessage('用户id请求失败'));
        } catch (err) {
          event.sender.send('send-gameuser-id', createFailIpcMessage(JSON.stringify(err)));
        }
        
        break;
    }
  });
}