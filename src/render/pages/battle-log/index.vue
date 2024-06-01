<template>
    <div class="battle-wrapper">
        <template v-if="!loading">
          <table class="game-table-wrapper">
              <tbody>
                  <tr>
                      <th class="icon-cl"></th>
                      <th class="name-cl"><p>坦克</p></th>
                      <th class="map-cl"><p>地图</p></th>
                      <th class="damage-cl"><p>总伤害</p></th>
                      <th class="ass-cl"><p>总协助</p></th>
                      <th class="kill-cl"><p>击毁</p></th>
                  </tr>
              </tbody>
          </table>
          <div class="list-wrapper">
            <div v-for="item in battles" class="list-item" @click="handleClickItem(item)">
              <div class="tank-img" v-if="port">
                <img :src="`http://localhost:${port}/tanks/${item.mine.tankId.split(':')[1]}.png`" alt="">
              </div>
              <div class="tank-name">{{ item.mine.tankId.split(':')[1] }}</div>
              <div class="map-name">{{ trans[item.mapName.split('/')[1]] }}</div>
              <div class="damage">{{ item.mine.damageDealt }}</div>
              <div class="ass">{{ item.mine.damageAssistedTrack + item.mine.damageAssistedRadio }}</div>
              <div class="kill">{{ item.mine.kills }}</div>
            </div>
          </div>
        </template>
        <div class="loading-wrapper" v-else>
            <div class="loading-icon">
                <div class="loading1"></div>
                <div class="loading2"></div>
            </div>
        </div>
    </div>
    <a-modal
        v-model:open="open"
        width="1000px"
        wrap-class-name="battle-detail-dialog"
        :footer="null"
        :centered="true"
        :destroyOnClose="true"
    >
        <div
            class="battle-detail-head-bg"
            v-if="port && current"
            :style="{
                backgroundImage: `url('http://localhost:${port}/screen/${current.mapName.split('/')[1]}.png')`
            }"
        >
          <div class="mask"></div>
          <p class="title">{{ current.winTeam === current.leftTeam ? '胜利' : '失败' }}</p>
          <p class="bifen">{{ leftKill }} : {{ rightKill }}</p>
        </div>
        <div class="banner">
          <div class="banner-item">
            <span>地图</span>
            <span>{{ trans[current.mapName.split('/')[1]] }}</span>
          </div>
          <div class="banner-item">
            <span>战斗时间</span>
            <span>{{ formatDate(current.time) }}</span>
          </div>
          <div class="banner-item">
            <span>持续时间</span>
            <span>{{ formatTime(current.duration || 0) }}</span>
          </div>
        </div>
        <div class="list">
          <div class="left-team">
            <div class="team-item" :style="{color: '#fff'}">
              <div class="item-name">玩家</div>
              <div class="item-tank">坦克</div>
              <div class="item-damage">伤害</div>
              <div class="item-kill">击杀</div>
              <div class="item-xp">经验</div>
            </div>
            <div
              :class="[
                'team-item real-team',
                item.realName === current['mine'].realName ? 'self' : '',
                item.deathCount ? 'death' : ''
              ]"
              v-for="item in leftMember"
              @click="openUserDetail(item, 'right')"
            >
              <div class="item-name">{{ item.realName }}</div>
              <div class="item-tank">{{ item.tankId.split(':')[1] }}</div>
              <div class="item-damage">{{ item.damageDealt }}</div>
              <div class="item-kill">{{ item.kills }}</div>
              <div class="item-xp">{{ item.xp }}</div>
            </div>
          </div>
          <div class="fenge"></div>
          <div class="right-team">
            <div class="team-item" :style="{color: '#fff'}">
              <div class="item-xp">经验</div>
              <div class="item-kill">击杀</div>
              <div class="item-damage">伤害</div>
              <div class="item-tank">坦克</div>
              <div class="item-name">玩家</div>
            </div>
            <div
              :class="[
                'team-item real-team',
                item.deathCount ? 'death' : ''
              ]"
              v-for="item in rightMember"
              @click="openUserDetail(item, 'left')"
            >
              <div class="item-xp">{{ item.xp }}</div>
              <div class="item-kill">{{ item.kills }}</div>
              <div class="item-damage">{{ item.damageDealt }}</div>
              <div class="item-tank">{{ item.tankId.split(':')[1] }}</div>
              <div class="item-name">{{ item.realName }}</div>
            </div>
          </div>
          <div :class="['detail', openUserTeam]" v-if="openUser">
            <img :src="`http://localhost:${port}/tanks/${currentUser.tankId.split(':')[1]}.png`" alt="">
            <span class="name">{{ currentUser.realName }}</span>
            <div class="close-detail" @click="openUser = false">关闭</div>
            <div class="detail-list">
              <div class="detail-item">
                <span>银币</span>
                <span>{{ currentUser.credits }}</span>
              </div>
              <div class="detail-item">
                <span>经验</span>
                <span>{{ currentUser.xp }}</span>
              </div>
              <div class="detail-item">
                <span>伤害</span>
                <span>{{ currentUser.damageDealt }}</span>
              </div>
              <div class="detail-item">
                <span>协助</span>
                <span>{{ currentUser.damageAssistedTrack +  currentUser.damageAssistedRadio}}</span>
              </div>
              <div class="detail-item">
                <span>抗伤</span>
                <span>{{ currentUser.damageBlockedByArmor }}</span>
              </div>
              <div class="detail-item">
                <span>点亮</span>
                <span>{{ currentUser.spotted }}</span>
              </div>
              <div class="detail-item">
                <span>击毁</span>
                <span>{{ currentUser.kills }}</span>
              </div>
              <div class="detail-item">
                <span>射击次数</span>
                <span>{{ currentUser.shots }}</span>
              </div>
              <div class="detail-item">
                <span>命中次数</span>
                <span>{{ currentUser.directEnemyHits }}</span>
              </div>
              <div class="detail-item">
                <span>击穿次数</span>
                <span>{{ currentUser.piercingEnemyHits }}</span>
              </div>
              <div class="detail-item">
                <span>命中敌人数量</span>
                <span>{{ currentUser.damaged }}</span>
              </div>
              <div class="detail-item">
                <span>击伤敌人数量</span>
                <span>{{ currentUser.damagedHp }}</span>
              </div>
              <div class="detail-item">
                <span>被命中次数</span>
                <span>{{ currentUser.directHitsReceived }}</span>
              </div>
              <div class="detail-item">
                <span>被击穿次数</span>
                <span>{{ currentUser.piercingsReceived }}</span>
              </div>
              <div class="detail-item">
                <span>受到伤害</span>
                <span>{{ currentUser.damageReceived }}</span>
              </div>
              <div class="detail-item">
                <span>受到HE溅射伤害</span>
                <span>{{ currentUser.explosionHitsReceived }}</span>
              </div>
              <div class="detail-item">
                <span>受到的潜在伤害</span>
                <span>{{ currentUser.potentialDamageReceived }}</span>
              </div>
              <div class="detail-item">
                <span>弹震次数</span>
                <span>{{ currentUser.stunNum }}</span>
              </div>
              <div class="detail-item">
                <span>弹震时长</span>
                <span>{{ currentUser.stunDuration }}</span>
              </div>
              <div class="detail-item">
                <span>占领基地</span>
                <span>{{ currentUser.capturePoints }}</span>
              </div>
              <div class="detail-item">
                <span>保卫基地</span>
                <span>{{ currentUser.droppedCapturePoints }}</span>
              </div>
            </div>
          </div>
        </div>
    </a-modal>
</template>


<script setup lang="ts">
import { StoreModule } from '@core/const/store';
import { getServerPort } from '@core/utils/game';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { formatDate, sortByKey, formatTime } from '../../utils/common';

const Store = useStore();
const battles = computed(() => {
  const arr: any = Object.values(Store.state[StoreModule.BATTLE].battles);
  return sortByKey(arr, 'time')
});
const loading = computed(() => Store.state[StoreModule.BATTLE].loading);
const trans = computed(() => Store.state[StoreModule.BATTLE].trans);
const leftKill = computed(() => {
  let num = 0;
  Object.values(current.value.players).forEach((item: any) => {
    if (item.team === 'left') {
      num += item.kills;
    }
  })
  return num;
})
const rightKill = computed(() => {
  let num = 0;
  Object.values(current.value.players).forEach((item: any) => {
    if (item.team === 'right') {
      num += item.kills;
    }
  })
  return num;
})
const leftMember = computed(() => {
  const left: any = [];
  Object.values(current.value.players).forEach((item: any) => {
    if (item.team === 'left') {
      left.push(item)
    }
  })
  return sortByKey(left, 'damageDealt')
})
const rightMember = computed(() => {
  const right: any = [];
  Object.values(current.value.players).forEach((item: any) => {
    if (item.team === 'right') {
      right.push(item)
    }
  })
  return sortByKey(right, 'damageDealt');
})
const port = ref(0);
const open = ref(false);
const current: any = ref(null);
const openUser = ref(false);
const openUserTeam = ref('left')
const currentUser: any = ref(null)

async function startget() {
  const res = await getServerPort();
  if (res.status) {
    port.value = res.payload
  }
}
startget();
function handleClickItem(item: any) {
  open.value = true;
  current.value = item
  openUser.value = false;
  currentUser.value = null;
}

function openUserDetail(item: any, team: string) {
  openUser.value = true;
  currentUser.value = item;
  openUserTeam.value = team;
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
.battle-wrapper {
    width: 1000px;
    position: relative;
}
.game-table-wrapper {
    width: 1000px;
    margin-top: 10px;
    color: #b8b8a2;
    .icon-cl {
        width: 160px;
    }
    .name-cl {
      width: 240px;
    }
    .map-cl {
      width: 240px;
    }
    .damage-cl {
      width: 120px;
    }
    .ass-cl {
      width: 120px;
    }
    .kill-cl {
      width: 120px;
    }
    th {
      background: #302f2d;
      border: 1px solid #43423c;
      padding: 15px 18px 15px 18px;
      p {
        margin: 0;
        padding: 0;
        font-size: 12px;
      }
    }
}
.list-wrapper {
    width: 1000px;
    height: calc(100vh - 240px);
    // background: yellow;
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
    .list-item {
      position: relative;
      width: 1000px;
      height: 140px;
      display: flex;
      flex-direction: row;
      align-items: center;
      border-bottom: 1px solid transparent;
      border-bottom-color: #333335;
      cursor: pointer;
      color: #e9e2bf;
      font-size: 16px;
      text-align: center;
      &:hover:before {
        content: "";
        display: block;
        width: 2px;
        position: absolute;
        left: 0;
        top: -1px;
        bottom: -1px;
        background-color: #f25322;
      }
      &:hover:after {
        content: "";
        display: block;
        opacity: 1;
        // visibility: visible;
        background-image: linear-gradient(to left,transparent 35%,rgba(242,83,34,.21));
        position: absolute;
        top: -1px;
        right: 0;
        bottom: -1px;
        left: 0;
        transition: opacity .3s ease-out,visibility .3s ease-out;
      }
      .tank-img {
        width: 160px;
        img {
          width: 160px;
          height: 120px;
        }
      }
      .tank-name {
        width: 240px;
      }
      .map-name {
        width: 240px;
      }
      .damage {
        width: 120px;
      }
      .ass {
        width: 120px;
      }
      .kill {
        width: 120px;
      }
    }
}
.loading-wrapper {
  width: 1000px;
  height: 700px;
  position: absolute;
  left: 0px;
  top: 0;
  z-index: 999;
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
</style>

<style lang="less">
.battle-detail-dialog {
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
  .battle-detail-head-bg {
    width: 1000px;
    height: 150px;
    z-index: 100;
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    z-index: 10;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4); /* 半透明黑色背景 */
    }
    .title {
      font-size: 50px;
      color: #fff;
      letter-spacing: 10px;
      margin: 0;
      padding: 0;
      z-index: 10;
      line-height: 50px;
      margin-top: 10px;
    }
    .bifen {
      font-size: 30px;
      color: #fff;
      // letter-spacing: 10px;
      z-index: 10;
      margin: 0;
      padding: 0;
      margin-top: 5px;
    }
  }
  .banner {
    width: 900px;
    height: 70px;
    border-radius: 10px;
    background-color: rgba(40,40,40,0.9);
    position: absolute;
    top: 115px;
    z-index: 20;
    left: 50px;
    display: flex;
    .banner-item {
      width: 300px;
      height: 70px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      :first-child {
        color: #b8b8a2;
      }
      :last-child {
        margin-top: 5px;
        color: #fff;
      }
    }
  }
  .list {
    width: 970px;
    height: 560px;
    // background-color: red;
    position: absolute;
    left: 15px;
    top: 190px;
    display: flex;
    .real-team {
      cursor: pointer;
      &:hover {
        background: rgba(255,255,255,0.1);
      }
    }
    .team-item {
      width: 480px;
      height: 35px;
      // background: yellow;
      display: flex;
      justify-items: center;
      align-items: center;
      color: #b8b8a2;
      div {
        word-wrap: normal;
        overflow: hidden;
        text-overflow: ellipsis;
        // padding-right: 20px;
        text-align: center;
      }
      .item-name {
        width: 135px;
      }
      .item-tank {
        width: 135px;
      }
      .item-damage {
        width: 80px;
      }
      .item-kill {
        width: 50px;
      }
      .item-xp {
        width: 80px;
      }
    }
    .self {
      color: #fab81b;
    }
    .death {
      opacity: 0.6;
    }
    .fenge {
      width: 10px;
      height: 560px;
      background-color: #b8b8a2;
      opacity: 0.2;
    }
    .detail {
      width: 480px;
      height: 560px;
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 150px;
      }
      .name {
        color: #b8b8a2;
        font-size: 20px;
      }
      .detail-list {
        width: 480px;
        height: 400px;
        // background-color: #fab81b;
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;
        margin-top: 40px;
      }
      .detail-item {
        color: #b8b8a2;
        width: 240px;
        height: 35px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        padding: 0 40px;
      }
      .close-detail {
        position: absolute;
        right: 40px;
        top: 30px;
        color: #b8b8a2;
        cursor: pointer;
      }
    }
    .left {
      left: 0;
      top: 0;
      background-color: rgb(28,28,30);
    }
    .right {
      right: 0;
      top: 0;
      background-color: rgb(28,28,30);
    }
  }
}
</style>
