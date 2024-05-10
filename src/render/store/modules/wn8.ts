import { Wn8Mutation } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IWn8State {
    history: string[],
}

const state: IWn8State = {
    history: [],
};

const mutations: MutationTree<IWn8State> = {
    [Wn8Mutation.SET_HISTRORY](state: IWn8State, payload: any) {
        state.history = payload;
    }
};

const actions: ActionTree<IWn8State, IRootState> = {
    initHistory({ commit }, payload) {
        commit(Wn8Mutation.SET_HISTRORY, payload.history);
    },
    addHistory({ commit, state }, payload) {
        const arr = state.history.filter(item => item !== payload);
        arr.push(payload)
        commit(Wn8Mutation.SET_HISTRORY, arr);
    },
    clearHistory({ commit }) {
        commit(Wn8Mutation.SET_HISTRORY, []);
    },
}

const Wn8Module: Module<IWn8State, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default Wn8Module;