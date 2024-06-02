import { StoreModule } from "@core/const/store";
import { ipcMessageTool } from "@core/utils/game";
import { Store } from "vuex";

export async function deleteVips(store: Store<any>) {
    // 清除可能残余的vip插件
    const gamePath = store.state[`${StoreModule.GAME}`].gameInstallations?.path
    gamePath && ipcMessageTool('file', 'force-delete-vip', { path: gamePath });
}