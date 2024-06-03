import { BrowserWindow, ipcMain, Menu, app } from "electron";

function createModalWindow(mainWindow: BrowserWindow, url: string) {
    let modal: BrowserWindow | null = new BrowserWindow({
        parent: mainWindow, // 设置父窗口
        modal: true, // 设置为模态窗口
        show: true, // 初始时不显示窗口
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: false, // 根据需要调整这些选项
        },
        width: 1500,
        height: 1000,
    });
    const template = [
      {
        label: '操作',
        submenu: [
          {
            label: '返回',
            accelerator: 'CmdOrCtrl+Left',
            click: () => {
              if (modal!.webContents.canGoBack()) {
                modal!.webContents.goBack();
              }
            }
          },
          {
            label: '前进',
            accelerator: 'CmdOrCtrl+Right',
            click: () => {
              if (modal!.webContents.canGoForward()) {
                modal!.webContents.goForward();
              }
            }
          }
        ]
      }
    ];
  
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  
    modal.loadURL(url); // 加载子窗口内容
    modal.once('ready-to-show', () => {
        modal!.show(); // 当页面加载完成后显示窗口
    });
  
    modal.on('closed', () => {
      modal = null;
    });
}

export function startListenWindowControl(mainWindow: BrowserWindow) {
    return ipcMain.on('window-control', async (event, command, args) => {
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
            // mainWindow.close();
            event.preventDefault();
            mainWindow.hide();
            break;
          case 'open-link':
            const { url } = args;
            createModalWindow(mainWindow, url)
            break;
          case 'restart':
            app.relaunch();  // 安排应用重启
            app.quit();      // 关闭当前应用
            break;
        }
      });
}