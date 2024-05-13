import { UserMutation } from '@src/core/const/store';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IUserState {
    userinfo: Record<string, any> | null,
    bindGameUser: string,
    gameReport: Record<string, any> | null,
    account: string,
    password: string,
}

const state: IUserState = {
    userinfo: null,
    gameReport: null,
    bindGameUser: '',
    account: '',
    password: '',
};

const mutations: MutationTree<IUserState> = {
    [UserMutation.SET_USER_INFO](state: IUserState, payload: any) {
        state.userinfo = payload;
    },
    [UserMutation.SET_GAME_REPORT](state: IUserState, payload: any) {
        state.gameReport = payload;
    },
    [UserMutation.SET_BIND_GAME_USER](state: IUserState, payload: any) {
        state.bindGameUser = payload;
    },
    [UserMutation.SET_ACCOUNT](state: IUserState, payload: any) {
        state.account = payload;
    },[UserMutation.SET_PASSWORD](state: IUserState, payload: any) {
        state.password = payload;
    }
};

const actions: ActionTree<IUserState, IRootState> = {
    initUserData({ commit }, payload) {
        commit(UserMutation.SET_USER_INFO, payload.userinfo);
        commit(UserMutation.SET_GAME_REPORT, payload.gameReport);
        commit(UserMutation.SET_BIND_GAME_USER, payload.bindGameUser);
        commit(UserMutation.SET_ACCOUNT, payload.account);
        commit(UserMutation.SET_PASSWORD, payload.password);
    },
    setUser({ commit }, payload) {
        commit(UserMutation.SET_USER_INFO, payload);
    },
    clearUser({ commit }) {
        commit(UserMutation.SET_USER_INFO, []);
    },
    setAccout({ commit }, payload) {
        commit(UserMutation.SET_ACCOUNT, payload);
    },
    setPassword({ commit }, payload) {
        commit(UserMutation.SET_PASSWORD, payload);
    },
    setBindGameUser({ commit }, payload) {
        commit(UserMutation.SET_BIND_GAME_USER, payload);
    },
    setGameReport({ commit }, payload) {
        commit(UserMutation.SET_GAME_REPORT, payload);
    },
}

const UserModule: Module<IUserState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default UserModule;