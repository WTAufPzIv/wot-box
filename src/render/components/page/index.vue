<template>
    <div
        class="page-container"
        v-if="!isLogin"
    >
        <header-bar></header-bar>
        <div class="main-wrapper" id="main-wrapper">
            <a-side></a-side>
            <div class="loading-wrapper" v-if="isLoading">
                <div class="loading-icon">
                    <div class="loading1"></div>
                    <div class="loading2"></div>
                </div>
            </div>
            <div class="main-container">
                <slot></slot>
            </div>
        </div>
        <div class="bottom-bar">
            <div class="run-status">
                <div class="run-item">
                    <img src="@render/assets/lgc_api.png" alt="">
                    <span>Lesta Game Center：</span>
                    <span :style="{ color: lgcRun ? '#8FB939' : '#fffbed44' }">{{ lgcRun ? '正在运行' : '未运行' }}</span>
                </div>
                <div class="run-item">
                    <img src="@render/assets/tanki.png" alt="">
                    <span>World Of Tanks客户端：</span>
                    <span :style="{ color: clientRun ? '#8FB939' : '#fffbed44' }">{{ clientRun ? '正在运行' : '未运行' }}</span>
                </div>
            </div>
            <StartGame class="btn"></StartGame>
        </div>
    </div>

    <div v-else class="login-page">
        <div class="login-page-container">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import HeaderBar from '../HeaderBar/index.vue';
import ASide from '../Aside/index.vue';
import StartGame from '../StartGame/index.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useStore } from 'vuex';
import { StoreModule } from '@core/const/store';

const route = useRoute();
const Store = useStore();
const isLoading = computed(() => Store.state[`${StoreModule.LOADING}`].loading)
const isLogin = computed(() => route.path === '/login')
const lgcRun = computed(() => Store.state[`${StoreModule.GAME}`].lgcRun);
const clientRun = computed(() => Store.state[`${StoreModule.GAME}`].clientRun);
</script>

<style lang="less" scoped>
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.page-container {
    width: 100%;
    position: relative;
    flex-direction: column;
}
.main-wrapper{
    display: flex;
    flex-direction: row;
    position: relative;
}
.bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background-color: rgb(24,24,24);
    .btn {
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translate( 0, -50%);
    }
    .run-status {
        position: absolute;
        right: 300px;
        height: 100px;
        padding: 10px;
        .run-item {
            margin-top: 10px;
            img {
                width: 24px;
                height: 24px;
            }
            span {
                color: #fffbed;
                font-size: 16px;
                margin-left: 10px;
            }
        }
    }
}
.main-container {
    flex-grow: 1;
    height: calc(100vh - 160px);
    background-color: rgb(28,28,30);
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 12px;
    overflow-x: hidden;
    overflow-y: scroll;
    position: relative;
    &::-webkit-scrollbar {
        display: none;
    }
}
.wrapper::-webkit-scrollbar {
    width: 0;
}
.login-page {
    width: 100vw;
    position: relative;
    flex-direction: column;
    .login-page-container {
        width: 100vw;
        height: 100vh;
        background-color: rgb(28,28,30);
        display: flex;
        flex-direction: row;
        justify-content: center;
        overflow-x: hidden;
        overflow-y: scroll;
        &::-webkit-scrollbar {
            display: none;
        }
    }
}
.loading-wrapper {
    width: calc(100vw - 160px);
    height: calc(100vh - 160px);
    background: rgba(0,0,0,0.8);
    position: absolute;
    left: 160px;
    top: 0;
    z-index: 999;
    .loading-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        margin: 9px 0 0;
        will-change: transform;
        transform: translate(-50%, -50%);
        width: 114px;
        height: 114px;
        text-align: center;
        z-index: 9999;
        .loading1 {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: url('@render/assets/loading1.svg') center no-repeat;
            animation: rotate 3s linear infinite;
            z-index: 9999;
        }
        .loading2 {
            position: absolute;
            transform: translate(0);
            will-change: transform;
            top: 6px;
            right: 0;
            bottom: 0;
            left: 0;
            background: url("@render/assets/loading2.svg") center no-repeat;
            z-index: 9999;
        }
    }
}
</style>