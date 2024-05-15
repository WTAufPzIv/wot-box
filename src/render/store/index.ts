import { StoreModule } from '@src/core/const/store';
import { ipcMessageTool, startCheckGameRun, stopCheckGameRun } from '@core/utils/game';
import { createStore } from 'vuex';

import Game from './modules/game';
import Mods from './modules/mods';
import Wn8 from './modules/wn8';
import User from './modules/user';
import Loading from './modules/loading';
import Home from './modules/home';
import Sponsor from './modules/sponsor';
import { sleep } from '../utils/common';



const store = createStore({
    modules: {
        [StoreModule.GAME]: Game,
        [StoreModule.MODS]: Mods,
        [StoreModule.WN8]: Wn8,
        [StoreModule.USER]: User,
        [StoreModule.LOADING]: Loading,
        [StoreModule.HOME]: Home,
        [StoreModule.SPONSOR]: Sponsor,
    },
    plugins: [
        async (store) => {
            //   应用启动时，从主进程读取状态
            (window as any).countries = {};
            const localStore = await ipcMessageTool('vuex', 'vuex-read', {}, 'vuex-initial-stat')
            if (localStore.status) {
                // 读取成功才进行state载入
                const localState = JSON.parse(localStore.payload);
                await store.dispatch(`${StoreModule.GAME}/initGameState`, localState[StoreModule.GAME]);
                localState[StoreModule.WN8] && await store.dispatch(`${StoreModule.WN8}/initHistory`, localState[StoreModule.WN8]);
                localState[StoreModule.USER] && await store.dispatch(`${StoreModule.USER}/initUserData`, localState[StoreModule.USER]);
            }

             // 当状态变化时，发送状态到主进程进行存储
            store.subscribe((mutation, state) => {
                // 用一下这个参数
                JSON.stringify(mutation)
                ipcMessageTool('vuex', 'vuex-write', { state: JSON.stringify(state) })
            });
            await store.dispatch(`${StoreModule.MODS}/initInstalled`);
            await store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
            store.dispatch(`${StoreModule.MODS}/initModData`).then(() => {
                store.dispatch(`${StoreModule.MODS}/initInstalled`);
                store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
            });

            // 清除可能残余的vip插件
            const gamePath = store.state[`${StoreModule.GAME}`].gameInstallations?.path
            gamePath && ipcMessageTool('file', 'force-delete-vip', { path: gamePath });
            // 开始监听lgc_api.exe的运行情况
            if (!location.href.includes('login')) {
                (window as any).electron.ipcRenderer.on('game_run_status', async (data: any) => {
                    const isVip = (store.state[`${StoreModule.USER}`].userinfo.VipTime * 1000 || 0) > new Date().getTime();
                    if (data === 'running' && isVip) {
                        // // 查找已经安装，但没有解压到mods中的vip插件
                        const installedList = store.state[`${StoreModule.MODS}`].installed;
                        const installedVipList = Object.keys(store.state[`${StoreModule.MODS}`].installedVip);
                        // 解析差异
                        const needExtract = installedList.filter((element: any) => {
                            return (!installedVipList.includes(element.name)) && element.categorize === 'VIP'
                        });
                        // 存在没解压的插件
                        if (needExtract.length > 0) {
                            store.dispatch(`${StoreModule.MODS}/extractVip`, needExtract);
                        }
                    } else if (data === 'stopped') {
                        const installedVipList = Object.keys(store.state[`${StoreModule.MODS}`].installedVip);
                        if (installedVipList.length > 0) {
                            store.dispatch(`${StoreModule.MODS}/deleteVip`);
                        }
                    }
                });
                (window as any).electron.ipcRenderer.on('app-quit', async () => {
                    store.dispatch(`${StoreModule.MODS}/deleteVip`);
                    await stopCheckGameRun();
                });
                await sleep(50);
                startCheckGameRun();
            }
        }
      ]
});


if ([ 'dev', 'development' ].includes(process.env.NODE_ENV as string)) {
    /* eslint-disable no-console */
    store.subscribe((mutation, state): void => {
        console.groupCollapsed(`%cMutation: ${mutation.type}`, 'padding: 3px 10px;color: #FFF; background: #248a24; border-radius: 50px;');
        console.log('Payload', mutation.payload);
        console.log('State', state);
        console.groupEnd();
    });
    store.subscribeAction((action, state): void => {
        console.groupCollapsed(`%cAction: ${action.type}`, 'padding: 3px 10px;color: #FFF; background: #24468a; border-radius: 50px;');
        console.log('Payload', action.payload);
        console.log('State', state);
        console.groupEnd();
    });
    /* eslint-enable no-console */
}

export default store;