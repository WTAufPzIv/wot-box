import { app, BrowserWindow, shell, ipcMain } from "electron";
import { decrypt, killProcess, readAndParseXML, sleep, unzipFile } from "../files";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const path = require('path')
const fs = require('fs');
const { rimrafSync } = require('rimraf')
const fsExt = require('fs-extra');
const { exec } = require('child_process');

export function startListenFile(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {})
    return ipcMain.on('file', async (event, command, args) => {
        switch (command) {
          case 'read-version-xml':
            try {
              const { path: wotpath } = args;
              const filePath = path.join(wotpath, 'version.xml');
              const xmlObject = await readAndParseXML(filePath);
              event.sender.send('send-version-xml', createSuccessIpcMessage(JSON.stringify(xmlObject)));
            } catch (error) {
              console.error('读取或解析XML文件时出错:', error);
              event.sender.send('send-version-xml', createFailIpcMessage('读取或解析XML文件时出错'));
            }
            break;
          case 'get-file-list':
            try {
              const { path: wotpath } = args;
              const files = fs.readdirSync(wotpath);
              event.sender.send('send-file-list', createSuccessIpcMessage(files));
            } catch (error) {
              console.error('读取文件列表时出错:', error);
              event.sender.send('send-file-list', createFailIpcMessage('读取文件列表时出错'));
            }
            break;
          case 'open-folder':
            try {
              const { path: wotpath } = args;
              await shell.openPath(wotpath);
            } catch {
            }
            break;
          case 'open-add-data':
            try {
              await shell.openPath(app.getPath('userData'));
            } catch {
            }
            break;
          case 'get-installed-mods':
            try {
              const { path: gamePath } = args;
              const result: any = [];
              const mods_versions = fs.readdirSync(path.join(gamePath, 'mods')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of mods_versions) {
                const versionPath = path.join(gamePath, 'mods', version);
                const files = fs.readdirSync(versionPath);
                for (const file of files) {
                  if (file.startsWith('[大德]')) {
                    try {
                      const data = fs.readFileSync(path.join(gamePath, 'mods', version, file, 'modinfo.txt'));
                      const installedInfo = JSON.parse(decrypt(data.toString()));
                      // mods文件夹下的vip插件不做检测
                      if (installedInfo.categorize !== 'VIP') {
                        result.push({
                          ...JSON.parse(decrypt(data.toString())),
                          path: path.join(gamePath, 'mods', version, file),
                          gameVersion: version
                        });
                      }
                    } catch {
                      // 如果没有配置文件，则只读取插件文件夹的名字作为name
                      result.push({
                        path: path.join(gamePath, 'mods', version, file),
                        name: file.replace('[大德]', ''),
                        updataTime: 0,
                        gameVersion: version
                      });
                    }
                  }
                }
              }
              if (!fs.existsSync(path.join(gamePath, 'dadevip'))) {
                fs.mkdirSync(path.join(gamePath, 'dadevip'), { recursive: true });
              }
              const dadevip_versions = fs.readdirSync(path.join(gamePath, 'dadevip')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of dadevip_versions) {
                const versionPath = path.join(gamePath, 'dadevip', version);
                const files = fs.readdirSync(versionPath);
                for (const file of files) {
                  if (file.startsWith('[大德]')) {
                    try {
                      const data = fs.readFileSync(path.join(gamePath, 'dadevip', version, file, 'modinfo.txt'));
                      result.push({
                        ...JSON.parse(decrypt(data.toString())),
                        path: path.join(gamePath, 'dadevip', version, file),
                        gameVersion: version
                      });
                    } catch {
                      result.push({
                        path: path.join(gamePath, 'dadevip', version, file),
                        name: file.replace('[大德]', ''),
                        updataTime: 0,
                        gameVersion: version
                      });
                    }
                  }
                }
              }
              event.sender.send('installed-mods', createSuccessIpcMessage(result));
            } catch (error: any) {
              console.error('Error scanning mods directory:', error);
              event.sender.send('installed-mods', createFailIpcMessage('读取已安装mod失败' + error.toString()));
            }
            break;
          case 'get-installed-trans':
            try {
              const { path: gamePath } = args;
              const result: any = [];
              const res_mods_versions = fs.readdirSync(path.join(gamePath, 'res_mods')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of res_mods_versions) {
                try {
                  const data = fs.readFileSync(path.join(gamePath, 'res_mods', version, 'text', 'modinfo.txt'));
                  result.push(...JSON.parse(decrypt(data.toString())));
                } catch {
                  // do nothing
                }
              }
              event.sender.send('installed-trans', createSuccessIpcMessage(result));
            } catch (error: any) {
              console.error('Error scanning mods directory:', error);
              event.sender.send('installed-trans', createFailIpcMessage('读取已安装汉化失败' + error.toString()));
            }
            break;
          case 'delete-file':
            try {
              const { pathList } = args;
              pathList.forEach((path: string) => {
                rimrafSync(path); 
                event.sender.send('delete-file-res', createSuccessIpcMessage(1));
              });
            } catch (error: any) {
              event.sender.send('delete-file-res', createFailIpcMessage(JSON.stringify(error)));
            }
            break;
          case 'clear-all-mods':
            try {
              const { path: wotpath, gameVersion } = args;
              const mods_versions = fs.readdirSync(path.join(wotpath, 'mods')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of mods_versions) {
                const targetpath = path.join(wotpath, 'mods', version);
                rimrafSync(targetpath)
              }
              const targetpathOfCfg = path.join(wotpath, 'mods', 'configs');
              rimrafSync(targetpathOfCfg)
              fsExt.ensureDirSync(path.join(wotpath, 'mods', gameVersion));
              const res_mods_versions = fs.readdirSync(path.join(wotpath, 'res_mods')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of res_mods_versions) {
                const targetpath = path.join(wotpath, 'res_mods', version);
                rimrafSync(targetpath)
              }
              fsExt.ensureDirSync(path.join(wotpath, 'res_mods', gameVersion));
              const dadevip_versions = fs.readdirSync(path.join(wotpath, 'dadevip')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of dadevip_versions) {
                const targetpath = path.join(wotpath, 'dadevip', version);
                rimrafSync(targetpath)
              }
              const targetpathOfCfg1 = path.join(wotpath, 'dadevip', 'configs');
              rimrafSync(targetpathOfCfg1)
              fsExt.ensureDirSync(path.join(wotpath, 'dadevip', gameVersion));
              event.sender.send('clear-all-mods-res', createSuccessIpcMessage(1));
            } catch (error) {
              event.sender.send('clear-all-mods-res', createFailIpcMessage(JSON.stringify(error)));
            }
            break;
          case 'extract-vip':
            try {
              const { mods, path: gamePath } = args;
              // 先把和版本号同级的一些文件拷贝过去（真特么烦）
              const extModConfig = fs.readdirSync(path.join(gamePath, 'dadevip')).filter((folder: any) => !folder.startsWith('1.'));
              for (const item of extModConfig) {
                const itemPath = path.join(gamePath, 'dadevip', item);
                await fsExt.copy(itemPath, itemPath.replace('dadevip', 'mods'), { overwrite: true });
              }
              // 然后再解压
              JSON.parse(mods).forEach(async(item: any) => {
                const targetFolder = item.path.replace('dadevip', 'mods')
                await fsExt.copy(item.path, targetFolder, { overwrite: true });
                const files = await fsExt.readdir(targetFolder);
                const zipFile = files.find((file: any) => file.endsWith('.zip'));
                if (zipFile) {
                  const zipPath = path.join(targetFolder, zipFile);
                  try {
                    await unzipFile(zipPath, targetFolder, item.password);
                    const hideCmd = `attrib +h +s ${targetFolder} /S /D`;
                    exec(hideCmd, (error: any, stdout: any, stderr: any) => {
                        if (error || stderr) {
                          event.sender.send('extract-vip-res', createFailIpcMessage(JSON.stringify(error)));
                        }
                        else {
                          event.sender.send('extract-vip-res', createSuccessIpcMessage(JSON.stringify(stdout)));
                        }
                    });
                    event.sender.send('extract-vip-res', createSuccessIpcMessage(1));
                  } catch(err: any) {
                    event.sender.send('extract-vip-res', createFailIpcMessage(err));
                  }
                }
              });
            } catch(err) {
              event.sender.send('extract-vip-res', createFailIpcMessage(JSON.stringify(err)));
            }
            break;
          case 'delete-vip':
            try {
              const { mods } = args;
              if (JSON.parse(mods).length === 0) {
                event.sender.send('delete-vip-res', createSuccessIpcMessage(1));
                return;
              }
              // const isGameRuning = await checkProcess('WorldOfTanks.exe')
              // if (isGameRuning) {
              //   // showErrorByDialog('警告', '由于注入了VIP插件，关闭盒子将会导致游戏关闭，请勿关闭盒子')
              //   killProcess('WorldOfTanks.exe')
              // }
              //此处静默
              try{await killProcess('WorldOfTanks.exe')} catch {}
              await sleep(1000)
              JSON.parse(mods).forEach(async(item: any) => {
                const targetFolder = item.path.replace('dadevip', 'mods')
                rimrafSync(targetFolder); 
              });
              event.sender.send('delete-vip-res', createSuccessIpcMessage(1));
            } catch(err) {
              event.sender.send('delete-vip-res', createFailIpcMessage(JSON.stringify(err)));
            }
            break;
          case 'force-delete-vip':
            try {
              const { path: gamePath } = args;
              const mods_versions = fs.readdirSync(path.join(gamePath, 'mods')).filter((folder: any) => folder.startsWith('1.'));
              for (const version of mods_versions) {
                const versionPath = path.join(gamePath, 'mods', version);
                const files = fs.readdirSync(versionPath);
                for (const file of files) {
                  if (file.startsWith('[大德]')) {
                    try {
                      const data = fs.readFileSync(path.join(gamePath, 'mods', version, file, 'modinfo.txt'));
                      const installedInfo = JSON.parse(decrypt(data.toString()));
                      // mods文件夹下的vip插件不做检测
                      if (installedInfo.categorize === 'VIP') {
                        rimrafSync(path.join(gamePath, 'mods', version, file)); 
                      }
                    } catch {
                      // do nothing
                    }
                  }
                }
              }
            } catch {
    
            }
            break;
          case 'python-file-ready':
            try {
              const { path: wotpath } = args;
              const logFilePath = path.join(wotpath, 'dadePython.log');
              const battleLogFolderPath = path.join(wotpath, 'dadeBattleLog');
              if (!fs.existsSync(logFilePath)) {
                fs.writeFileSync(logFilePath, '', 'utf8');
              }
            
              if (!fs.existsSync(battleLogFolderPath)) {
                fs.mkdirSync(battleLogFolderPath);
              }
            } catch (err) {
              // do nothing
            }
            break;
          case 'sync-battle-logs':
            try {
              const { path: wotpath, oldLogsList } = args;
              const temp: any = {};
              const files = fs.readdirSync(path.join(wotpath, 'dadeBattleLog'));

              files.forEach((file: string) => {
                if (file.endsWith('.txt') && !oldLogsList.includes(file)) {
                  const data = fs.readFileSync(path.join(wotpath, 'dadeBattleLog', file), 'utf8');
                  temp[file] = JSON.parse(data);
                }
              });
              event.sender.send('sync-battle-logs-res', createSuccessIpcMessage(JSON.stringify(temp)));
            } catch (err) {
              event.sender.send('sync-battle-logs-res', createFailIpcMessage(`同步战斗日志失败：${err}`));
            }
        }
    });
}