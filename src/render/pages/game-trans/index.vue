<template>
    <div class="game-trans-page" v-if="gameState.gameInstallations">
        <div class="text-info installed-trans">
            <div class="title">
                <p>{{ installedTrans && installedTrans.length > 0 ? '已安装汉化：' : '未安装汉化' }}</p>
                <span v-for="item in installedTrans">{{ item.name }} ———— 更新时间：{{ formatDate(item.updataTime) }}</span>
            </div>
            <div class="download" @click="handleRemoveTrans()" v-if="installedTrans && installedTrans.length > 0">卸载</div>
        </div>
        <div class="text-info">
            <div class="title">
                <p>{{ alhh.name }}</p>
                <span>更新时间：{{ formatDate(alhh.updataTime) }}</span>
            </div>
            <div class="download" @click="handleClick(alhh)">安装</div>
        </div>
        <img :src="alhh.img" alt="">
        <div class="text-info">
            <div class="title">
                <p>{{ gfhh.name }}</p>
                <span>更新时间：{{ formatDate(gfhh.updataTime) }}</span>
            </div>
            <div class="download" @click="handleClick(gfhh)">安装</div>
        </div>
        <img :src="gfhh.img" alt="">
    </div>
    <div class="game-path-error" v-if="!gameState.gameInstallations">
        <InfoCircleOutlined />
        <p>请先设置游戏路径</p>
    </div>
    <a-modal
        v-model:open="open"
        width="1000px"
        wrap-class-name="mod-detail-dialog"
        :footer="null"
        :centered="true"
        :destroyOnClose="true"
    >
        <div
            class="mod-detail-head-bg"
            :style="{
                backgroundImage: `url(${currentMod.img})`
            }"
        >
            <div class="mask"></div>
        </div>
        <div class="mod-detail-head">
            <img class="head-img" :src="currentMod.img" alt="">
            <div>
                <p class="title">{{ currentMod.name }}</p>
                <p class="other">更新时间：{{ formatDate(currentMod.updataTime) }}</p>
                <p class="other">支持的游戏版本：{{ currentMod.gameVersion }}</p>
                <p class="other">作者：{{ currentMod.author }}</p>
                <p class="other">搬运：{{ currentMod.transport }}</p>
                <p class="other">大小：{{ currentMod.size }}</p>
            </div>
            <div
                class="download before"
                @click="handleDownload(currentMod)"
                v-if="!downloading"
            >下载安装</div>
            <div
                class="download after"
                @click="handleDownload(currentMod)"
                v-if="downloading"
            >
                <div class="progress" :style="{ width: `${progress}%` }"></div>
                <p>正在下载 {{ progress }}%  </p>
            </div>
            <div class="speed" v-if="downloading">
                {{ speed }} MB/S
            </div>
        </div>
        <v-md-editor
            :model-value="currentMod.detailMd"
            mode="preview"
        ></v-md-editor>
    </a-modal>
</template>


<script setup lang="ts">
import {
    InfoCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { StoreModule } from '@core/const/store';
import { toRef, computed, ref, h } from 'vue';
import { useStore } from 'vuex';
import { Modal } from 'ant-design-vue';
import { throttle, formatDate } from '@src/render/utils/common';
import { ipcMessageTool, removeFileByFileList } from '@core/utils/game';

const Store = useStore();
const gameState = toRef(Store.state[StoreModule.GAME])
const alhh = computed(() => Store.state[StoreModule.MODS].name['艾伦汉化（亚服版）']);
const gfhh = computed(() => Store.state[StoreModule.MODS].name['车辆汉化（扩展）']);
const open = ref(false);
const currentMod: any = ref({});
const progress = ref(0);
const speed = ref(0);
const downloading = ref(false);

Store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
const installedTrans = computed(() => Store.state[StoreModule.MODS].installedTrans)

async function handleDownload(mod: any) {
    if (!gameState.value.gameInstallations) {
        Modal.error({
            title: `请先设置游戏路径`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
        return;
    }
    if (!mod.download) {
        Modal.error({
            title: '下载链接不存在，请加群联系大德盒子管理员',
            class: 'custom-error-dialog'
        });
        return;
    }
    downloading.value = true;
    const setSpeed = throttle(function(sp: any) {
        speed.value = !isFinite(sp) ? 0 : sp;
    }, 1000);
    (window as any).electron.ipcRenderer.on('download-progress', ({ progress: pro, speed: sp }: any) => {
        progress.value = pro;
        // @ts-ignore
        setSpeed(sp)
    });
    const res = await ipcMessageTool(
        'download-file',
        'download',
        JSON.stringify({
            path: gameState.value.gameInstallations?.path,
            url: mod.download,
            mod,
        }),
        'download-complete'
    )
    downloading.value = false;
    open.value = false;
    if (res.status) {
        Modal.success({
            title: '安装成功',
            class: 'custom-error-dialog'
        });
        Store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
    } else {
        Modal.error({
            title: `安装失败${res.message}`,
            class: 'custom-error-dialog'
        });
    }
    progress.value = 0;
    speed.value = 0;
}

function handleClick(mod: any) {
    currentMod.value = mod;
    open.value = true
}

async function removeTrans() {
    const res = await removeFileByFileList([
        `${gameState.value.gameInstallations?.path}\\res_mods\\${gameState.value.gameInstallations?.gameVersion}\\text`,
    ]);
    if (res.status) {
        Store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
        Modal.success({
            title: '已卸载',
            class: 'custom-error-dialog'
        });
    } else {
        Modal.error({
            title: `汉化包卸载失败：${res.message}`,
            class: 'custom-error-dialog'
        });
    }
}

async function handleRemoveTrans() {
    Modal.confirm({
        title: `注意：汉化包无法单独删除，该操作将删除所有汉化包！请再次确认！`,
        icon: h(ExclamationCircleOutlined),
        onOk() {
            removeTrans();
        },
        okText: '确认卸载',
        cancelText: '取消',
        class: 'custom-error-dialog'
    });
}
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
.installed-trans {
    width: 1000px;
    height: 200px;
    border-bottom: 1px solid transparent;
    border-bottom-color: #333335;
}
.game-trans-page {
    width: 1000px;
    .text-info {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        .title {
            color: #e9e2bf;
            font-size: 24px;
            font-weight: bolder;
            margin: 24px 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            p {
                margin: 0;
            }
            span {
                font-size: 16px;
                font-weight: normal;
                margin-top: 30px;
            }
        }
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
    }
    img {
        margin-bottom: 50px;
    }
}
</style>
