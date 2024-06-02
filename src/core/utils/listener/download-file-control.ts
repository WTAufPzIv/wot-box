import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import { decrypt, encrypt, readZipRootFolder, removeReadonlyAttr } from "../files";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const path = require('path')
const fs = require('fs');
const extractZip = require('extract-zip');

const tempZipPath = `${app.getPath('temp')}/downloaded.zip`;

export function startListenDownloadFile(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {});
    return ipcMain.on('download-file', async (event, command, args) => {
        switch (command) {
          case 'download':
            const { path: wotmodpath, url, mod } = JSON.parse(args);
            try {
              const writer = fs.createWriteStream(tempZipPath);
              const response = await axios({
                  url,
                  method: 'GET',
                  responseType: 'stream'
              });
    
              const totalLength = response.headers['content-length'];
    
              let receivedLength = 0;
              let lastReceivedTime = Date.now();
    
              response.data.on('data', (chunk: any) => {
                  receivedLength += chunk.length;
                  const now = Date.now();
                  const timeElapsed = (now - lastReceivedTime) / 1000; // seconds
                  const speed = chunk.length / timeElapsed; // bytes per second
                  lastReceivedTime = now;
    
                  const progress = Math.round((receivedLength / totalLength) * 100);
                  event.sender.send('download-progress', { progress, speed: (speed / 1024 / 1024).toFixed(2)  });
              });
    
              response.data.pipe(writer);
    
              writer.on('finish', async () => {
                if(mod.target.startsWith('mods')) {
                  try {
                    await removeReadonlyAttr(path.join(wotmodpath, 'mods'));
                    await extractZip(tempZipPath, { dir: wotmodpath });
                    const modName = await readZipRootFolder(tempZipPath);
                    if (modName) {
                      fs.writeFileSync(path.join(wotmodpath, modName, 'modinfo.txt'), encrypt(JSON.stringify({ ...mod, detailMd: '' })));
                      event.sender.send('download-complete', createSuccessIpcMessage(''));
                    } else {
                      event.sender.send('download-complete', createFailIpcMessage('插件解压失败：插件损坏，请联系管理员'));
                    }
                  } catch(err: any) {
                    event.sender.send('download-complete', createFailIpcMessage('插件解压失败' + err.toString()));
                  } finally {
                    fs.unlink(tempZipPath, (err: any) => {
                      if (err) console.error('Error deleting temp file:', err);
                    });
                  }
                } else if (mod.target.startsWith('res_mods')) {
                  try {
                    const modName = await readZipRootFolder(tempZipPath, /text\/$/);
                    await extractZip(tempZipPath, { dir: wotmodpath });
                    if (modName) {
                      if (fs.existsSync(path.join(wotmodpath, modName, 'modinfo.txt'))) {
                        const data = fs.readFileSync(path.join(wotmodpath, modName, 'modinfo.txt'));
                        const oldList = JSON.parse(decrypt(data.toString()));
                        const hasInstalled = oldList.find((item: any) => {
                          return item.name === mod.name;
                        });
                        if (!hasInstalled) {
                          const arr = [
                            ...JSON.parse(decrypt(data.toString())),
                            { ...mod, detailMd: '' },
                          ]
                          fs.writeFileSync(path.join(wotmodpath, modName, 'modinfo.txt'), encrypt(JSON.stringify(arr)));
                        }
                      } else {
                        const arr = [ mod ];
                        fs.writeFileSync(path.join(wotmodpath, modName, 'modinfo.txt'), encrypt(JSON.stringify(arr)));
                      }
                      event.sender.send('download-complete', createSuccessIpcMessage(''));
                    } else {
                      event.sender.send('download-complete', createFailIpcMessage('汉化包解压失败：汉化包损坏，请联系管理员'));
                    }
                  } catch(err: any) {
                    event.sender.send('download-complete', createFailIpcMessage('汉化包解压失败' + err.toString()));
                  } finally {
                    fs.unlink(tempZipPath, (err: any) => {
                      if (err) console.error('Error deleting temp file:', err);
                    });
                  }
                } else if (mod.target.startsWith('vip')) {
                  try {
                    await extractZip(tempZipPath, { dir: wotmodpath });
                    const modName = await readZipRootFolder(tempZipPath);
                    if (modName) {
                      fs.writeFileSync(path.join(wotmodpath, modName, 'modinfo.txt'), encrypt(JSON.stringify({ ...mod, detailMd: '' },)));
                      event.sender.send('download-complete', createSuccessIpcMessage(''));
                    } else {
                      event.sender.send('download-complete', createFailIpcMessage('插件解压失败：插件损坏，请联系管理员'));
                    }
                  } catch(err: any) {
                    event.sender.send('download-complete', createFailIpcMessage('插件解压失败' + err.toString()));
                  } finally {
                    fs.unlink(tempZipPath, (err: any) => {
                      if (err) console.error('Error deleting temp file:', err);
                    });
                  }
                }
              });
            } catch (e: any) {
              event.sender.send('download-complete', createFailIpcMessage(JSON.stringify(e)));
            }
            break;
        }
    });
}