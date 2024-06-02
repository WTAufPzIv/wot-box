import { BrowserWindow } from 'electron'
import { startListenAxios } from './listener/axios-control';
import { startListenFile } from './listener/file-control';
import { startListenVuex } from './listener/vuex-control';

export default (loginWindow: BrowserWindow) => {
      // vuex持久化存储监听
    startListenVuex(loginWindow),
      // 文件读取监听
    startListenFile(loginWindow),
    // 接口请求监听
    startListenAxios(loginWindow)
}