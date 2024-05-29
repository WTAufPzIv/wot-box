<template>
    <div class="account-page">
        <div class="user-info">
            <div class="avatar">
                <img src="@render/assets/avatar.png" alt="">
            </div>
            <div class="userinfo">
                <p class="username">盒子用户：{{ accountName }}</p>
                <div v-if="!vip" class="vip-wrapper">
                    <span class="vip expire">VIP</span>
                    <span class="vip-expire">未开通VIP</span>
                    <span class="vip-expire vip-active" @click="open = true">充值卡密</span>
                    <span class="vip-expire vip-buy" @click="goToBuy">点击购买（请理性消费）</span>
                </div>
                <div v-if="vip" class="vip-wrapper">
                    <span class="vip active" v-if="vipExpire === 9999999999">永久VIP</span>
                    <span class="vip active" v-else>VIP</span>
                    <span class="vip-expire">VIP过期时间：{{ formatDate(vipExpire) }}</span>
                    <span class="vip-expire vip-active" @click="open = true">充值卡密</span>
                    <span class="vip-expire vip-buy" @click="goToBuy">点击购买（请理性消费）</span>
                </div>
                <p class="game-username">{{ bindGameUser && `当前游戏账号：${bindGameUser}` || '未添加游戏账号' }}</p>
            </div>
            <div class="logout-btn" @click="handleLogOut()">退出登录</div>
        </div>
        <div class="report-wrapper" v-if="gameReport && !loading">
            <BattleReport :report="gameReport" />
            <div class="refresh-and-unbind">
                <span @click="handleRemoveGameUser()">移除游戏账号</span>
                <span @click="handleSearch(bindGameUser)">刷新战绩数据</span>
            </div>
        </div>
        <div class="loading" v-if="loading">
            <div class="loading-icon">
                <div class="loading1"></div>
                <div class="loading2"></div>
            </div>
        </div>
        <div class="add-game-user" v-if="!bindGameUser && !loading">
            <a-input
                v-model:value="gameUsername"
                size="large"
                placeholder="请输入游戏昵称"
                :bordered="false"
                class="custom-input"
            />
            <div class="go-search" @click="handleSearch(gameUsername)">立即添加</div>
        </div>
    </div>
    <a-modal
        v-model:open="open"
        width="600px"
        wrap-class-name="active-card-dialog "
        :footer="null"
        :centered="true"
        :destroyOnClose="true"
    >
        <div class="input-wrapper">
            <a-input
                v-model:value="targetBuyAccount"
                size="large"
                placeholder="充值账号"
                :bordered="false"
                class="custom-input"
            />
        </div>
        <div class="input-wrapper">
            <a-input
                v-model:value="cardPassword"
                size="large"
                placeholder="卡密"
                :bordered="false"
                class="custom-input"
            />
        </div>
        <div class="login-btn" @click="HandleActive()">立即充值</div>
    </a-modal>
</template>


<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { computed, ref, h } from 'vue';
import { useStore } from 'vuex';
import { formatDate } from '../../utils/common';
import BattleReport from '../../components/BattleReport/index.vue';
import { closeMainAndOpenLogin, fetchLestaData, stopCheckGameRun } from '@core/utils/game';
import { Modal } from 'ant-design-vue';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { handleFetchActivateCard, handleFetchLogin, handleFetchLogout } from '@src/render/utils/fetch';

const Store = useStore();

const userInfo = computed(() => Store.state[StoreModule.USER].userinfo)
const accountName = computed(() => {
    targetBuyAccount.value = Store.state[StoreModule.USER].account || '';
    return Store.state[StoreModule.USER].account
})
const password = computed(() => Store.state[StoreModule.USER].password)
const bindGameUser = computed(() => Store.state[StoreModule.USER].bindGameUser)
const gameReport = computed(() => Store.state[StoreModule.USER].gameReport)
const vip = computed(() => {
    return (userInfo.value?.VipTime * 1000 || 0) > new Date().getTime()
})
const vipExpire = computed(() => userInfo.value?.VipTime)

const loading = ref(false)
const gameUsername = ref('')
const open = ref(false);
const targetBuyAccount = ref('')
const cardPassword = ref('');

function handleLogOut() {
    Modal.confirm({
        title: `确认退出登录？`,
        icon: h(ExclamationCircleOutlined),
        async onOk() {
            await handleFetchLogout();
            Store.dispatch(`${StoreModule.USER}/setUser`, null)
            await stopCheckGameRun();
            closeMainAndOpenLogin()
        },
        okText: '确认',
        cancelText: '取消',
        class: 'custom-error-dialog'
    });
}

function handleRemoveGameUser() {
    Modal.confirm({
        title: `确认解除绑定？`,
        icon: h(ExclamationCircleOutlined),
        onOk() {
            Store.dispatch(`${StoreModule.USER}/setBindGameUser`, '')
            Store.dispatch(`${StoreModule.USER}/setGameReport`, null)
        },
        okText: '确认',
        cancelText: '取消',
        class: 'custom-error-dialog'
    });
}

async function handleSearch(gameUsername: string, isAuto: boolean = false) {
    if (!gameUsername) return;
    loading.value = true;
    const res = await fetchLestaData(gameUsername);
    loading.value = false
    if (res.status) {
        Store.dispatch(`${StoreModule.USER}/setBindGameUser`, gameUsername)
        Store.dispatch(`${StoreModule.USER}/setGameReport`, res.payload)
    } else {
        if (!isAuto) {
            Modal.error({
                title: `${res.message}`,
                class: 'custom-error-dialog',
                okText: '知道了',
            });
        }
    }
}
async function goToBuy() {
    window.open('http://123.60.51.151:16666');
}

async function refreshUserInfo() {
    if (!accountName.value || !password.value) {
        return Modal.error({
            title: `当前账号登录失效，请重新登陆，即将跳转登录页面`,
            async onOk() {
                await handleFetchLogout();
                Store.dispatch(`${StoreModule.USER}/setUser`, null)
                closeMainAndOpenLogin()
            },
            okText: '确认',
            class: 'custom-error-dialog'
        });
    }
    try {
        const res = await handleFetchLogin(accountName.value, password.value);
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
    } catch(err) {
        Modal.error({
            title: `用户信息获取失败: ${err}`,
            class: 'custom-error-dialog'
        });
    }
}

async function HandleActive() {
    if (!targetBuyAccount.value || !cardPassword.value) return;
    try {
        const res = await handleFetchActivateCard(targetBuyAccount.value, cardPassword.value);
        const { Msg, Status }: any = res;
        if (!Status) throw new Error(JSON.stringify(res));
        if (Status !== 10000) {
            if (Status === 109 || Status === 106) {
                return Modal.error({
                    title: `当前账号登录失效，请重新登陆，即将跳转登录页面`,
                    onOk() {
                        Store.dispatch(`${StoreModule.USER}/setUser`, null)
                        closeMainAndOpenLogin()
                    },
                    okText: '确认',
                    class: 'custom-error-dialog'
                });
            }

            // 210登录状态失效
            if (Status === 210) {
                return Modal.error({
                    title: `当前账号登录失效，请重新登陆，即将跳转登录页面`,
                    onOk() {
                        Store.dispatch(`${StoreModule.USER}/setUser`, null)
                        closeMainAndOpenLogin()
                    },
                    okText: '确认',
                    class: 'custom-error-dialog'
                });
            }
            if (Msg) {
                throw new Error(Msg);
            } else {
                throw new Error(JSON.stringify(res));
            }
        }
        loading.value = false;
        Modal.success({
            title: `卡密激活成功`,
            class: 'custom-error-dialog',
            okText: '好的'
        });
        await refreshUserInfo();
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
.account-page {
    width: 1000px;
    .user-info {
        width: 1000px;
        height: 200px;
        background: rgb(15,27,32);
        display: flex;
        flex-direction: row;
        align-items: center;
        position: relative;
        .avatar {
            width: 100px;
            height: 100px;
            background: #b8b8a2;
            position: relative;
            margin-left: 50px;
            overflow: hidden;
            border-radius: 100px;
            img {
                width: 150px;
                height: 100px;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        }
        .userinfo {
            width: 600px;
            height: 100px;
            margin-left: 20px;
            // background-color: #a61c00;
            .username {
                font-size: 24px;
                font-weight: bold;
                color: #b8b8a2;
                margin-bottom: 0;
                margin-top: 5px;
            }
            .vip-wrapper {
                margin-top: 14px;
            }
            .vip {
                font-size: 12px;
                padding: 3px 10px;
                border-radius: 3px;
                font-weight: bold;
                margin-right: 10px;
            }
            .expire {
                background: #b8b8a2;
            }
            .active {
                background: #a61c00;
                color: #ff0;
            }
            .vip-expire {
                color: #b8b8a2;
                font-size: 14px;
                margin-right: 12px;
            }
            .game-username {
                font-size: 14px;
                color: #b8b8a2;
                margin-bottom: 0;
                margin-top: 14px;
            }
            .vip-active {
                color: #f25322;
                cursor: pointer;
            }
            .vip-buy {
                color: #8FB939;
                cursor: pointer;
            }
        }
        .logout-btn {
            position: absolute;
            right: 50px;
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
    .report-wrapper {
        position: relative;
        .refresh-and-unbind {
            position: absolute;
            top: 20px;
            right: 50px;
            display: flex;
            flex-direction: column;
            align-items: center;
            color: #b8b8a2;
            z-index: 30;
            span {
                cursor: pointer;
                margin-top: 10px;
                &:hover {
                    text-decoration: underline;
                }
            }
        }
    }
}
.loading {
    width: 1000px;
    height: 500px;
    position: relative;
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
.add-game-user {
    width: 1000px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 50px;
    .custom-input {
        width: 600px;
        height: 40px;
        background: #302f2d;
        line-height: 50px;
        display: flex;
        align-items: center;
        color: #b8b8a2;
        font-size: 15px;
        border-radius: 0;
        &::placeholder {
            color: #b8b8a2;
            opacity: 0.4;
        }
    }
    .go-search {
        color: #f25322;
        box-shadow: none;
        background: 0 0;
        border: 2px solid #f25322;
        padding: 10px 20px;
        font-weight: bold;
        margin-left: 24px;
        font-size: 14px;
        cursor: pointer;
        &:hover {
            color: #fff;
            background: #f25322;
        }
    }
}
</style>

<style lang="less">
.active-card-dialog {
    .ant-modal-content {
        background-color: rgb(28,28,30);
        height: 300px;
        overflow-x: hidden;
        overflow-y: scroll;
        padding: 30px 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        &::-webkit-scrollbar {
            display: none;
        }
    }
    .ant-modal-close {
        color: #fff;
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
}
</style>