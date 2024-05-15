import { LoadingMutation } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface ILoaddingState {
    loading: boolean
}

export const state: ILoaddingState = {
    loading: false,
};

export const mutations: MutationTree<ILoaddingState> = {
    [LoadingMutation.SET_LOADING](state: ILoaddingState, payload: any) {
        state.loading = payload;
    },
};

const actions: ActionTree<ILoaddingState, IRootState> = {
    setLoading({ commit }, payload) {
        commit(LoadingMutation.SET_LOADING, payload)
    }
}

const loadingMudule: Module<ILoaddingState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default loadingMudule;