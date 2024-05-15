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
        <div
            class="version-tip"
            v-if="hasNew"
        >
          更新
        </div>
      </div>
    </router-link>
    <router-link to="/game-trans">
      <div :class="['nav', route.name === 'icon.game-trans' ? 'active': '']">
        <TranslationOutlined />
        <p>游戏汉化</p>
      </div>
    </router-link>
    <router-link to="/user-account">
      <div :class="['nav', route.name === 'icon.user-account' ? 'active': '']">
        <UserOutlined />
        <p>我的账号</p>
      </div>
    </router-link>
    <router-link to="/gamer-info">
      <div :class="['nav', route.name === 'icon.gamer-info' ? 'active': '']">
        <SearchOutlined />
        <p>战绩查询</p>
      </div>
    </router-link>
    <router-link to="/sponsor">
      <div :class="['nav', route.name === 'icon.sponsor' ? 'active': '']">
        <HeartOutlined />
        <p>赞助投喂</p>
      </div>
    </router-link>
    <router-link to="/setup">
      <div :class="['nav', route.name === 'icon.setup' ? 'active': '']">
        <SettingOutlined />
        <p>设置</p>
      </div>
    </router-link>
    <!-- <router-link to="/sponsor">
      <div :class="['nav', route.name === 'icon.sponsor' ? 'active': '']">
        <HeartOutlined />
        <p>赞助投喂</p>
      </div>
    </router-link> -->
    <!-- <router-link to="/admin">
      <div :class="['nav', route.name === 'icon.admin' ? 'active': '']">
        <LockOutlined />
        <p>管理员</p>
      </div>
    </router-link> -->
  </div>
</template>

<script setup lang="ts">
import {
  UserOutlined,
  HeartOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  ToolOutlined,
  TranslationOutlined,
  HomeOutlined,
  SettingOutlined
} from '@ant-design/icons-vue';
import { StoreModule } from '@core/const/store';
import { useRoute } from 'vue-router'
import { useStore } from 'vuex';
import { computed } from 'vue';

const route = useRoute();
const Store = useStore();
const hasNew = computed(() => Store.state[StoreModule.MODS].hasNew);
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
    position: relative;
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
.version-tip {
  position: absolute;
  right: 0;
  top: 0;
  color: #444;
  background-color: #fab81b;
  width: 30px;
  height: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px !important;
}
</style>