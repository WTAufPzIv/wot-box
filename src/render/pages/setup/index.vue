
<template>
  <div class="setup-wrapper">
    <p class="setup-title">游戏路径</p>
    <div class="game-path">
      <div class="path-value">
        <p>{{ gameState.gameInstallations?.path || '' }}</p>
      </div>
      <a class="add-button" @click="handleClick">
        <span>
          设置游戏路径
        </span>
      </a>
      <a class="add-button" @click="handleOpenFolder(gameState.gameInstallations?.path || '')" v-if="gameState.gameInstallations">
        <span>
          打开游戏目录
        </span>
      </a>
    </div>
    <div class="ext-info" v-if="gameState.gameInstallations">
      <p>游戏名称：{{ gameState.gameInstallations?.gameName || '' }}</p>
      <p>游戏版本：{{ gameState.gameInstallations?.gameVersion || '' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { ipcMessageTool } from '@core/utils/game';
import { toRef } from 'vue';
import { useStore } from 'vuex';

const Store = useStore();
const gameState = toRef(Store.state[StoreModule.GAME])

function handleClick() {
  Store.dispatch(`${StoreModule.GAME}/addGameInstallation`);
}

function handleOpenFolder(path: string) {
  ipcMessageTool('file', 'open-folder', { path });
}
</script>


<style scoped lang="less">
.setup-wrapper {
  width: 1000px;
  .setup-title {
    color: #e9e2bf;
    font-size: 24px;
    font-weight: bolder;
    margin-top: 24px;
    padding: 0;
  }
  .game-path {
    width: 1000px;
    display: flex;
    .path-value {
      width: 600px;
      height: 44px;
      background: #302f2d;
      border: 1px solid #43423c;
      p {
        font-size: 18px;
        color: #fff;
        margin: 0;
        padding: 0;
        line-height: 40px;
        margin-left: 12px;
      }
      // padding: 15px 18px 15px 18px;
    }
  }
  .add-button {
    padding: 0 22px;
    box-shadow: 0 2px 0 #661000, inset 0 0 8px rgba(255,210,0,.1), inset 0 1px 0 #fab81b, inset 0 -1px 0 #ef4511;
    background: linear-gradient(to bottom,#fab81b 0%,#ef4511 100%) no-repeat 0,linear-gradient(to bottom,#fab81b 0%,#ef4511 100%) no-repeat 100%,#f25322 linear-gradient(to bottom,#f60 0%,#a6230e 100%) no-repeat;
    background-size: 1px 100%,1px 100%,cover;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
    vertical-align: middle;
    font-size: 14px;
    font-weight: 700;
    line-height: 14px;
    color: #f9f5e1;
    text-transform: uppercase;
    text-shadow: 0 -1px rgba(71,0,0,.3);
    text-decoration: none;
    border-radius: 1px;
    position: relative;
    box-sizing: border-box;
    height: 44px;
    white-space: nowrap;
    margin-left: 24px;
    cursor: pointer;
    transition: color .15s ease-out;
    span {
      z-index: 2;
      font-size: 14px;
      margin: 0;
      padding: 0;
      color: #f9f5e1;
    }
  }
  .add-button:after {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    content: "";
    box-shadow: inset 0 0 8px rgba(255,210,0,.1), inset 0 1px 0 #fab81b, inset 0 -1px 0 #ff7e00;
    background: linear-gradient(to bottom,#fab81b 0%,#ff7e00 100%) no-repeat 0,linear-gradient(to bottom,#fab81b 0%,#ff7e00 100%) no-repeat 100%,#ff7e00 linear-gradient(to bottom,#ff7e00 0%,#c2530a 100%) no-repeat;
    background-size: 1px 100%,1px 100%,cover;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    will-change: opacity;
  }
  .add-button:hover {
    color: #f9f5e1;
    cursor: pointer;
  }
  .add-button:hover:after {
    opacity: 1;
  }
  .ext-info {
    margin-top: 14px;
      p {
        font-size: 14px;
        color: #b8b8a2;
        margin: 0;
        padding: 0;
        line-height: 40px;
        margin-left: 12px;
      }
    }
}
</style>