import { GameMutation, StoreModule } from '@src/core/const/store';
import { addGamePathByDialog, checkPythonFile, isWotFolder, parseGameInstallation, showErrorByDialog } from '@core/utils/game';
import { Module, MutationTree, ActionTree } from 'vuex';
import { IRootState } from '../type';

export interface IgameInstallations {
    path: string,
    gameVersion: string,
    gameName: string,
}

export interface IGameState {
    gameInstallations: IgameInstallations | null,
    clientRun: boolean,
    lgcRun: boolean
}

export const state: IGameState = {
    gameInstallations: null,
    clientRun: false,
    lgcRun: false,
};

export const mutations: MutationTree<IGameState> = {
    [GameMutation.SET_GAME_INSTALLATIONS](state: IGameState, payload: any) {
        state.gameInstallations = payload;
    },
    [GameMutation.SET_CLIENT_RUN](state: IGameState, payload: any) {
        state.clientRun = payload;
    },
    [GameMutation.SET_LGC_RUN](state: IGameState, payload: any) {
        state.lgcRun = payload;
    },
};

const actions: ActionTree<IGameState, IRootState> = {
    async initGameState({ commit, dispatch, state }, payload) {
        commit(GameMutation.SET_GAME_INSTALLATIONS, payload.gameInstallations || null)
        if (state.gameInstallations) {
            dispatch('checkAllGameInstallation');
            // 应用启动时，检查dadePython.log文件和dadeBattleLog文件夹的状态
            state.gameInstallations.path && await checkPythonFile(state.gameInstallations.path)
        }
    },
    setClientRun({ commit }, payload) {
        commit(GameMutation.SET_CLIENT_RUN, payload)
    },
    setLgcRun({ commit }, payload) {
        commit(GameMutation.SET_LGC_RUN, payload)
    },
    async addGameInstallation({ commit, dispatch, state }, openDialog: any = null) {
        const res = openDialog ? { status: 1, payload: openDialog.path, message: '' } : await addGamePathByDialog();
        const { status, payload, message } = res;
        if (status && payload) {
            try {
                const { path, gameVersion, gameName } = await parseGameInstallation(payload);
                commit(GameMutation.SET_GAME_INSTALLATIONS, {
                    path,
                    gameVersion,
                    gameName
                });
                state.gameInstallations?.path && await checkPythonFile(state.gameInstallations.path)
                dispatch(`${StoreModule.MODS}/initInstalledTrans`, null, { root: true });
                dispatch(`${StoreModule.MODS}/initInstalled`, null, { root: true });
                dispatch(`${StoreModule.BATTLE}/syncBattleData`, null, { root: true });
            } catch(e) {
                console.log(e)
                showErrorByDialog("失败", "解析错误，请确保所选择的文件夹是坦克世界游戏根目录，且保证游戏完成性");
            }
            return;
        }
        if (!status) showErrorByDialog('失败', '选定的路径错误' + JSON.stringify({ '报错信息': message }));
    },
    async removeGameInstallation({ commit }) {
        commit(GameMutation.SET_GAME_INSTALLATIONS, null )
    },
    async checkAllGameInstallation({ state, dispatch, commit }) {
        const isWot = await isWotFolder(state.gameInstallations!.path);
        if (!isWot) {
            alert(`检测到游戏已损坏，请检查游戏完整性`);
            dispatch('removeGameInstallation');
            return;
        }
        try {
            const { path, gameVersion, gameName } = await parseGameInstallation(state.gameInstallations!.path);
            commit(GameMutation.SET_GAME_INSTALLATIONS, {
                path,
                gameVersion,
                gameName
            })
        } catch(e) {
            showErrorByDialog("错误", `检测到游戏已损坏，请检查游戏完整性`);
        }
    },
}

const gameModule: Module<IGameState, IRootState> = {
    namespaced: true,
    state,
    mutations,
    actions,
};
export default gameModule;