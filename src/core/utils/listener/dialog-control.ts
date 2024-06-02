import { app, BrowserWindow, dialog, ipcMain } from "electron";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const regedit = require('regedit');
const path = require('path')

export function startListenDialog(mainWindow: BrowserWindow) {
    return ipcMain.on('dialog', (event, command, args) => {
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
          case 'search-game-path':
            // 手动更改vbs目录为保存好的vbs目录
            regedit.setExternalVBSLocation(path.join(app.getPath('userData'), 'vbs'));
            const regeditPath = 'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Compatibility Assistant\\Store';
            regedit.list(regeditPath, (err: any, res: any) => {
              if (err) {
                event.sender.send('search-game-path-res', createFailIpcMessage(err));
              } else {
                // const arr = 
                if (res[regeditPath] && res[regeditPath].exists) {
                  const arr = Object.keys(res[regeditPath].values).filter(item => {
                    return item.includes('\\Tanki\\lgc_api.exe')
                  })
                  event.sender.send('search-game-path-res', createSuccessIpcMessage(arr));
                } else {
                  event.sender.send('search-game-path-res', createFailIpcMessage(''));
                }
              }
            })
            break;
        }
    })
}