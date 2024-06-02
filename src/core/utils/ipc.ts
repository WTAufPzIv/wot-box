import { BrowserWindow } from 'electron'
import { startListenWindowControl } from './listener/window-control';
import { startListenDialog } from './listener/dialog-control';
import { startListenFile } from './listener/file-control';
import { startListenVuex } from './listener/vuex-control';
import { startListenDownloadFile } from './listener/download-file-control';
import { startListenShell } from './listener/shell-control';
import { startListenAxios } from './listener/axios-control';
import { startListenGameRun } from './listener/game-run-control';
import { startListenUpdata } from './listener/updata-control';

export default (mainWindow: BrowserWindow) => {
  // 窗口控制监听
  startListenWindowControl(mainWindow),
  // 弹窗调用监听
  startListenDialog(mainWindow),
  // 文件读取监听
  startListenFile(mainWindow),
  // vuex持久化存储监听
  startListenVuex(mainWindow),
  // 文件下载监听
  startListenDownloadFile(mainWindow),
  // shell执行监听
  startListenShell(mainWindow),
  // 接口请求监听
  startListenAxios(mainWindow),
  // 游戏运行监听
  startListenGameRun(mainWindow)
  // 升级监听
  startListenUpdata(mainWindow)
}