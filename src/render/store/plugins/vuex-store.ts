import { StoreModule } from "@core/const/store";
import { ipcMessageTool } from "@core/utils/game";
import { Store } from "vuex";

export async function vuexStore(store: Store<any>) {
    // 应用启动时，从主进程读取状态
    (window as any).countries = {};
    const localStore = await ipcMessageTool('vuex', 'vuex-read', {}, 'vuex-initial-stat')
    const localStoreRaw = await ipcMessageTool('vuex', 'vuex-read-raw', {}, 'vuex-initial-stat-raw')

    if (localStore.status) {
        // 读取成功才进行state载入
        const localState = JSON.parse(localStore.payload);
        if (import.meta.env.DEV) {
            console.log(localState)
        }
        await store.dispatch(`${StoreModule.GAME}/initGameState`, localState[StoreModule.GAME]);
        localState[StoreModule.WN8] && await store.dispatch(`${StoreModule.WN8}/initHistory`, localState[StoreModule.WN8]);
        localState[StoreModule.USER] && await store.dispatch(`${StoreModule.USER}/initUserData`, localState[StoreModule.USER]);
    }
    if (localStoreRaw.status) {
        // 读取成功才进行state载入
        const localState = JSON.parse(localStoreRaw.payload);
        if (import.meta.env.DEV) {
            console.log(localState)
        }
        localState[StoreModule.BATTLE] && await store.dispatch(`${StoreModule.BATTLE}/initBattleData`, localState[StoreModule.BATTLE]);
    }

     // 当状态变化时，发送状态到主进程进行存储
    store.subscribe((mutation, state) => {
        // 用一下这个参数
        JSON.stringify(mutation)
        const save = JSON.stringify({
            [StoreModule.GAME]: state[StoreModule.GAME],
            [StoreModule.WN8]: state[StoreModule.WN8],
            [StoreModule.USER]: state[StoreModule.USER],
        })
        ipcMessageTool('vuex', 'vuex-write', { state: save })
        const saveRaw = JSON.stringify({
            [StoreModule.BATTLE]: state[StoreModule.BATTLE],
        })
        ipcMessageTool('vuex', 'vuex-write-raw', { state: saveRaw })
    });
    await store.dispatch(`${StoreModule.MODS}/initInstalled`);
    await store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
    store.dispatch(`${StoreModule.MODS}/initModData`).then(() => {
        store.dispatch(`${StoreModule.MODS}/initInstalled`);
        store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
    });
}