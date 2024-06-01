import { app, ipcMain } from "electron";
import { createSuccessIpcMessage } from "./ipc-message";
const path = require('path');
const express = require('express');
const portfinder = require('portfinder')

export async function createServer() {
    const appDataPath = app.getPath('userData');
    const tanksFilesPath = path.join(appDataPath, 'tanks');
    const screenFilesPath = path.join(appDataPath, 'screen');
    const expressApp = express();
  
    expressApp.use('/tanks', express.static(tanksFilesPath));
    expressApp.use('/screen', express.static(screenFilesPath));

    const serverPort = await portfinder.getPortPromise({
        port: 9093
    })
    const server = expressApp.listen(serverPort, () => {
      console.log(`Express server running on http://localhost:${serverPort}`);
    });
    ipcMain.on('server', async (event, command) => {
        switch (command) {
            case 'get-server-port':
                event.sender.send('port-res', createSuccessIpcMessage(serverPort))
                break;
        }
    });
    app.on('before-quit', () => {
        if (server) {
            server.close(() => {});
        }
    });
  
    return server;
}