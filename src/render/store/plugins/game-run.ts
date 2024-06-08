import { StoreModule } from "@core/const/store";
import { startCheckGameRun, stopCheckGameRun } from "@core/utils/game";
import { sleep } from "@src/render/utils/common";
import { Store } from "vuex";

let interval: NodeJS.Timeout

export async function gameRun(store: Store<any>) {
    // 开始监听lgc_api.exe的运行情况
    if (!location.href.includes('login')) {
        (window as any).electron.ipcRenderer.on('game_run_status', async (data: any) => {
            const isVip = (store.state[`${StoreModule.USER}`].userinfo.VipTime * 1000 || 0) > new Date().getTime();
            if (data === 'running') {
                !store.state[`${StoreModule.GAME}`].lgcRun && store.dispatch(`${StoreModule.GAME}/setLgcRun`, true);
                if (isVip) {
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
                }
            } else if (data === 'stopped') {
                store.state[`${StoreModule.GAME}`].lgcRun && store.dispatch(`${StoreModule.GAME}/setLgcRun`, false);
                const installedVipList = Object.keys(store.state[`${StoreModule.MODS}`].installedVip);
                if (installedVipList.length > 0) {
                    store.dispatch(`${StoreModule.MODS}/deleteVip`);
                }
            }
        });
        (window as any).electron.ipcRenderer.on('client_run_status', async (data: any) => {
            if (data === 'client-running') {
                !store.state[`${StoreModule.GAME}`].clientRun && store.dispatch(`${StoreModule.GAME}/setClientRun`, true);
            } else if (data === 'client-stopped') {
                store.state[`${StoreModule.GAME}`].clientRun && store.dispatch(`${StoreModule.GAME}/setClientRun`, false);
            }
        });
        // 先清空游戏目录下的战斗日志，防止后续日志增多加大轮训压力
        await store.dispatch(`${StoreModule.BATTLE}/clearBattle`);
        console.log(123);
        interval = setInterval(() => {
            store.dispatch(`${StoreModule.BATTLE}/syncBattleData`);
        }, 10000);
        (window as any).electron.ipcRenderer.on('app-quit', async () => {
            store.dispatch(`${StoreModule.MODS}/deleteVip`);
            clearInterval(interval)
            await stopCheckGameRun();
        });
        await sleep(50);
        startCheckGameRun();
    }
}