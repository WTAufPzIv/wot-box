import * as Vue from 'vue';
import { createWebHashHistory, createRouter, Router } from 'vue-router';
import homeComponent from '../pages/home/index.vue';
import loginComponents from '../pages/login/index.vue'
import setupComponent from '../pages/setup/index.vue';
import gameTransComponent from '../pages/game-trans/index.vue';
import modManageComponent from '../pages/mod-manage/index.vue';
import modOverviewComponent from '../pages/mod-overview/index.vue';
import gamerInfoComponents from '../pages/gamer-info/index.vue'
import adminComponents from '../pages/admin/index.vue'
import sponsorComponents from '../pages/sponsor/index.vue'

// vite直接使用动态path无法解析，https://github.com/vitejs/vite/discussions/2746
// const dashboardModules =
//     Object.assign(
//         {},
//         import.meta.glob('../pages/data-dashboard/*.vue'),
//         import.meta.glob('../pages/data-dashboard/*/*.vue'),
//     );
export interface IRouter extends Router {
    app?: Vue.App<Element>;
}

const router: IRouter = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            name: 'icon.overview',
            path: '/',
            meta: {
                title: '首页',
            },
            component: homeComponent,
        },
        {
            name: 'icon.login',
            path: '/login',
            meta: {
                title: '登录',
            },
            component: loginComponents,
        },
        {
            name: 'icon.mod-manage',
            path: '/mod-manage',
            meta: {
                title: '插件管理',
            },
            component: modManageComponent,
        },
        {
            name: 'icon.mod-overview',
            path: '/mod-overview',
            meta: {
                title: '插件安装',
            },
            component: modOverviewComponent,
        },
        {
            name: 'icon.game-trans',
            path: '/game-trans',
            meta: {
                title: '游戏汉化',
            },
            component: gameTransComponent,
        },
        {
            name: 'icon.gamer-info',
            path: '/gamer-info',
            meta: {
                title: '战绩查询',
            },
            component: gamerInfoComponents,
        },
        {
            name: 'icon.setup',
            path: '/setup',
            meta: {
                title: '设置',
            },
            component: setupComponent,
        },
        {
            name: 'icon.sponsor',
            path: '/sponsor',
            meta: {
                title: '赞助投喂',
            },
            component: sponsorComponents,
        },
        {
            name: 'icon.admin',
            path: '/admin',
            meta: {
                title: '管理员',
            },
            component: adminComponents,
        },
    ]
})


// router.beforeEach(scrollToTop);

export default router;
