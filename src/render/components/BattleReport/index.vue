<template>
    <div class="report-wrapper">
        <div class="bg"></div>
        <div class="main">
            <p class="username">{{ name }}</p>
            <p class="time">
                <span>账号创建于：{{ accountTime && formatDate(accountTime) || '-' }}</span>
                <span>最后战斗时间：{{ lastBattle && formatDate(lastBattle) || '-' }}</span>
            </p>
            <div class="main-info">
                <div class="left">
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${winIcon})` }"></span>
                        <span class="data">{{ winsRatio || '-' }}</span>
                        <span class="text">胜率</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${battleIcon})` }"></span>
                        <span class="data">{{ battles || '-' }}</span>
                        <span class="text">总场次</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${hitRatioIcon})` }"></span>
                        <span class="data">{{ hitsRatio || '-' }}</span>
                        <span class="text">命中率</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${averageDamageIcon})` }"></span>
                        <span class="data">{{ damagePerBattleAverage || '-' }}</span>
                        <span class="text">场均伤害</span>
                    </div>
                </div>
                <div class="center">
                    <img src="@render/assets/wtr.png" alt="">
                    <p class="wn8">{{ wn8 || '-' }}</p>
                    <p class="wn8-text">WN8</p>
                </div>
                <div class="left">
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${averageXpIcon})` }"></span>
                        <span class="data">{{ xpPerBattleAverage || '-' }}</span>
                        <span class="text">场均经验</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${maxXpIcon})` }"></span>
                        <span class="data">{{ maxXp || '-' }}</span>
                        <span class="text">单场经验记录</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${maxKillIcon})` }"></span>
                        <span class="data">{{ maxKill || '-' }}</span>
                        <span class="text">单场最高击毁</span>
                    </div>
                    <div class="main-item">
                        <span class="icon" :style="{ backgroundImage: `url(${masteryIcon})` }"></span>
                        <span class="data">{{ mastery || '-' }}</span>
                        <span class="text">战斗嘉奖数量</span>
                        <span class="text">特级/一级/二级/三级</span>
                    </div>
                </div>
            </div>
            <div class="other-info">
                <div class="other-item">
                    <span class="other-data">{{ wtr || '-' }}</span>
                    <span class="other-text">WTR名人堂评级</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ wgr || '-' }}</span>
                    <span class="other-text">WG评级</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ eff || '-' }}</span>
                    <span class="other-text">EFF效率</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ maxDamage || '-' }}</span>
                    <span class="other-text">伤害记录</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ level || '-' }}</span>
                    <span class="other-text">平均出战等级</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ killPerBattle || '-' }}</span>
                    <span class="other-text">场均击毁</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ spotPerBattle || '-' }}</span>
                    <span class="other-text">场均点亮</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ basePerBttle || '-' }}</span>
                    <span class="other-text">场均占领基地</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ survive || '-' }}</span>
                    <span class="other-text">幸存率</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ damageRatio || '-' }}</span>
                    <span class="other-text">伤害率</span>
                    <span class="other-text">总伤害 / 总承伤</span>
                </div>
                <div class="other-item">
                    <span class="other-data">{{ defenRatio || '-' }}</span>
                    <span class="other-text">装甲利用率</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { winIcon, battleIcon, hitRatioIcon, averageDamageIcon, averageXpIcon, maxXpIcon, maxKillIcon, masteryIcon } from '@src/render/assets/base64';
import { computed } from 'vue';
import { defineProps } from 'vue';
import { formatDate } from '../../utils/common';

const props = defineProps<{
    report: any;
}>();
const name = computed(() => props.report.name)
const accountTime = computed(() => props.report['账号创建时间'])
const lastBattle = computed(() => props.report['上次战斗时间'])
const wn8 = computed(() => props.report['WN8'])
const battles = computed(() => props.report['总场次'])
const winsRatio = computed(() => props.report['胜率'])
const hitsRatio = computed(() => props.report['总命中率'])
const damagePerBattleAverage = computed(() => props.report['场均伤害'])
const xpPerBattleAverage = computed(() => props.report['场均经验'])
const maxXp = computed(() => props.report['经验记录'])
const maxKill = computed(() => props.report['击毁记录'])
const mastery = computed(() => props.report['战斗嘉奖数量'])
const wtr = computed(() => props.report['名人堂评级'])
const wgr = computed(() => props.report['WG评级'])
const eff = computed(() => props.report['EF效率'])
const maxDamage = computed(() => props.report['伤害记录'])
const level = computed(() => props.report['出战等级'])
const killPerBattle = computed(() => props.report['场均击毁'])
const spotPerBattle = computed(() => props.report['平均侦察'])
const basePerBttle = computed(() => props.report['平均占领'])
const survive = computed(() => props.report['幸存率'])
const damageRatio = computed(() => props.report['损伤率'])
const defenRatio = computed(() => props.report['装甲利用率'])
</script>

<style lang="less" scoped>
.report-wrapper {
    width: 1000px;
    height: 500px;
    // background-color: red;
    position: relative;
    .bg {
        position: absolute;
        left: 0;
        top: 0;
        width: 1000px;
        height: 636px;
        background: url("@render/assets/profile.jpg") center no-repeat;
        background-size: contain;
        z-index: 1;
        &::before {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            content: "";
            background-image: linear-gradient(to bottom,rgba(28,28,30,.5) 0%,#1c1c1e 100%);
            z-index: 2;
        }
    }
    .main {
        position: relative;
        z-index: 3;
        width: 1000px;
        display: flex;
        flex-direction: column;
        padding-bottom: 50px;
        .username {
            font-size: 44px;
            color: #f9f5e1;
            font-weight: bolder;
            margin-top: 20px;
            margin-left: 50px;
            margin-bottom: 20px;
        }
        .time {
            color: #a29e87;
            font-size: 16px;
            margin-left: 50px;
            span {
                margin-right: 30px;
            }
        }
        .main-info {
            width: 1000px;
            height: 400px;
            margin-top: 40px;
            display: flex;
            flex-direction: row;
            .left {
                width: 400px;
                // background: yellow;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                .main-item {
                    width: 200px;
                    height: 200px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    .icon {
                        width: 24px;
                        height: 19px;
                        background-size: 24px 19px;
                    }
                    .data {
                        font-size: 32px;
                        color: #f9f5e1;
                        font-weight: bolder;
                        margin-top: 20px;
                    }
                    .text {
                        font-size: 14px;
                        color: #f9f5e1;
                        font-weight: bolder;
                        margin-top: 10px;
                    }
                }
            }
            .center {
                width: 200px;
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                img {
                    width: 222px;
                    height: 248px;
                    position: absolute;
                    top: -70px
                }
                .wn8 {
                    font-size: 50px;
                    color: #f9f5e1;
                    font-weight: bolder;
                    margin-top: 140px;
                    margin-bottom: 0;
                }
                .wn8-text {
                    font-size: 18px;
                    color: #f9f5e1;
                    margin-top: 12px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
            }
        }
        .other-info {
            width: 1000px;
            // margin-top: 40px;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            .other-item {
                width: 250px;
                height: 120px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .other-data {
                font-size: 32px;
                color: #f9f5e1;
                font-weight: bolder;
                margin-top: 20px;
            }
            .other-text {
                font-size: 14px;
                color: #f9f5e1;
                font-weight: bolder;
                margin-top: 10px;
            }
        }
    }
}
</style>