import { ipcMain, BrowserWindow, dialog, shell } from 'electron'
import { IipcMessage } from '../const/type';
import { decrypt, encrypt, readAndParseXML, readXvmHtml, readZipRootFolder, unzipFile } from './files';
import { app } from 'electron'
const extractZip = require('extract-zip');
const path = require('path')
const fs = require('fs');
const axios = require('axios');
const fsExt = require('fs-extra');
const { rimrafSync } = require('rimraf')
const { spawn } = require('child_process');
const tempZipPath = `${app.getPath('temp')}/downloaded.zip`;
let interval: any = null;

// 程序app data相关路径
export const STORE_PATH = path.join(app.getPath('userData'), 'store.txt');

function createSuccessIpcMessage(payload: any): IipcMessage {
  return {
    status: 1,
    payload,
    message: '',
  }
}

function createFailIpcMessage(message: string): IipcMessage {
  return {
    status: 0,
    payload: null,
    message,
  }
}

function createModalWindow(mainWindow: BrowserWindow) {
  let modal = new BrowserWindow({
      parent: mainWindow, // 设置父窗口
      modal: true, // 设置为模态窗口
      show: true, // 初始时不显示窗口
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false, // 根据需要调整这些选项
      },
      autoHideMenuBar: true,
      width: 1500,
      height: 1000,
      minWidth: 1500,
      minHeight: 1000,
  });

  modal.loadURL('http://localhost:3000/#/editor'); // 加载子窗口内容
  modal.once('ready-to-show', () => {
      modal.show(); // 当页面加载完成后显示窗口
  });
}

export default (mainWindow: BrowserWindow) => {
    // 窗口控制监听
  ipcMain.on('window-control', async (event, command) => {
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
      case 'open-editor':
        createModalWindow(mainWindow)
        break;
      case 'restart':
        app.relaunch();  // 安排应用重启
        app.quit();      // 关闭当前应用
        break;
    }
  });
  // 弹窗调用监听
  ipcMain.on('dialog', (event, command, args) => {
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
    }
  })
  // 文件读取监听
  ipcMain.on('file', async (event, command, args) => {
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
                  const data = fs.readFileSync(path.join(gamePath, 'mods', version, file, 'config.txt'));
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
          const dadevip_versions = fs.readdirSync(path.join(gamePath, 'dadevip')).filter((folder: any) => folder.startsWith('1.'));
          for (const version of dadevip_versions) {
            const versionPath = path.join(gamePath, 'dadevip', version);
            const files = fs.readdirSync(versionPath);
            for (const file of files) {
              if (file.startsWith('[大德]')) {
                try {
                  const data = fs.readFileSync(path.join(gamePath, 'dadevip', version, file, 'config.txt'));
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
              const data = fs.readFileSync(path.join(gamePath, 'res_mods', version, 'text', 'config.txt'));
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
              await unzipFile(zipPath, targetFolder, item.password);
              // const hideCmd = `attrib +h +s ${targetFolder} /S /D`;
              // exec(hideCmd, (error: any, stdout: any, stderr: any) => {
              //     if (error) {
              //       event.sender.send('extract-vip-res', createFailIpcMessage(JSON.stringify(error)));
              //     }
              //     if (stderr) {
              //       event.sender.send('extract-vip-res', createFailIpcMessage(JSON.stringify(stderr)));
              //     }
              //     else {
              //       event.sender.send('extract-vip-res', createSuccessIpcMessage(JSON.stringify(stdout)));
              //     }
              // });
            }
          });
          event.sender.send('extract-vip-res', createSuccessIpcMessage(1));
        } catch(err) {
          event.sender.send('extract-vip-res', createFailIpcMessage(JSON.stringify(err)));
        }
        break;
      case 'delete-vip':
        try {
          const { mods } = args;
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
                  const data = fs.readFileSync(path.join(gamePath, 'mods', version, file, 'config.txt'));
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
    }
  });
  // vuex持久化存储监听
  ipcMain.on('vuex', async (event, command, args) => {
    switch (command) {
      case 'vuex-write':
        const { state } = args;
        fs.writeFile(STORE_PATH, encrypt(state), (err: any) => {
          if (err) {
            event.reply('vuex-error', err);
          }
        });
        break;
      case 'vuex-read':
        fs.readFile(STORE_PATH, (err: any, data: any) => {
          if (err) {
            // 如果文件不存在，则初始化为空对象或默认状态
            if (err.code === 'ENOENT') {
              event.sender.send('vuex-initial-stat', createFailIpcMessage('文件不存在'));
            } else {
              // 其他错误类型，返回错误信息
              event.sender.send('vuex-initial-stat', createFailIpcMessage(err.toString()));
            }
            return;
          }
          event.sender.send('vuex-initial-stat', createSuccessIpcMessage(decrypt(data.toString())));
        });
        break;
      case 'clear-vuex':
        try {
          fs.unlinkSync(STORE_PATH); // 同步删除文件
          event.sender.send('clear-vuex-res', createSuccessIpcMessage(1));
        } catch(err: any) {
          event.sender.send('clear-vuex-res', createFailIpcMessage(err.toString()));
        }
    }
  });
  // 文件下载监听
  ipcMain.on('download-file', async (event, command, args) => {
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

          let lastUpdateTime = 0;
          const updateInterval = 50; // Update every 500 milliseconds (0.5 second)

          response.data.on('data', (chunk: any) => {
              receivedLength += chunk.length;
              const now = Date.now();
              const timeElapsed = (now - lastReceivedTime) / 1000; // seconds
              const speed = chunk.length / timeElapsed; // bytes per second
              lastReceivedTime = now;

              if (now - lastUpdateTime > updateInterval) {
                const progress = Math.round((receivedLength / totalLength) * 100);
                event.sender.send('download-progress', { progress, speed: (speed / 1024 / 1024).toFixed(2) });
                lastUpdateTime = now;
              }
          });

          response.data.pipe(writer);

          writer.on('finish', async () => {
            if(mod.target.startsWith('mods')) {
              try {
                await extractZip(tempZipPath, { dir: wotmodpath });
                const modName = await readZipRootFolder(tempZipPath);
                if (modName) {
                  fs.writeFileSync(path.join(wotmodpath, modName, 'config.txt'), encrypt(JSON.stringify(mod)));
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
                  if (fs.existsSync(path.join(wotmodpath, modName, 'config.txt'))) {
                    const data = fs.readFileSync(path.join(wotmodpath, modName, 'config.txt'));
                    const arr = [
                      ...JSON.parse(decrypt(data.toString())),
                      mod,
                    ]
                    fs.writeFileSync(path.join(wotmodpath, modName, 'config.txt'), encrypt(JSON.stringify(arr)));
                  } else {
                    const arr = [ mod ];
                    fs.writeFileSync(path.join(wotmodpath, modName, 'config.txt'), encrypt(JSON.stringify(arr)));
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
                  fs.writeFileSync(path.join(wotmodpath, modName, 'config.txt'), encrypt(JSON.stringify(mod)));
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
  // shell执行监听
  ipcMain.on('shell', async (event, command, args) => {
    // 用一下这个参数
    JSON.stringify(event)
    switch (command) {
      case 'open-url-by-browser':
        const { url } = args;
        shell.openExternal(url);
        break;
    }
  });
  // 接口请求监听
  ipcMain.on('axios', async (event, command, args) => {
    switch (command) {
      case 'get-gameuser-id':
        try {
          const { gameUsername } = args;
          const response = await axios({
            url: `https://tanki.su/ru/community/accounts/search?name=${gameUsername}`,
            method: 'GET',
            headers: {
              'x-requested-with': 'XMLHttpRequest'
            }
          });
          const { status, data }: any  =response;
          if (status === 200) {
            if (!data?.response) {
              event.sender.send('send-gameuser-id', createFailIpcMessage(`用户id数据异常：${data}`));
              return;
            }
            if (data!.response.length === 0) {
              event.sender.send('send-gameuser-id', createFailIpcMessage(`该玩家不存在`));
              return;
            }
            const target = data!.response.find((item: any) => item.account_name === gameUsername)
            if (!target) {
              event.sender.send('send-gameuser-id', createFailIpcMessage(`该玩家不存在`));
              return;
            }
            try {
              const xvmResponse = await axios({
                url: `https://modxvm.com/ru/stats/players/${Number(target.account_id)}`,
                method: 'GET',
              });
              const { data: xvmHtml, status } = xvmResponse
              if (status === 200) {
                try {
                  const wgHtmlResponse = await axios({
                    url: `https://tanki.su${target.account_profile}`,
                    method: 'GET',
                  });
                  const { data: wgHtml, status } = wgHtmlResponse;
                  if (status === 200) {
                    event.sender.send('send-gameuser-id', createSuccessIpcMessage(readXvmHtml(xvmHtml, wgHtml, target.account_name)));
                  }
                } catch(err: any) {
                  event.sender.send('send-gameuser-id', createFailIpcMessage('官网数据查询失败: ' + err.toString()));
                }
              }
            } catch (err: any) {
              const { message } = err;
              if (message.includes('404')) {
                event.sender.send('send-gameuser-id', createFailIpcMessage(`xvm数据查询失败: 该玩家没有坦克世界战斗数据`));
              } else {
                event.sender.send('send-gameuser-id', createFailIpcMessage('xvm数据查询失败: ' + err.toString()));
              }
            }
          }
        } catch (err: any) {
          event.sender.send('send-gameuser-id', createFailIpcMessage('用户id请求失败:' + err.toString()));
        }
        // event.sender.send('send-gameuser-id', createSuccessIpcMessage(readXvmHtml(xvmHtml, WgHtml, 'AuroraAksnesNo')));
        break;
    }
  });
  // 游戏运行监听
  ipcMain.on('game-run', async (event, command, args) => {
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
                const isRunning = output.toLowerCase().includes(processName.toLowerCase());
                event.sender.send('game_run_status', isRunning ? 'running' : 'stopped');
            });
        }, 3000); // 每3秒检查一次
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
    }
  });
}