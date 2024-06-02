import { BrowserWindow, ipcMain, shell } from "electron";

export function startListenShell(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {});
    return ipcMain.on('shell', async (event, command, args) => {
        // 用一下这个参数
        JSON.stringify(event)
        switch (command) {
          case 'open-url-by-browser':
            const { url } = args;
            shell.openExternal(url);
            break;
        }
    });
}