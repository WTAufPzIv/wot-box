<template>
  <div class="header">
    <div class="left">
      <img src="@render/assets/wotlogo.png" alt="">
      <p>大德盒子</p>
      <span>V 1.2.2</span>
    </div>
    <div class="right">
      <MinusOutlined class="win-ctrl" @click="handleMiniMizw" />
      <BorderOutlined class="win-ctrl" @click="handleUnMiniMizw" />
      <CloseOutlined class="win-ctrl" @click="handleClose" />
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ipcRenderer } from 'electron'
import { MinusOutlined, CloseOutlined, BorderOutlined } from '@ant-design/icons-vue';

function handleMiniMizw() {
  (window as any).electron.ipcRenderer.send('window-control', 'minimize');
}

function handleUnMiniMizw() {
  (window as any).electron.ipcRenderer.send('window-control', 'maximize-restore');
}

function handleClose() {
  (window as any).electron.ipcRenderer.send('window-control', 'close');
}
</script>

<style lang="less" scoped>
.header {
    width: 100vw;
    height: 60px;
    background-color: rgb(20,20,20);
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0 0px 0 50px;
    -webkit-app-region: drag;
    .left {
      position: relative;
      height: 60px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      img {
        width: 115px;
        height: 30px;
      }
      p {
        color: #fffbed;
        line-height: 60px;
        font-size: 22px;
        margin: -4px 0 0 20px;
        padding: 0;
        font-weight: bold;
      }
      span {
        color: #fffbed;
        font-size: 16px;
        margin-left: 20px;
        padding: 0;
      }
    }
    .right {
      // width: 200px;
      height: 100%;
      // background-color: red;
      right: 0;
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      .win-ctrl{
        width: 60px;
        display: block;
        height: 40px;
        color: #fffbed;
        line-height: 40px;
        -webkit-app-region: no-drag;
      }
      .win-ctrl:hover {
        background-color: rgba(255,255,255,0.1);
      }
    }
}
</style>