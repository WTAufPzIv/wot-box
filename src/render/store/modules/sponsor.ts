import { sponsorApi } from '@core/const/api';
import { showErrorByDialog } from '@core/utils/game';
import { SponsorMutation, StoreModule } from '@src/core/const/store';
import { sponsorData } from '@src/mock/sponsor';
import axios from 'axios';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface ISponsorState {
    sponsorData: any
}

export const state: ISponsorState = {
    sponsorData: [],
};

export const mutations: MutationTree<ISponsorState> = {
    [SponsorMutation.SET_SPONSOR_DATA](state: ISponsorState, payload: any) {
        state.sponsorData = payload;
    },
};

const actions: ActionTree<ISponsorState, IRootState> = {
    setData({ commit }) {
        commit(SponsorMutation.SET_SPONSOR_DATA, sponsorData)
    },
    async fetHomeData({ dispatch }) {
        try {
            dispatch(`${StoreModule.LOADING}/setLoading`, true, { root: true });
            const { data } = await axios.get(sponsorApi);
            if (data) {
                dispatch('setData', data);
            }
        } catch (err) {
            showErrorByDialog('网络错误', '请稍后再试')
        } finally {
            dispatch(`${StoreModule.LOADING}/setLoading`, false, { root: true });
        }
    }
}

const sponsorMudule: Module<ISponsorState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default sponsorMudule;