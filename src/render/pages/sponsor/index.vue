<template>
    <div class="sponsor-wrapper">
        <div class="title">
            <p>爱心赞助</p>
            <span>如果您喜欢我们的软件，您可以给我们赞助投喂，打款时请备注昵称和联系方式，我们将展示到打赏榜单。</span>
            <span>打赏收入将用于软件服务器和存储的支出，感谢您支持坦克世界大德盒子的健康发展！</span>
        </div>
        <div class="main">
            <div class="left">
                <table class="game-table-wrapper">
                    <tbody>
                        <tr>
                            <th class="name-cl"><p>用户</p></th>
                            <th class="cash-cl"><p>总打赏</p></th>
                            <th class="qq-cl"><p>QQ</p></th>
                        </tr>
                        <tr v-for="item in sponsorList">
                            <td>{{ item.name }}</td>
                            <td>{{ item.cash }}</td>
                            <td>{{ item.qq }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="right">
                <div class="pay-img">
                    <img :src="wx" alt="">
                    <span>微信支付</span>
                </div>
                <div class="pay-img">
                    <img :src="alipay" alt="">
                    <span>支付宝</span>
                </div>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { sortByKey } from '@src/render/utils/common';
import { computed } from 'vue';
import { useStore } from 'vuex';

const Store = useStore();
const sponsorList = computed(() => {
    const temp = Store.state[`${StoreModule.SPONSOR}`].sponsorData?.list;
    return temp && sortByKey(temp, 'cash') || [];
});
const wx = computed(() => (Store.state[`${StoreModule.SPONSOR}`].sponsorData?.qrcode || [])[0] || '');
const alipay = computed(() => (Store.state[`${StoreModule.SPONSOR}`].sponsorData?.qrcode || [])[1] || '');

Store.dispatch(`${StoreModule.SPONSOR}/fetHomeData`);
</script>

<style scoped lang="less">
.sponsor-wrapper {
    width: 1000px;
}
.title {
    width: 1000px;
    display: flex;
    flex-direction: column;
    p {
        color: #e9e2bf;
        font-size: 24px;
        font-weight: bolder;
        margin-top: 24px;
        padding: 0;
    }
    span {
        color: #e9e2bf;
        font-size: 16px;
        padding: 0;
        margin-bottom: 12px;
    }
}
.main {
    width: 1000px;
    height: calc(100vh - 320px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .left {
        width: 720px;
        height: calc(100vh - 320px);
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
    .right {
        width: 250px;
        // background: red;
        .pay-img {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 250px;
            img {
                width: 180px;
            }
            span {
                color: #e9e2bf;
                font-size: 16px;
                padding: 0;
                margin: 20px 0;
            }
        }
    }
}
.game-table-wrapper {
    width: 700px;
    margin-top: 10px;
    color: #b8b8a2;
    .name-cl {
      width: 240px;
    }
    .cash-cl {
      width: 220px;
    }
    .qq-cl {
      width: 240px;
    }
    th {
    //   width: 250px;
      background: #302f2d;
      border: 1px solid #43423c;
      padding: 15px 18px 15px 18px;
      p {
        margin: 0;
        padding: 0;
        font-size: 16px;
      }
    }
    td {
      padding: 15px 0;
      border: 1px solid #43423c;
      text-align: center;
      .btn {
        color: #f25322;
        cursor: pointer;
      }
    }
}
</style>
