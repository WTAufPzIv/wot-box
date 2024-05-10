import { ModMutation, StoreModule } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';
import { modList } from '../../../mock/mod';
import { sleep } from '@src/render/utils/common';
import { getInstalledMods, showErrorByDialog } from '@core/utils/game';
import { PATH_mods } from '@core/const/path';

export interface IModState {
    categorize: any,
    name: any,
    installed: any
}

const state: IModState = {
    categorize: {},
    name: {},
    installed: {},
};

const getters = {
    getCountries: () => {
        return (window as any).countries || {}
    }
}

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
};

const actions: ActionTree<IModState, IRootState> = {
    async initModData({ commit, dispatch }) {
        await sleep(100);
        const cat: any = {};
        const name: any = {};
        modList.forEach(item => {
            if (!cat[item.categorize]) cat[item.categorize] = [];
            cat[item.categorize].push(item);
            name[item.name] = item;
        });
        commit(ModMutation.SET_CATEGORIZE, cat);
        commit(ModMutation.SET_NAME, name);
        dispatch('initInstalled');
    },
    async initInstalled({ commit, rootState, state }) {
        const gamePath = rootState[StoreModule.GAME].gameInstallations?.path;
        if (!gamePath) return commit(ModMutation.SET_INSTALLED, []);
        const res = await getInstalledMods(gamePath + PATH_mods);
        if (res.status) {
            const list = res.payload.map((item: any) => {
                return {
                    ...state.name[item.name],
                    ...item,
                }
            })
            commit(ModMutation.SET_INSTALLED, list);
        } else {
            showErrorByDialog("错误", "检测到游戏已损坏，请检查游戏完整性");
        }
    }
}

const ModsModule: Module<IModState, IRootState> = {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
export default ModsModule;