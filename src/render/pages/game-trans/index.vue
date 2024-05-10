<template>
    <div class="game-path-error" v-if="!gameState.gameInstallations">
        <InfoCircleOutlined />
        <p>请先设置游戏路径</p>
    </div>
</template>


<script setup lang="ts">
import {
    InfoCircleOutlined
} from '@ant-design/icons-vue'
import { StoreModule } from '@core/const/store';
import { toRef } from 'vue';
import { useStore } from 'vuex';

const Store = useStore();
const gameState = toRef(Store.state[StoreModule.GAME])

</script>

<style scoped lang="less">
.game-path-error {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    p {
        margin: 0 12px;
        padding: 0;
        font-size: 24px;
        color: #b8b8a2;
    }
    span {
        color: #fab81b;
        font-size: 28px;
    }
}
</style>
