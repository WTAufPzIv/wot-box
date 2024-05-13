<template>
    <div class="main-wrapper">
        <div class="header">
            <div class="right">
                <CloseOutlined class="win-ctrl" @click="handleClose" />
            </div>
        </div>
        <div class="login-mian">
            <div class="title">
                <img src="@render/assets/wotlogo.png" alt="">
                <p>大德盒子</p>
            </div>
            <template v-if="forget">
                <div class="input-wrapper">
                    <a-input
                        v-model:value="username"
                        size="large"
                        placeholder="账号"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="input-wrapper">
                    <a-input
                        v-model:value="superPassword"
                        size="large"
                        placeholder="超级密码"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="input-wrapper">
                    <a-input
                        v-model:value="password"
                        size="large"
                        placeholder="新密码"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="login-btn" @click="HandleForget()">找回密码</div>
                <p class="forget" @click="forget=false">返回登录</p>
            </template>
            <template v-else>
                <div class="tab">
                    <div :class="['tab-item', active === 'login' ? 'tab-active' : '']" @click="active='login'">
                        <p>登录</p>
                    </div>
                    <div :class="['tab-item', active === 'signup' ? 'tab-active' : '']" @click="active='signup'">
                        <p>注册</p>
                    </div>
                </div>
                <div class="input-wrapper">
                    <a-input
                        v-model:value="username"
                        size="large"
                        placeholder="账号"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="input-wrapper">
                    <a-input
                        v-model:value="password"
                        size="large"
                        placeholder="密码"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="input-wrapper" v-if="active === 'signup'">
                    <a-input
                        v-model:value="superPassword"
                        size="large"
                        placeholder="超级密码"
                        :bordered="false"
                        class="custom-input"
                    />
                </div>
                <div class="login-btn" @click="loginAndSignup">{{ active === 'login' ? '登录' : '注册' }}</div>
                <p class="forget" v-if="active === 'login'" @click="forget=true">找回密码</p>
            </template>
        </div>
    </div>
    <div class="loading" v-show="loading">
        <div class="loading-icon">
            <div class="loading1"></div>
            <div class="loading2"></div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { CloseOutlined } from '@ant-design/icons-vue';
import { closeLoginAndOpenMain } from '@core/utils/game';
import { handleFetchFoeget, handleFetchLogin, handleFetchSignup } from '@src/render/utils/fetch';
import { computed, ref, watch } from 'vue';
// import { sleep } from '@src/render/utils/common';
import { useStore } from 'vuex';
import { StoreModule } from '@core/const/store';
import { Modal } from 'ant-design-vue';
import { sleep } from '@src/render/utils/common';

const username = ref('');
const password = ref('');
const superPassword = ref('')
const loading = ref(false);
const active = ref('login')
const forget = ref(false);
const Store = useStore();
const storeAccount = computed(() => Store.state[StoreModule.USER].account)
const storePassword = computed(() => Store.state[StoreModule.USER].password)

watch(storeAccount, (newVal) => {
    username.value = newVal
})

watch(storePassword, (newVal) => {
    password.value = newVal
})

function handleClose() {
    (window as any).electron.ipcRenderer.send('login-window-control', 'close');
}
async function loginAndSignup() {
    if (!username.value || !password.value) return;
    loading.value  =true;
    if (active.value === 'login') {
        try {
            const res = await handleFetchLogin(username.value, password.value);
            const { Data, Msg, Status }: any = res;
            if (!Status) throw new Error(JSON.stringify(res));
            if (Status !== 10000) {
                if (Msg) {
                    throw new Error(Msg);
                } else {
                    throw new Error(JSON.stringify(res));
                }
            }
            Store.dispatch(`${StoreModule.USER}/setUser`, Data)
            Store.dispatch(`${StoreModule.USER}/setAccout`, username.value)
            Store.dispatch(`${StoreModule.USER}/setPassword`, password.value)
            await sleep(500);
            loading.value = false;
            closeLoginAndOpenMain()
        } catch(err) {
            loading.value = false;
            Modal.error({
                title: `登录失败: ${err}`,
                class: 'custom-error-dialog'
            });
        }
    } else {
        try {
            const res = await handleFetchSignup(username.value, password.value, superPassword.value);
            const { Msg, Status }: any = res;
            if (!Status) throw new Error(JSON.stringify(res));
            if (Status !== 10000) {
                if (Msg) {
                    throw new Error(Msg);
                } else {
                    throw new Error(JSON.stringify(res));
                }
            }
            loading.value = false;
            Modal.success({
                title: `注册成功`,
                class: 'custom-error-dialog',
                okText: '好的'
            });
        } catch(err) {
            loading.value = false;
            Modal.error({
                title: `注册失败: ${err}`,
                class: 'custom-error-dialog'
            });
        }
    }
}
async function HandleForget() {
    try {
        const res = await handleFetchFoeget(username.value, password.value, superPassword.value);
        const { Msg, Status }: any = res;
        if (!Status) throw new Error(JSON.stringify(res));
        if (Status !== 10000) {
            if (Msg) {
                throw new Error(Msg);
            } else {
                throw new Error(JSON.stringify(res));
            }
        }
        loading.value = false;
        Modal.success({
            title: `密码已成功修改`,
            class: 'custom-error-dialog',
            okText: '好的'
        });
    } catch(err) {
        loading.value = false;
        Modal.error({
            title: `${err}`,
            class: 'custom-error-dialog'
        });
    }
}
</script>

<style scoped lang="less">
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.main-wrapper {
    display: flex;
    flex-direction: column;
}
.header {
    width: 100vw;
    height: 60px;
    position: relative;
    padding: 0 0 0 50px;
    -webkit-app-region: drag;
    // background-color: red;
    .right {
        position: absolute;
        height: 100%;
        right: 0;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        z-index: 9999;
        .win-ctrl{
            width: 60px;
            display: block;
            height: 40px;
            color: #fffbed;
            line-height: 40px;
            -webkit-app-region: no-drag;
        }
        .win-ctrl:hover {
            background-color: rgba(255,255,255,0.1);
        }
    }
}
.login-mian {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 18px;
    .title {
        img {
            width: 219px;
            height: 57px;
        }
        width: 410px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        color: #fff;
        font-size: 43px;
        font-weight: bold;
        margin-top: 10px;
    }
    .tab {
        width: 300px;
        height: 28px;
        display: flex;
        margin-bottom: 10px;
        .tab-item {
            width: 150px;
            padding-bottom: 7px;
            border-bottom: 1px solid #454547;
            color: #b8b8a2;
            font-size: 20px;
            text-align: center;
            font-weight: bold;
            cursor: pointer;
        }
        .tab-active {
            color: #8FB939;
            border-bottom: 1px solid #8FB939;
        }
    }
    .input-wrapper {
        display: flex;
        width: 300px;
        .custom-input {
            width: 300px;
            height: 42px;
            background: transparent;
            line-height: 50px;
            display: flex;
            align-items: center;
            color: #b8b8a2;
            font-size: 16px;
            border-radius: 0;
            margin-top: 20px;
            border: 1px solid #454547;
            &::placeholder {
                color: #b8b8a2;
                opacity: 0.4;
            }
        }
    }
    .login-btn {
        width: 300px;
        height: 42px;
        color: #b8b8a2;
        background-color: #8FB939;
        color: #fff;
        text-align: center;
        line-height: 42px;
        margin-top: 30px;
        cursor: pointer;
    }
    .forget {
        color: #b8b8a2;
        font-size: 16px;
        margin-top: 20px;
        cursor: pointer;
    }
}
.loading {
    position: absolute;
    overflow: hidden;
    transform: translate(0);
    will-change: transform;
    left: 0;
    top: 0;
    background-color: rgba(0,0,0,0.8);
    width: 100vw;
    height: 100vh;
    z-index: 10;
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
        .loading1 {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            background: url('@render/assets/loading1.svg') center no-repeat;
            animation: rotate 3s linear infinite;
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
        }
    }
}
</style>
@src/render/utils/requests