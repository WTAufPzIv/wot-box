import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './routes'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import store from './store';
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import Prism from 'prismjs';

const app = createApp(App)
app.config.performance = true;

VueMarkdownEditor.use(vuepressTheme, {
    Prism,
});

// router.app = app;
app
    .use(router)
    .use(store)
    .use(Antd)
    .use(VueMarkdownEditor)
    .mount('#app');

(window as any).$store = store;