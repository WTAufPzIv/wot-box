import { Tray, Menu, BrowserWindow, app } from "electron";
import { sleep } from "./files";
const path = require('path')

export function createTray(window: BrowserWindow) {
    const tray = new Tray(process.env.VITE_DEV_SERVER_URL ? path.join(__dirname, '../../public/1.jpg') : path.join(__dirname, '../dist/1.jpg'));
    const contextMenu = Menu.buildFromTemplate([
        { label: '退出', type: 'normal', click: async () => {
            window?.webContents.send('app-quit');
            await sleep(1500);
            app.quit();
        }}
    ]);
    tray.setToolTip('大德盒子');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        window!.show();
    });
    return tray;
}
