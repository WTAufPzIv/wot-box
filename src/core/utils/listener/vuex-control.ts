import { app, BrowserWindow, ipcMain } from "electron";
import { decrypt, encrypt } from "../files";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const path = require('path')
const fs = require('fs');

// 程序app data相关路径
const STORE_PATH = path.join(app.getPath('userData'), 'local.txt');
const STORE_RAW_PATH = path.join(app.getPath('userData'), 'localraw.txt');

export function startListenVuex(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {});
    return ipcMain.on('vuex', async (event, command, args) => {
        switch (command) {
          case 'vuex-write':
            try {
              const { state } = args;
              fs.writeFile(STORE_PATH, encrypt(state), (err: any) => {
                if (err) {
                  event.reply('vuex-error', err);
                }
              });
            } catch {
              // do nothing
            }
            break;
          case 'vuex-write-raw':
            try {
              const { state } = args;
              fs.writeFile(STORE_RAW_PATH, state, (err: any) => {
                if (err) {
                  event.reply('vuex-error', err);
                }
              });
            } catch {
              // do nothing
            }
            break;
          case 'vuex-read':
            fs.readFile(STORE_PATH, (err: any, data: any) => {
              if (err) {
                // 如果文件不存在，则初始化为空对象或默认状态
                if (err.code === 'ENOENT') {
                  event.sender.send('vuex-initial-stat', createFailIpcMessage('文件不存在'));
                } else {
                  // 其他错误类型，返回错误信息
                  event.sender.send('vuex-initial-stat', createFailIpcMessage(err.toString()));
                }
                return;
              }
              event.sender.send('vuex-initial-stat', createSuccessIpcMessage(decrypt(data.toString())));
            });
            break;
          case 'vuex-read-raw':
            fs.readFile(STORE_RAW_PATH, (err: any, data: any) => {
              if (err) {
                // 如果文件不存在，则初始化为空对象或默认状态
                if (err.code === 'ENOENT') {
                  event.sender.send('vuex-initial-stat-raw', createFailIpcMessage('文件不存在'));
                } else {
                  // 其他错误类型，返回错误信息
                  event.sender.send('vuex-initial-stat-raw', createFailIpcMessage(err.toString()));
                }
                return;
              }
              event.sender.send('vuex-initial-stat-raw', createSuccessIpcMessage(data.toString()));
            });
            break;
          case 'clear-vuex':
            try {
              fs.unlinkSync(STORE_PATH); // 同步删除文件
              event.sender.send('clear-vuex-res', createSuccessIpcMessage(1));
            } catch(err: any) {
              event.sender.send('clear-vuex-res', createFailIpcMessage(err.toString()));
            }
        }
    });
}