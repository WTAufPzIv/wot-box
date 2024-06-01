import { StoreModule } from '@src/core/const/store';
import { createStore, Store } from 'vuex';
import Game from './modules/game';
import Mods from './modules/mods';
import Wn8 from './modules/wn8';
import User from './modules/user';
import Loading from './modules/loading';
import Home from './modules/home';
import Sponsor from './modules/sponsor';
import Battle from './modules/battle';
import { vuexStore } from './plugins/vuex-store';
import { gameRun } from './plugins/game-run';
import { deleteVips } from './plugins/delete-vip';
import { battleReady } from './plugins/battle-ready';

const createSequentialPlugins = (plugins: Function[]) => {
    return async (store: Store<any>) => {
        for (const plugin of plugins) {
            await plugin(store);
        }
    };
};

const store = createStore({
    modules: {
        [StoreModule.GAME]: Game,
        [StoreModule.MODS]: Mods,
        [StoreModule.WN8]: Wn8,
        [StoreModule.USER]: User,
        [StoreModule.LOADING]: Loading,
        [StoreModule.HOME]: Home,
        [StoreModule.SPONSOR]: Sponsor,
        [StoreModule.BATTLE]: Battle
    },
    plugins: [
        createSequentialPlugins([
            vuexStore,
            deleteVips,
            gameRun,
            battleReady
        ])
    ]
});


if ([ 'dev', 'development' ].includes(process.env.NODE_ENV as string)) {
    /* eslint-disable no-console */
    store.subscribe((mutation, state): void => {
        console.groupCollapsed(`%cMutation: ${mutation.type}`, 'padding: 3px 10px;color: #FFF; background: #248a24; border-radius: 50px;');
        console.log('Payload', mutation.payload);
        console.log('State', state);
        console.groupEnd();
    });
    store.subscribeAction((action, state): void => {
        console.groupCollapsed(`%cAction: ${action.type}`, 'padding: 3px 10px;color: #FFF; background: #24468a; border-radius: 50px;');
        console.log('Payload', action.payload);
        console.log('State', state);
        console.groupEnd();
    });
    /* eslint-enable no-console */
}

export default store;