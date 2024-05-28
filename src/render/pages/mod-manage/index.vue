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
                    :src="item.img"
                    alt=""
                />
                <div
                    v-if="gameState.gameInstallations?.gameVersion === item.gameVersion
                        && modListDataByName[item.name]
                        && modListDataByName[item.name].gameVersion === item.gameVersion
                        && modListDataByName[item.name].updataTime !== item.updataTime
                    "
                    class="version-tip"
                >
                    <CloudUploadOutlined />
                    <p>有新版本</p>
                </div>
                <div class="info">
                    <p class="name">{{ item.name }}</p>
                    <p class="version">对应的游戏版本：{{ item.gameVersion }}</p>
                    <p class="version">分类： {{ item.categorize }}</p>
                </div>
                <div class="mask" v-if="gameState.gameInstallations?.gameVersion !== item.gameVersion">
                    <DashboardOutlined />
                    <p>已过期</p>
                </div>
                <div
                    v-if="gameState.gameInstallations?.gameVersion === item.gameVersion
                        && modListDataByName[item.name]
                        && modListDataByName[item.name].gameVersion === item.gameVersion
                        && modListDataByName[item.name].updataTime !== item.updataTime
                    "
                    class="updata"
                    @click="gotoDetail(modListDataByName[item.name])"
                >更新</div>
                <div class="download" @click="handleRemove(item)">卸载</div>
            </div>
        </div>
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
                <p class="other">大小：{{ currentMod.size }}</p>
            </div>
            <div
                class="download before"
                @click="handleDownload(currentMod)"
                v-if="!downloading"
            >下载安装</div>
            <div
                class="download after"
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
import { StoreModule } from '@core/const/store';
import { computed, h, ref, toRef } from 'vue';
import { useStore } from 'vuex';
import {
    DashboardOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined,
    CloudUploadOutlined
} from '@ant-design/icons-vue'
import { clearAllMods, ipcMessageTool, removeFileByFileList } from '@core/utils/game';
import { Modal } from 'ant-design-vue';
import { throttle, formatDate } from '@src/render/utils/common';

const Store = useStore();
const modState = toRef(Store.state[StoreModule.MODS])
const gameState = toRef(Store.state[StoreModule.GAME])
const modListDataByName: any = computed(() => Store.state[StoreModule.MODS].name)

const progress = ref(0);
const speed = ref(0);
const downloading = ref(false);
const open = ref(false);
const currentMod: any = ref({});
const installedVip: any = computed(() => Store.state[StoreModule.MODS].installedVip)

Store.dispatch(`${StoreModule.MODS}/initInstalled`);

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
    // 顺便检测是否有解压到mods文件夹的vip插件，有的话一并删除
    if (installedVip.value[mod.name]) {
        await removeFileByFileList([ mod.path.replace('dadevip', 'mods') ]);
        const temp: any = {};
        Object.values(Store.state[StoreModule.MODS].installedVip).filter((item: any) => item.name !== mod.name).forEach((item: any) => {
            temp[item.name] = { ...item };
        });
        Store.dispatch(`${StoreModule.MODS}/setInstalledVip`, temp)
    }
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
        title: `此操作会清空mods和res_mods下的所有插件，包括汉化包和非盒子内下载的插件，请再次确认？`,
        icon: h(ExclamationCircleOutlined),
        async onOk() {
            const res = await clearAllMods(`${gameState.value.gameInstallations?.path}`, gameState.value.gameInstallations?.gameVersion);
            if (res.status) {
                Store.dispatch(`${StoreModule.MODS}/initInstalled`);
                Store.dispatch(`${StoreModule.MODS}/initInstalledTrans`);
                Store.dispatch(`${StoreModule.MODS}/setInstalledVip`, {});
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

function gotoDetail(mod: any) {
    currentMod.value = mod;
    open.value = true;
}

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
            mod: mod,
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
        Store.dispatch(`${StoreModule.MODS}/initInstalled`);
    } else {
        Modal.error({
            title: `安装失败${res.message}`,
            class: 'custom-error-dialog'
        });
    }
    progress.value = 0;
    speed.value = 0;
}
</script>

<style scoped lang="less">
.mode-manage-page {
    width: 1000px;
}
.mod-list {
    width: 1000px;
    height: calc(100vh - 260px);
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
    .version-tip {
        position: absolute;
        left: 0;
        top: 0;
        color: #000;
        background-color: #fab81b;
        padding: 6px 12px;
        font-size: 14px;
        font-weight: bold;
        display: flex;
        align-items: center;
        span {
            font-weight: bold;
            font-size: 18px;
        }
        p {
            margin: 0 8px;
        }
    }
    .info {
        width: 650px;
        height: 130px;
        margin-left: 15px;
        position: absolute;
        left: 140px;
        top: 15px;
    }
    .name {
        font-size: 20px;
        font-weight: bold;
        color: #b8b8a2;
        margin-top: 10px;
    }
    .version {
        font-size: 14px;
        color: #b8b8a2;
        margin-top: 10px;
        opacity: 0.5;
    }
    .updata {
        position: absolute;
        right: 150px;
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
            font-size: 30px;
            color: #b8b8a2;
        }
        p {
            color: #b8b8a2;
            text-align: center;
            margin: 0 20px;
            font-size: 24px;
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
