import { Wn8Mutation } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IWn8State {
    history: string[],
    admin: boolean,
}

const state: IWn8State = {
    history: [],
    admin: false,
};

const mutations: MutationTree<IWn8State> = {
    [Wn8Mutation.SET_HISTRORY](state: IWn8State, payload: any) {
        state.history = payload;
    },
    [Wn8Mutation.SET_ADMIN](state: IWn8State, payload: any) {
        state.admin = payload;
    }
};

const actions: ActionTree<IWn8State, IRootState> = {
    initHistory({ commit }, payload) {
        commit(Wn8Mutation.SET_HISTRORY, payload.history);
    },
    addHistory({ commit, state }, payload) {
        const arr = state.history.filter(item => item !== payload);
        arr.push(payload)
        if (arr.length > 5) arr.shift();
        commit(Wn8Mutation.SET_HISTRORY, arr);
    },
    clearHistory({ commit }) {
        commit(Wn8Mutation.SET_HISTRORY, []);
    },
    setAdmin({ commit }, payload) {
        commit(Wn8Mutation.SET_ADMIN, payload)
    }
}

const Wn8Module: Module<IWn8State, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default Wn8Module;