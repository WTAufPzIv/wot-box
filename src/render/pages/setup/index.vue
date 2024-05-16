
<template>
  <div class="setup-wrapper">
    <div class="setup-item">
      <p class="setup-title">游戏路径</p>
      <div class="game-path">
        <div class="path-value">
          <p>{{ gameState.gameInstallations?.path || '' }}</p>
        </div>
        <div class="add-button download" @click="handleClick()">设置游戏路径</div>
        <div class="add-button download" @click="handleSearch()">自动搜索</div>
      </div>
      <div class="ext-info" v-if="gameState.gameInstallations">
        <p>游戏名称：{{ gameState.gameInstallations?.gameName || '' }}</p>
        <p>游戏版本：{{ gameState.gameInstallations?.gameVersion || '' }}</p>
      </div>
    </div>
    <div class="setup-item">
      <p class="setup-title">其他</p>
      <div class = "other-btn">
        <div class="btn" @click="handleOpenFolder(gameState.gameInstallations?.path || '')" v-if="gameState.gameInstallations">打开游戏目录</div>
        <div class="btn" @click="handleCheckVersion()">检查更新</div>
        <div class="btn" @click="handleClearAppData()">清除应用数据</div>
        <div class="btn" @click="handleOpenAppData()" v-if="isAdmin">打开AppData文件夹</div>
      </div>
    </div>
  </div>
  <UpgeadeModal :open="open" @close="open=false" ref="upgeadeModal"></UpgeadeModal>
</template>

<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { addGamePathBySearch, deleteAppData, ipcMessageTool, restartApp } from '@core/utils/game';
import { toRef, h, computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'ant-design-vue';
import UpgeadeModal from '../../components/UpgradeModal/index.vue';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { sleep } from '@src/render/utils/common';

const Store = useStore();
const gameState = toRef(Store.state[StoreModule.GAME])
const isAdmin = computed(() => Store.state[StoreModule.WN8].admin);
const open = ref(false);
const upgeadeModal = ref(null);

function handleClick() {
  Store.dispatch(`${StoreModule.GAME}/addGameInstallation`);
}

async function handleSearch() {
  try {
    Store.dispatch(`${StoreModule.LOADING}/setLoading`, true);
    const res = await addGamePathBySearch();
    Store.dispatch(`${StoreModule.LOADING}/setLoading`, false);
    Modal.confirm({
      title: '查找到以下目录：' + res + '。请确定是否为坦克世界俄服游戏安装目录',
      icon: h(ExclamationCircleOutlined),
      async onOk() {
        Store.dispatch(`${StoreModule.GAME}/addGameInstallation`, { path: res });
      },
      okText: '确认',
      cancelText: '取消',
      class: 'custom-error-dialog'
    });
  } catch (err: any) {
    console.log(err)
    Modal.error({
        title: `游戏查找失败，请手动选择游戏路径`,
        class: 'custom-error-dialog',
        okText: '知道了',
    });
  } finally {
    Store.dispatch(`${StoreModule.LOADING}/setLoading`, false);
  }
}

function handleOpenFolder(path: string) {
  ipcMessageTool('file', 'open-folder', { path });
}

async function handleCheckVersion() {
  // (window as any).electron.ipcRenderer.on('printUpdaterMessage', (message: any) => {
  //     console.log(message);
  // });
  // ipcMessageTool('updater', 'check-for-updates');
  open.value = true;
  await sleep(100);
  (upgeadeModal.value as any).handleStartCheckVersion();
}

function handleOpenAppData() {
  ipcMessageTool('file', 'open-add-data');
}
function handleClearAppData() {
  Modal.confirm({
      title: '当您遇到盒子功能异常，可以尝试清除盒子应用数据，此举将删除您添加的游戏路径和绑定的游戏账号，并重启盒子，确认继续？',
      icon: h(ExclamationCircleOutlined),
      async onOk() {
          try {
            const res = await deleteAppData();
            if (res.status) {
              await sleep(1000);
              restartApp()
            } else {
              Modal.error({
                title: `数据清除失败：${JSON.stringify(res.message)}`,
                class: 'custom-error-dialog',
                okText: '知道了',
              });
            }
          } catch(err) {
            Modal.error({
                title: `数据清除失败：${JSON.stringify(err)}`,
                class: 'custom-error-dialog',
                okText: '知道了',
            });
          }
      },
      okText: '确认',
      cancelText: '取消',
      class: 'custom-error-dialog'
  });
}
</script>


<style scoped lang="less">
.download {
    color: #f25322;
    box-shadow: none;
    background: 0 0;
    border: 2px solid #f25322;
    padding: 15px 20px;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        color: #fff;
        background: #f25322;
    }
}
.setup-wrapper {
  width: 1000px;
  .setup-item {
    margin-bottom: 50px;
  }
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
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    height: 44px;
    margin-left: 18px;
    span {
      z-index: 2;
      font-size: 14px;
      margin: 0;
      padding: 0;
    }
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
  .other-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .btn {
    width: 200px;
    height: 25px;
    text-align: center;
    line-height: 24px;
    margin-bottom: 15px;
    color: #b8b8a2;
    box-shadow: none;
    background: 0 0;
    border: 1px solid #b8b8a2;
    font-size: 12px;
    cursor: pointer;
    &:hover {
      color: #000;
      background: #b8b8a2;
    }
  }
}
</style>