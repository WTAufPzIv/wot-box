import axios from "axios";
import { app, BrowserWindow, ipcMain } from "electron";
import { readXvmHtml, unzipFile } from "../files";
import { createFailIpcMessage, createSuccessIpcMessage } from "../ipc-message";
const path = require('path');
const fs = require('fs');

const appDataPath = app.getPath('userData');
export function startListenAxios(mainWindow: BrowserWindow) {
    JSON.stringify(mainWindow.title || {});
    return ipcMain.on('axios', async (event, command, args) => {
        switch (command) {
          case 'get-gameuser-id':
            try {
              const { gameUsername } = args;
              const response = await axios({
                url: `https://tanki.su/ru/community/accounts/search?name=${gameUsername}`,
                method: 'GET',
                headers: {
                  'x-requested-with': 'XMLHttpRequest'
                },
                timeout: 60000
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
              console.log(err)
              event.sender.send('send-gameuser-id', createFailIpcMessage('用户id请求失败:' + err.toString()));
            }
            // event.sender.send('send-gameuser-id', createSuccessIpcMessage(readXvmHtml(xvmHtml, WgHtml, 'AuroraAksnesNo')));
            break;
          case 'get-trans':
            try {
              const { tanUrl, matUrl } = args;
              const target: any = {};
              const response = await axios.get(tanUrl);
              Object.values(response.data['GAME']['tankRenderDatas']).forEach((item: any) => {
                Object.entries(item).forEach(([key, value]: any) => {
                  target[key] = value.transName;
                })
              })
              const response1 = await axios.get(matUrl);
              event.sender.send('get-trans-res', createSuccessIpcMessage({ ...target, ...response1.data }))
            } catch(err) {
              event.sender.send('get-trans-res', createFailIpcMessage(JSON.stringify(err)))
            }
            break;
          case 'check-battle-resource':
            try {
              const { baseUrl } = args
              const sourceVersionPath = path.join(appDataPath, 'source-version.json');
              const tanksPath = path.join(appDataPath, 'tanks');
              const screenPath = path.join(appDataPath, 'screen');
              const filesExist = fs.existsSync(sourceVersionPath) && fs.existsSync(tanksPath) && fs.existsSync(screenPath);
              const sourceVersionResponse = await axios.get(`${baseUrl}/source-version.json`);
              if (filesExist) {
                const localVersion = JSON.parse(fs.readFileSync(sourceVersionPath)).version;
                const remoteSourceVersion = sourceVersionResponse.data.version;
                if (sourceVersionResponse.status !== 200) {
                  event.sender.send('check-battle-resource-res', createSuccessIpcMessage(JSON.stringify(appDataPath)));
                  return;
                }
                if (localVersion === remoteSourceVersion) {
                  console.log('source exist and source has not been modified');
                  event.sender.send('check-battle-resource-res', createSuccessIpcMessage(JSON.stringify(appDataPath)))
                  return;
                }
              }
              fs.writeFileSync(sourceVersionPath, JSON.stringify(sourceVersionResponse.data));
              const tanksResponse = await axios.get(baseUrl + '/tanks.zip', { responseType: 'arraybuffer' });
              fs.writeFileSync(path.join(appDataPath, 'tanks.zip'), tanksResponse.data);
              await unzipFile(path.join(appDataPath, 'tanks.zip'), path.join(appDataPath));
              const screenResponse = await axios.get(baseUrl + '/screen.zip', { responseType: 'arraybuffer' });
              fs.writeFileSync(path.join(appDataPath, 'screen.zip'), screenResponse.data);
              await unzipFile(path.join(appDataPath, 'screen.zip'), path.join(appDataPath));
              event.sender.send('check-battle-resource-res', createSuccessIpcMessage(JSON.stringify(appDataPath)))
            } catch(err) {
              console.log(err)
              event.sender.send('check-battle-resource-res', createFailIpcMessage(JSON.stringify(err)))
            }
            break;
        }
    });
}