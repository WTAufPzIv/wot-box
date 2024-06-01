import { BrowserWindow, ipcMain } from "electron";
import { killProcess } from "../files";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const { spawn } = require('child_process');

let interval: any = null;

export function startListenGameRun(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {});
    return ipcMain.on('game-run', async (event, command, args) => {
        switch (command) {
          case 'start-check':
            const { processName } = args;
            interval = setInterval(() => {
                const tasklist = spawn('tasklist');
                let output = '';
    
                tasklist.stdout.on('data', (data: any) => {
                    output += data.toString();
                });
    
                tasklist.on('close', () => {
                    const isRunning = output.toLowerCase().includes(processName[0].toLowerCase());
                    event.sender.send('game_run_status', isRunning ? 'running' : 'stopped');
    
                    const isClientRunning = output.toLowerCase().includes(processName[1].toLowerCase());
                    event.sender.send('client_run_status', isClientRunning ? 'client-running' : 'client-stopped');
                });
            }, 1000); // 每1秒检查一次
            break;
          case 'stop-check':
            interval && clearInterval(interval);
            event.sender.send('stop-check-res', createSuccessIpcMessage(1));
            break;
          case 'start-game':
            try {
              const { path } = args;
              spawn(path);
            } catch( err: any ) {
              event.sender.send('start-game-res', createFailIpcMessage(err));
            }
            break;
          case 'stop-client':
            try {
              const res = await killProcess('WorldOfTanks.exe')
              console.log(res);
            } catch (err: any) {
              console.log(err.message);
              event.sender.send('stop-client-res', createFailIpcMessage(err.message));
            }
            break;
        }
    });
}