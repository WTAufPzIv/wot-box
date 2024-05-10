<template>
    <div class="mode-overview-page" v-if="gameState.gameInstallations">
        <div class="tab">
            <div
            :class="['tab-item', selectedTab === item ? 'active' : '']"
            @click="handleClickTab(item)"
            v-for="item in tabs"
            >{{ item }}</div>
        </div>
        <div class="mod-list">
            <div
                class="mod-item"
                v-for="item in modListData[selectedTab]"
                v-show="item.gameVersion === gameState.gameInstallations?.gameVersion"
            >
                <img
                    v-if="refresh"
                    class="image"
                    :src="item.headImg"
                    alt=""
                />
                <div class="info">
                    <p class="name" @click="gotoDetail(item)">{{ item.name }}</p>
                    <p class="time">更新时间：{{ formatDate(item.updataTime) }}</p>
                    <p class="version">支持的游戏版本：{{ item.gameVersion }}</p>
                </div>
                <div class="download" @click="gotoDetail(item)">下载安装</div>
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
                backgroundImage: `url(${currentMod.headImg})`
            }"
        >
            <div class="mask"></div>
        </div>
        <div class="mod-detail-head">
            <img class="head-img" :src="currentMod.headImg" alt="">
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
import { ref, toRef } from 'vue';
import { formatDate, throttle } from '../../utils/common';
import { Modal } from 'ant-design-vue';
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { ipcMessageTool } from '@core/utils/game';
import { useStore } from 'vuex';
import { StoreModule } from '@core/const/store';
const Store = useStore();
const modState = toRef(Store.state[StoreModule.MODS])
const gameState = toRef(Store.state[StoreModule.GAME])

const tabs: any = ref([]);
const selectedTab :any = ref('');
const refresh = ref(true);
const modListData: any = ref({});
const open = ref(false);
const currentMod: any = ref({});
const progress = ref(0);
const speed = ref(0);
const downloading = ref(false);

Store.dispatch(`${StoreModule.MODS}/initModData`).then(() => {
    tabs.value = Object.keys(modState.value.categorize)
    modListData.value = modState.value.categorize;
    selectedTab.value = tabs.value[0]
})

function handleClickTab(key: any) {
    refresh.value = false;
    selectedTab.value = key
    setTimeout(() => {
        refresh.value = true;
    }, 50)
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
            path: `${gameState.value.gameInstallations?.path}\\mods\\${gameState.value.gameInstallations?.gameVersion}\\[大德]${mod.name}-${mod.updataTime}.wotmod`,
            url: mod.download,
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
}
</script>

<style scoped lang="less">
.mode-overview-page {
    width: 1000px;
    // background: yellow;
    // display: flex;
    // flex-direction: row;
}
.tab {
  width: 1000px;
  display: flex;
  flex-direction: row;
  color: #7b7b6e;
  font-size: 14px;
  position: relative;
  text-align: center;
  z-index: 2;
  margin-top: 20px;
  .tab-item {
    color: #ffffff90;
    background: #ffffff10;
    align-items: center;
    border-right: 1px solid #504f47;
    cursor: pointer;
    justify-content: center;
    padding: 10px 0;
    width: 100px;
  }
  .tab-item:hover {
    color: #f25322b9;
    background: #ffffff1d;
  }
  .active {
    color: #f25322b9;
    font-weight: bold;
    background: #ffffff1d;
  }
}
.mod-list {
    width: 1000px;
    height: calc(100vh - 170px);
    margin-top: 20px;
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
        cursor: pointer;
        &:hover {
            color: #f25322;
        }
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

<style lang="less">
.custom-error-dialog {
    .ant-modal-content {
        background-color: rgb(28,28,30);
        .ant-modal-confirm-title {
            color: #fff;;
        }
        button {
            padding: 0 20px;
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
            font-size: 14px;
            font-weight: 700;
            line-height: 14px;
            color: #f9f5e1;
            text-transform: uppercase;
            text-shadow: 0 -1px rgba(71,0,0,.3);
            text-decoration: none;
            border-radius: 1px;
            position: relative;
            box-sizing: border-box;
            height: 44px;
            white-space: nowrap;
            margin-left: 24px;
            cursor: pointer;
            transition: color .15s ease-out;
            span {
                z-index: 2;
                font-size: 14px;
                margin: 0;
                padding: 0;
                color: #f9f5e1;
            }
        }
        button:after {
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
        button:hover {
            color: #f9f5e1;
            cursor: pointer;
        }
        button:hover:after {
            opacity: 1;
        }
    }
    .ant-modal-close {
        color: #fff;
    }
}
.mod-detail-dialog {
    .ant-modal-content {
        background-color: rgb(28,28,30);
        height: calc(100vh - 140px);
        overflow-x: hidden;
        overflow-y: scroll;
        padding: 0;
        &::-webkit-scrollbar {
            display: none;
        }
    }
    .ant-modal-close {
        color: #fff;
    }
    .mod-detail-head-bg {
        width: 1000px;
        height: 300px;
        position: absolute;
        overflow: hidden;
        background: red;
        // background-size: cover;
        filter: blur(10px);
        -webkit-filter: blur(10px); /* 为了兼容 Webkit 内核的浏览器 */
        left: 0;
        top: 0;
    }
    .mask {
        width: 1000px;
        height: 300px;
        position: absolute;
        left: 0;
        top: 0;
        background-color: rgba(0,0,0,0.9);
        
    }
    .mod-detail-head {
        width: 1000px;
        height: 300px;
        z-index: 100;
        position: relative;
        display: flex;
        .head-img {
            width: 300px;
        }
        .title {
            font-size: 36px;
            color: #b8b8a2;
            margin-top: 10px;
            margin-left: 40px;
            font-weight: bold;
        }
        .other {
            font-size: 14px;
            color: #b8b8a2;
            margin-left: 40px;
            font-weight: bold;
        }
        .download {
            position: absolute;
            bottom: 50px;
            width: 300px;
            height: 50px;
            right: 40px;
            color: #f25322;
            box-shadow: none;
            background: 0 0;
            border: 2px solid #f25322;
            font-weight: bold;
            text-align: center;
            line-height: 46px;
        }
        .before {
            cursor: pointer;
            &:hover {
                color: #fff;
                background: #f25322;
            }
        }
        .after {
            .progress {
                position: absolute;
                left: 0;
                top: 0;
                height: 48px;
                width: 50%;
                background: #f25322;
                z-index: -1;
                transition: width 0.15s;
            }
            p {
                color: #fff;
            }
        }
        .speed {
            color: #fff;
            position: absolute;
            bottom: 15px;
            right: 160px;
            font-size: 18px;
        }
}
    
}
</style>