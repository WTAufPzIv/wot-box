<template>
    <div
        class="page-container"
        v-if="!isLogin"
    >
        <header-bar></header-bar>
        <div class="main-wrapper" id="main-wrapper">
            <a-side></a-side>
            <div class="main-container">
                <slot></slot>
            </div>
        </div>
        <div class="bottom-bar">
            <StartGame class="start"></StartGame>
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

const route = useRoute();
const isLogin = computed(() => route.path === '/login')
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
}
.bottom-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background-color: rgb(24,24,24);
    .start {
        position: absolute;
        right: 30px;
        top: 50%;
        transform: translate( 0, -50%);
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
</style>