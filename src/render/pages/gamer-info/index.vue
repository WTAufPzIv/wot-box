<template>
    <div class="gamer-info--page">
        <div class="head">
            <a-input
                v-model:value="gameUsername"
                size="large"
                placeholder="请输入游戏昵称"
                :bordered="false"
                class="custom-input"
            />
            <div class="go-search" @click="handleSearch(gameUsername)">立即查询</div>
        </div>
        <div class="history">
            <div class="history-head">
                <p class="title">最近搜索</p>
                <p class="clear" @click="handleClearHistory">清空历史记录</p>
            </div>
            <div class="list">
                <p v-for="item in wn8State.history" @click="handleSearch(item)">{{ item }}</p>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { fetchLestaData } from '@core/utils/game';
import { ref, toRef } from 'vue'
import { useStore } from 'vuex';
import { Modal } from 'ant-design-vue';

const gameUsername = ref('')
const Store = useStore();
const wn8State = toRef(Store.state[StoreModule.WN8])

async function handleSearch(gameUsername: string) {
    if (!gameUsername) return;
    Store.dispatch(`${StoreModule.WN8}/addHistory`, gameUsername)
    const res = await fetchLestaData(gameUsername);
    if (res.status) {
        if (!res.payload?.response) {
            return Modal.error({
                title: `数据异常：${res.payload}`,
                class: 'custom-error-dialog',
                okText: '知道了',
            });
        }
        if (res.payload!.response.length === 0) {
            return Modal.error({
                title: `该玩家不存在`,
                class: 'custom-error-dialog',
                okText: '知道了',
            });
        }
        console.log(res.payload)
    } else {
        return Modal.error({
            title: `用户id请求失败：${res.message}`,
            class: 'custom-error-dialog',
            okText: '知道了',
        });
    }
}

function handleClearHistory() {
    Store.dispatch(`${StoreModule.WN8}/clearHistory`)
}
</script>

<style scoped lang="less">
.gamer-info--page {
    width: 1000px;
    .head {
        width: 1000px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        margin-top: 50px;
        .custom-input {
            width: 600px;
            height: 55px;
            background: #302f2d;
            line-height: 50px;
            display: flex;
            align-items: center;
            color: #b8b8a2;
            font-size: 20px;
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
            padding: 15px 20px;
            font-weight: bold;
            margin-left: 24px;
            cursor: pointer;
            &:hover {
                color: #fff;
                background: #f25322;
            }
        }
    }
    .history {
        width: 800px;
        padding: 0 100px;
        .history-head {
            width: 800px;
            border-bottom: dashed 1px #b8b8a2;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            margin-top: 24px;
            .title {
                color: #b8b8a2;
            }
            .clear {
                color: #b8b8a2;
                font-size: 14px;
                cursor: pointer;
                &:hover {
                    color: #f25322;
                }
            }
        }
        .list {
            display: flex;
            flex-direction: row;
            padding: 15px 0px;
            flex-wrap: wrap;
            p {
                padding: 4px;
                background-color: #b8b8a2;
                color: #333;
                font-size: 12px;
                border-radius: 4px;
                margin-right: 10px;
            }
        }
        
    }
}
</style>
