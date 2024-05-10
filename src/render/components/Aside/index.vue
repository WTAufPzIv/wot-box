<template>
  <div class="aside-wrapper">
    <router-link to="/">
      <div :class="['nav', route.name === 'icon.overview' ? 'active': '']">
        <HomeOutlined />
        <p>首页</p>
      </div>
    </router-link>
    <router-link to="/mod-overview">
      <div :class="['nav', route.name === 'icon.mod-overview' ? 'active': '']">
        <ToolOutlined />
        <p>插件安装</p>
      </div>
    </router-link>
    <router-link to="/mod-manage">
      <div :class="['nav', route.name === 'icon.mod-manage' ? 'active': '']">
        <FolderOpenOutlined />
        <p>插件管理</p>
      </div>
    </router-link>
    <router-link to="/game-trans">
      <div :class="['nav', route.name === 'icon.game-trans' ? 'active': '']">
        <TranslationOutlined />
        <p>游戏汉化</p>
      </div>
    </router-link>
    <router-link to="/gamer-info">
      <div :class="['nav', route.name === 'icon.gamer-info' ? 'active': '']">
        <SearchOutlined />
        <p>战绩查询</p>
      </div>
    </router-link>
    <router-link to="/setup">
      <div :class="['nav', route.name === 'icon.setup' ? 'active': '']">
        <SettingOutlined />
        <p>设置</p>
      </div>
    </router-link>
    <router-link to="/sponsor">
      <div :class="['nav', route.name === 'icon.sponsor' ? 'active': '']">
        <HeartOutlined />
        <p>赞助投喂</p>
      </div>
    </router-link>
    <router-link to="/admin">
      <div :class="['nav', route.name === 'icon.admin' ? 'active': '']">
        <LockOutlined />
        <p>管理员</p>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import {
  HeartOutlined,
  LockOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  ToolOutlined,
  TranslationOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
import { useRoute } from 'vue-router'

const route = useRoute();

// function handleOpenEditor() {
//   (window as any).electron.ipcRenderer.send('window-control', 'open-editor');
// }
</script>

<style scoped lang="less">
.aside-wrapper {
  width: 160px;
  background-color: rgb(20,20,20);
  height: calc(100vh - 60px);
  flex-shrink: 0;
  // flex-grow: 1;
  a {
    text-decoration: none;
  }
  .active {
    background-color: #f25322b9;
  }
  .nav {
    width: 100%;
    height: 60px;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding-left: 24px;
    span {
      display: block;
      font-size: 18px;
      color: #fffbed;
    }
    p {
      color: #fffbed;
      font-size: 18px;
      margin: 0;
      padding: 0;
      margin-left: 12px;
      text-decoration: none;
    }
  }
  .nav:hover {
    background-color: #f25322a9;
  }
}
</style>