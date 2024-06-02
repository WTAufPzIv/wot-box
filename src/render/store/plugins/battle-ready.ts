import { battleResourceAPI } from "@core/const/api";
import { StoreModule } from "@core/const/store";
import { ipcMessageTool } from "@core/utils/game";
import { Store } from "vuex";

export async function battleReady(store: Store<any>) {
    if (!location.href.includes('login')) {
        // 安装战斗日志记录插件
        if (store.state[`${StoreModule.GAME}`].gameInstallations?.path) {
            await ipcMessageTool(
                'download-file',
                'download',
                JSON.stringify({
                    path: store.state[`${StoreModule.GAME}`].gameInstallations?.path,
                    url: `${battleResourceAPI}/%5B%E5%A4%A7%E5%BE%B7%5D%E6%88%98%E6%96%97%E6%97%A5%E5%BF%97.zip`,
                    mod: { target: 'res_mods' },
                }),
                'download-complete'
            )
        }
        // 读取翻译文件
        const res = await ipcMessageTool(
            'axios',
            'get-trans',
            {
                tanUrl: `${battleResourceAPI}/lesta.json`,
                matUrl: `${battleResourceAPI}/lesta-map.json`,
            },
            'get-trans-res'
        );
        if (res.status) {
            store.dispatch(`${StoreModule.BATTLE}/setTrans`, res.payload)
        }
        // app data下是否存在source-veriosn.json tanks screen
        // 三者之一不存在，重载所有资源
        // 读取source-veriosn.json和远程source-veriosn.json，对比版本，如若不同，重载所有资源.
        store.dispatch(`${StoreModule.BATTLE}/setLoading`, true);
        await ipcMessageTool('axios', 'check-battle-resource', { baseUrl: battleResourceAPI }, 'check-battle-resource-res');
        store.dispatch(`${StoreModule.BATTLE}/setLoading`, false);
    }
}