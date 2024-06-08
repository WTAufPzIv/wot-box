import { clearBattleLogs, syncBattleLogs } from '@core/utils/game';
import { BattleMutation, StoreModule } from '@src/core/const/store';
import { Modal } from 'ant-design-vue';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IBattleState {
    battles: Record<string, any> | null,
    trans: Record<string, string> | null,
    loading: boolean,
}

export const state: IBattleState = {
    battles: null,
    trans: null,
    loading: false,
};

export const mutations: MutationTree<IBattleState> = {
    [BattleMutation.SET_BATTLES](state: IBattleState, payload: any) {
        state.battles = payload;
    },
    [BattleMutation.ADD_BATTLES](state: IBattleState, payload: any) {
        if (!state.battles) state.battles = {};
        state.battles = {
            ...state.battles,
            ...payload
        }
    },
    [BattleMutation.SET_TRANS](state: IBattleState, payload: any) {
        state.trans = payload;
    },
    [BattleMutation.SET_LOADING](state: IBattleState, payload: any) {
        state.loading = payload;
    },
};

const actions: ActionTree<IBattleState, IRootState> = {
    async initBattleData({ commit, dispatch }, payload) {
        commit(BattleMutation.SET_BATTLES, payload.battles);
        commit(BattleMutation.SET_TRANS, payload.trans);
        dispatch('syncBattleData');
    },
    async clearBattle({ rootState }) {
        const path = rootState[StoreModule.GAME].gameInstallations?.path;
        if (path) {
            await clearBattleLogs(rootState[StoreModule.GAME].gameInstallations?.path)
        }
    },
    async syncBattleData({ rootState, state, dispatch }) {
        const path = rootState[StoreModule.GAME].gameInstallations?.path;
        if (path) {
            const res = await syncBattleLogs(rootState[StoreModule.GAME].gameInstallations?.path, Object.keys(state.battles || {}))
            if (res.status) {
                dispatch('addBattles', JSON.parse(res.payload))
            } else {
                Modal.error({
                    title: `战斗日志同步失败：${res.message}`,
                    class: 'custom-error-dialog',
                    okText: '知道了',
                });
            }
        }
    },
    addBattles({ commit }, payload) {
        commit(BattleMutation.ADD_BATTLES, payload);
    },
    setTrans({ commit }, payload) {
        commit(BattleMutation.SET_TRANS, payload);
    },
    setLoading({ commit }, payload) {
        commit(BattleMutation.SET_LOADING, payload);
    },
}

const battleModule: Module<IBattleState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default battleModule;