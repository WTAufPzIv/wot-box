<template>
    <a class="start-game stop" @click="handleStopGame" v-if="clientRun" key="stop">
        <PoweroffOutlined class="icon"/>
        <span>
            关闭游戏
        </span>
    </a>
    <a class="start-game start" @click="handleStartGame" v-else>
        <span>
            启动游戏
        </span>
    </a>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { StoreModule } from '@core/const/store';
import { startGame, stopClient } from '@core/utils/game';
import { computed } from 'vue';
import { Modal } from 'ant-design-vue';
import { PoweroffOutlined } from '@ant-design/icons-vue';

const Store = useStore();
const gameState = computed(() => Store.state[StoreModule.GAME])
const clientRun = computed(() => Store.state[`${StoreModule.GAME}`].clientRun);

function handleStartGame() {
    if (!gameState.value.gameInstallations?.path) {
        Modal.error({
            title: `请先进入设置选择游戏路径`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
        return;
    }
    (window as any).electron.ipcRenderer.send('window-control', 'minimize');
    startGame(gameState.value.gameInstallations?.path);
}

async function handleStopGame() {
    try {
        const res = await stopClient();
        if (!res.status) {
            Modal.error({
                title: `游戏关闭失败：${res.message}`,
                // title: `游戏关闭失败：${res.message}`,
                class: 'custom-error-dialog',
                okText: '知道了',
            });
        }
    } catch (err: any) {
        Modal.error({
            title: `游戏关闭失败：${err}`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
    }
}
</script>

<style lang="less" scoped>
.start-game {
    padding: 0 50px;
    background-size: 1px 100%,1px 100%,cover;
    display: -ms-inline-flexbox;
    display: inline-flex;
    -ms-flex-align: center;
    align-items: center;
    -ms-flex-pack: center;
    justify-content: center;
    vertical-align: middle;
    font-size: 24px;
    font-weight: 700;
    line-height: 14px;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 1px;
    position: relative;
    box-sizing: border-box;
    height: 60px;
    white-space: nowrap;
    margin-left: 24px;
    cursor: pointer;
    transition: color .15s ease-out;
    text-shadow: 0 -1px rgba(71,0,0,.3);
    span {
        z-index: 2;
        font-size: 22px;
        margin: 0;
        padding: 0;
    }
}
.start {
    color: #f9f5e1;
    box-shadow: 0 2px 0 #661000, inset 0 0 8px rgba(255,210,0,.1), inset 0 1px 0 #fab81b, inset 0 -1px 0 #ef4511;
    background: linear-gradient(to bottom,#fab81b 0%,#ef4511 100%) no-repeat 0,linear-gradient(to bottom,#fab81b 0%,#ef4511 100%) no-repeat 100%,#f25322 linear-gradient(to bottom,#f60 0%,#a6230e 100%) no-repeat;
}
.start:after {
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
.start:hover {
    color: #f9f5e1;
    cursor: pointer;
}
.start:hover:after {
    opacity: 1;
}


.stop {
    background: rgba(255,255,255,0.4);
    color: #000;
    box-shadow: 0 2px 0 #222, inset 0 0 8px rgba(255,210,0,.1), inset 0 1px 0 #666, inset 0 -1px 0 #888;
    display: flex;
    flex-direction: row;
    align-items: center;
    .icon {
        margin-top: 2px;
        margin-right: 10px;
        font-weight: bolder;
    }
}
.stop:after {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    content: "";
    box-shadow: inset 0 0 8px rgba(255, 0, 0, .1), inset 0 1px 0 #ff0000, inset 0 -1px 0 #ff0000;
    background: linear-gradient(to bottom, #ff0000 0%, #ff0000 100%) no-repeat 0, linear-gradient(to bottom, #ff0000 0%, #ff0000 100%) no-repeat 100%, #ff0000 linear-gradient(to bottom, #ff0000 0%, #c2530a 100%) no-repeat;
    background-size: 1px 100%,1px 100%,cover;
    z-index: 1;
    opacity: 0;
    transition: opacity 0.15s ease-out;
    will-change: opacity;
}
.stop:hover {
    color: #f9f5e1;
    cursor: pointer;
}
.stop:hover:after {
    opacity: 1;
}
</style>