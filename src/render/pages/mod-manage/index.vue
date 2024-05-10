<template>
    <div class="mode-manage-page" v-if="gameState.gameInstallations">
        <div class="operation">
            <div class="btn" @click="handleOpenFolder('mods')">打开mods文件夹</div>
            <div class="btn" @click="handleOpenFolder('res_mods')">打开res_mods文件夹</div>
            <div class="btn" @click="removeAllMods()">一键删除所有插件(纯净客户端)</div>
        </div>
        <div class="mod-list">
            <div
                class="mod-item"
                v-for="item in modState.installed"
            >
                <img
                    class="image"
                    :src="item.headImg"
                    alt=""
                />
                <div class="info">
                    <p class="name">{{ item.name }}</p>
                    <p class="time">更新时间：{{ formatDate(item.updataTime) }}</p>
                    <p class="version">对应的游戏版本：{{ item.gameVersion }}</p>
                </div>
                <div class="mask" v-if="gameState.gameInstallations?.gameVersion !== item.gameVersion">
                    <DashboardOutlined />
                    <p>已过期</p>
                </div>
                <div class="download" @click="handleRemove(item)">卸载</div>
            </div>
        </div>
    </div>
    <div class="game-path-error" v-if="!gameState.gameInstallations">
        <InfoCircleOutlined />
        <p>请先设置游戏路径</p>
    </div>
</template>


<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { h, toRef } from 'vue';
import { useStore } from 'vuex';
import { formatDate } from '../../utils/common';
import {
    DashboardOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons-vue'
import { clearAllMods, ipcMessageTool, removeFileByFileList } from '@core/utils/game';
import { Modal } from 'ant-design-vue';

const Store = useStore();
const modState = toRef(Store.state[StoreModule.MODS])
const gameState = toRef(Store.state[StoreModule.GAME])

async function handleRemove(mod: any) {
    Modal.confirm({
        title: `确认卸载插件：${mod.name}？`,
        icon: h(ExclamationCircleOutlined),
        onOk() {
            remove(mod);
        },
        okText: '确认卸载',
        cancelText: '取消',
        class: 'custom-error-dialog'
    });
}

async function remove (mod: any) {
    const res = await removeFileByFileList([ mod.path ]);
    if (res.status) {
        Store.dispatch(`${StoreModule.MODS}/initInstalled`);
        Modal.success({
            title: '已卸载',
            class: 'custom-error-dialog'
        });
    } else {
        Modal.error({
            title: `插件卸载失败：${res.message}`,
            class: 'custom-error-dialog'
        });
    }
}

function handleOpenFolder(path: string) {
    if (!gameState.value.gameInstallations) {
        Modal.error({
            title: `请先设置游戏路径`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
        return;
    }
    ipcMessageTool('file', 'open-folder', { path: `${gameState.value.gameInstallations?.path}\\${path}` });
}

function removeAllMods() {
    if (!gameState.value.gameInstallations) {
        Modal.error({
            title: `请先设置游戏路径`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
        return;
    }
    Modal.confirm({
        title: `此操作会清空mods和res_mods下的所有插件，包括非盒子内下载的插件，请再次确认？`,
        icon: h(ExclamationCircleOutlined),
        async onOk() {
            const res = await clearAllMods(`${gameState.value.gameInstallations?.path}`, gameState.value.gameInstallations?.gameVersion);
            if (res.status) {
                Store.dispatch(`${StoreModule.MODS}/initInstalled`);
                Modal.success({
                    title: '插件已清空',
                    class: 'custom-error-dialog'
                });
            } else {
                Modal.error({
                    title: '清空插件错误' + res.message,
                    class: 'custom-error-dialog'
                });
            }
        },
        okText: '确认清空',
        cancelText: '取消',
        class: 'custom-error-dialog'
    });
}
</script>

<style scoped lang="less">
.mode-manage-page {
    width: 1000px;
}
.mod-list {
    width: 1000px;
    height: calc(100vh - 160px);
    margin-top: 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    &::-webkit-scrollbar-track {
      display: none;
    }
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.1);
    }
}
.mod-item {
    position: relative;
    width: 1000px;
    height: 150px;
    // background-color: red;
    border-bottom: 1px solid transparent;
    border-bottom-color: #333335;
    user-select: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    .image{
        width: 130px;
        height: 130px;
    }
    .info {
        width: 650px;
        // background: yellow;
        height: 130px;
        margin-left: 15px;
        position: absolute;
        left: 140px;
    }
    .name {
        font-size: 20px;
        font-weight: bold;
        color: #b8b8a2;
        margin-top: 10px;
    }
    .time {
        font-size: 14px;
        color: #b8b8a2;
        margin-top: 10px;
        opacity: 0.5;
    }
    .version {
        font-size: 14px;
        color: #b8b8a2;
        margin-top: 10px;
        opacity: 0.5;
    }
    .download {
        position: absolute;
        right: 50px;
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
    .mask {
        position: absolute;
        left: 0;
        top: 0;
        width: 1000px;
        height: 150px;
        background: rgba(0,0,0,0.7);
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        span {
            display: block;
            font-size: 40px;
            color: #b8b8a2;
        }
        p {
            color: #b8b8a2;
            text-align: center;
            margin: 0 20px;
            font-size: 36px;
            // margin-top: 50px;
        }
    }
}
.operation {
    display: flex;
    margin-top: 15px;
    .btn {
        // position: absolute;
        right: 50px;
        margin-right: 30px;
        color: #b8b8a2;
        box-shadow: none;
        background: 0 0;
        border: 2px solid #b8b8a2;
        padding: 12px 16px;
        font-weight: bold;
        cursor: pointer;
        &:hover {
            color: #000;
            background: #b8b8a2;
        }
    }
}
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
