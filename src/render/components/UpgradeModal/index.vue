<template>
    <a-modal
        :open="isopen"
        @cancel="handleCancel"
        width="600px"
        wrap-class-name="upgrade-detail-dialog"
        :footer="null"
        :maskClosable="false"
        :centered="true"
        :destroyOnClose="true"
        :closable="true"
    >
        <div class="upgrade-wrapper">
            <p class="text">
                <LoadingOutlined class="loading-span" v-if="message === '正在检查更新'" />
                <span>{{ message }}</span>
            </p>
            <!-- <div
                class="download before"
                @click="handleCancel()"
            >好的</div> -->
            <div
                class="download before"
                @click="handleCancel()"
                v-if="message === '当前已是最新版本'"
            >好的</div>
            <div
                class="download before"
                @click="handleCancel()"
                v-if="message === '更新出错'"
            >稍后重试</div>
            <div
                class="download before"
                @click="handleDownload()"
                v-if="message.includes('检测到新版本')"
            >立即更新</div>
            <div
                class="download after"
                v-if="message === '下载中'"
            >
                <div class="progress" :style="{ width: `${progress}%` }"></div>
                <p>下载中 {{ progress }}%  </p>
            </div>
            <div
                class="download before"
                @click="handleInstall()"
                v-if="message === '下载完成'"
            >立即安装</div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import {
    LoadingOutlined,
} from '@ant-design/icons-vue'
import { computed, ref, defineProps, defineEmits } from 'vue';
import { ipcMessageTool } from '@core/utils/game';

const props = defineProps<{
    open: any;
}>();
const emit = defineEmits();

const isopen = computed(() => props.open)
const message = ref('正在检查更新')
const progress = ref(0);

function handleCancel() {
    emit('close');
}

function handleStartCheckVersion() {
  (window as any).electron.ipcRenderer.on('printUpdaterMessage', (msg: any) => {
    message.value = msg;
  });
  ipcMessageTool('updater', 'check-for-updates');
}

function handleDownload() {
    (window as any).electron.ipcRenderer.on('updatadownloadProgress', (progressObj: any) => {
        progress.value = progressObj.percent.toFixed(1)
    });
    (window as any).electron.ipcRenderer.on('update-downloaded', (msg: any) => {
        message.value = msg;
    });
    ipcMessageTool('updater', 'comfirm-update');
}

function handleInstall() {
    ipcMessageTool('updater', 'update-now');
}

defineExpose({ handleStartCheckVersion })
</script>

<style lang="less" scoped>
.upgrade-wrapper {
    width: 600px;
    height: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    .text {
        font-size: 24px;
        color: #b8b8a2;
        margin-top: 30px;
        .loading-span {
            margin-right: 24px;
        }
    }
}
.download {
    position: relative;
    width: 300px;
    height: 50px;
    color: #f25322;
    box-shadow: none;
    background: 0 0;
    border: 2px solid #f25322;
    font-weight: bold;
    text-align: center;
    line-height: 46px;
    margin-top: 16px;
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
        transition: width 0.15s;
    }
    p {
        color: #fff;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }
}
</style>
<style lang="less">
.upgrade-detail-dialog {
    .ant-modal-content {
        background-color: rgb(28,28,30);
        height: 200px;
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
}
</style>