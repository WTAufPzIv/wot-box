<template>
    <a class="start-game start" @click="handleStartGame">
        <span>
            启动游戏
        </span>
    </a>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { StoreModule } from '@core/const/store';
import { startGame } from '@core/utils/game';
import { computed } from 'vue';
import { Modal } from 'ant-design-vue';

const Store = useStore();
const gameState = computed(() => Store.state[StoreModule.GAME])

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
</script>

<style lang="less" scoped>
.start-game {
    padding: 0 50px;
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
    font-size: 24px;
    font-weight: 700;
    line-height: 14px;
    color: #f9f5e1;
    text-transform: uppercase;
    text-shadow: 0 -1px rgba(71,0,0,.3);
    text-decoration: none;
    border-radius: 1px;
    position: relative;
    box-sizing: border-box;
    height: 60px;
    white-space: nowrap;
    margin-left: 24px;
    cursor: pointer;
    transition: color .15s ease-out;
    span {
        z-index: 2;
        font-size: 22px;
        margin: 0;
        padding: 0;
        color: #f9f5e1;
    }
}
.start-game:after {
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
.start-game:hover {
    color: #f9f5e1;
    cursor: pointer;
}
.start-game:hover:after {
    opacity: 1;
}
</style>