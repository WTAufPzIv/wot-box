import { HomeApi } from '@core/const/api';
import { showErrorByDialog } from '@core/utils/game';
import { HomeMutation, StoreModule } from '@src/core/const/store';
import axios from 'axios';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IHomeState {
    homeData: boolean
}

export const state: IHomeState = {
    homeData: false,
};

export const mutations: MutationTree<IHomeState> = {
    [HomeMutation.SET_HOME_DATA](state: IHomeState, payload: any) {
        state.homeData = payload;
    },
};

const actions: ActionTree<IHomeState, IRootState> = {
    setHomeData({ commit }, payload) {
        commit(HomeMutation.SET_HOME_DATA, payload)
    },
    async fetHomeData({ dispatch }) {
        try {
            dispatch(`${StoreModule.LOADING}/setLoading`, true, { root: true });
            const { data } = await axios.get(HomeApi);
            if (data) {
                dispatch('setHomeData', data);
            }
        } catch (err) {
            showErrorByDialog('网络错误', '请稍后再试')
        } finally {
            dispatch(`${StoreModule.LOADING}/setLoading`, false, { root: true });
        }
    }
}

const loadingMudule: Module<IHomeState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default loadingMudule;