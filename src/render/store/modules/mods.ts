import { ModMutation, StoreModule } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';
import { deleteVip, extractVip, getInstalledMods, getInstalledTrans, showErrorByDialog } from '@core/utils/game';
import axios from 'axios';
import { ModsApi } from '@core/const/api';

export interface IModState {
    categorize: any,
    name: any,
    installed: any,
    installedCategorize: any,
    installedName: any,
    installedTrans: any,
    installedVip: any,
    hasNew: boolean,
}

const state: IModState = {
    categorize: {},
    name: {},
    installed: {},
    installedCategorize: {},
    installedName: {},
    installedTrans: {},
    installedVip: {},
    hasNew: false,
};

const mutations: MutationTree<IModState> = {
    [ModMutation.SET_CATEGORIZE](state: IModState, payload: any) {
        state.categorize = payload;
    },
    [ModMutation.SET_NAME](state: IModState, payload: any) {
        state.name = payload;
    },
    [ModMutation.SET_INSTALLED](state: IModState, payload: any) {
        state.installed = payload;
    },
    [ModMutation.SET_INSTALLED_CATEGORIZE](state: IModState, payload: any) {
        state.installedCategorize = payload;
    },
    [ModMutation.SET_INSTALLED_NAME](state: IModState, payload: any) {
        state.installedName = payload;
    },
    [ModMutation.SET_INSTALLED_TRANS](state: IModState, payload: any) {
        state.installedTrans = payload;
    },
    [ModMutation.SET_INSTALLED_VIP](state: IModState, payload: any) {
        state.installedVip = payload;
    },
    [ModMutation.SET_HAS_NEW](state: IModState, payload: any) {
        state.hasNew = payload;
    },
};

const actions: ActionTree<IModState, IRootState> = {
    async initModData({ commit, dispatch }) {
        const cat: any = {};
        const name: any = {};
        try {
            dispatch(`${StoreModule.LOADING}/setLoading`, true, { root: true });
            const { data } = await axios.get(ModsApi);
            const { mods: modList } = data;
            if (modList) {
                modList.forEach((item: any) => {
                    if (!cat[item.categorize]) cat[item.categorize] = [];
                    cat[item.categorize].push(item);
                    name[item.name] = item;
                });
                commit(ModMutation.SET_CATEGORIZE, cat);
                commit(ModMutation.SET_NAME, name);
            }
        } catch (err) {
            showErrorByDialog('网络错误', '请稍后再试')
        } finally {
            dispatch(`${StoreModule.LOADING}/setLoading`, false, { root: true });
        }
        
    },
    async initInstalled({ commit, rootState, state }) {
        commit(ModMutation.SET_HAS_NEW, false);
        const gamePath = rootState[StoreModule.GAME].gameInstallations?.path;
        const gameVersion = rootState[StoreModule.GAME].gameInstallations?.gameVersion;
        if (!gamePath) return commit(ModMutation.SET_INSTALLED, []);
        const res = await getInstalledMods(gamePath);
        if (res.status) {
            const list = res.payload.map((item: any) => {
                return {
                    ...state.name[item.name],
                    ...item,
                }
            })
            const categorize: any = {};
            const name : any= {};
            list.forEach((item: any) => {
                if (!categorize[item.categorize]) categorize[item.categorize] = [];
                categorize[item.categorize].push(item);
                name[item.name] = item;
                if (
                    gameVersion === item.gameVersion
                    && state.name[item.name]
                    && state.name[item.name].gameVersion === item.gameVersion
                    && state.name[item.name].updataTime !== item.updataTime
                    && !state.hasNew
                ) {
                    commit(ModMutation.SET_HAS_NEW, true);
                }
            })
            commit(ModMutation.SET_INSTALLED, list);
            commit(ModMutation.SET_INSTALLED_CATEGORIZE, categorize);
            commit(ModMutation.SET_INSTALLED_NAME, name);
        } else {
            showErrorByDialog("数据初始化错误，可能是游戏目录损坏", res.message);
        }
    },
    async initInstalledTrans({ commit, rootState, state }) {
        const gamePath = rootState[StoreModule.GAME].gameInstallations?.path;
        if (!gamePath) return commit(ModMutation.SET_INSTALLED_TRANS, []);
        const res = await getInstalledTrans(gamePath);
        if (res.status) {
            const list = res.payload.map((item: any) => {
                return {
                    ...state.name[item.name],
                    ...item,
                }
            })
            commit(ModMutation.SET_INSTALLED_TRANS, list);
        } else {
            showErrorByDialog("数据初始化错误，可能是游戏目录损坏", res.message);
        }
    },
    async setInstalledVip({ commit }, payload) {
        commit(ModMutation.SET_INSTALLED_VIP, payload)
    },
    async extractVip({ commit, state, rootState }, needExtractMods) {
        if (needExtractMods.length > 0) {
            const res = await extractVip(JSON.stringify(needExtractMods), rootState[`${StoreModule.GAME}`].gameInstallations.path);
            if (res.status) {
                const temp = JSON.parse(JSON.stringify(state.installedVip));
                needExtractMods.forEach((item: any) => {
                    return temp[item.name] = state.installedName[item.name];
                })
                commit(ModMutation.SET_INSTALLED_VIP, temp)
            } else {
                // alert(`vip插件注入错误`+res.message)
            }
        }
    },
    async deleteVip({ commit, state }) {
        const res = await deleteVip(JSON.stringify(Object.values(state.installedVip)));
        if (res.status) {
            commit(ModMutation.SET_INSTALLED_VIP, {})
        } else {
            // alert(`vip插件注入错误(1)`+res.message)
        }
    },
}

const ModsModule: Module<IModState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default ModsModule;