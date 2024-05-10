<template>
  <div class="home-page">
    <div class="left">
      <p class="part-name">近期动态与公告</p>
      <div class="supernews">{{ supernews.title }}</div>
      <div class="news">
        <div
          class="news-item"
          v-for="item in topnews"
          @click="handleOpen(item)"
        >
          <span class="title">{{ item.title }}</span>
          <span class="time">{{ formatDate(item.updataTime) }}</span>
        </div>
        <div
          class="news-item"
          v-for="item in news"
          @click="handleOpen(item)"
        >
          <span class="title">{{ item.title }}</span>
          <span class="time">{{ formatDate(item.updataTime) }}</span>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="vedio">
        <p class="part-name">最新视频</p>
        <div class="vedio-list">
          <div
            class="vedio-item"
            v-for="item in video"
            @click="gotoVideo(item.url)"
          >
            <div class="img-wrapper">
              <img class="image" :src="item.img" alt="" />
              <div class="mask"></div>
            </div>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </div>
      <div class="adv">
        <img
          :src="item.img" alt=""
          v-for="item in adv"
          @click="handleOpen(item)"
        />
      </div>
    </div>
  </div>
  <a-modal
    v-model:open="open"
    width="1000px"
    wrap-class-name="news-detail-dialog"
    :footer="null"
    :centered="true"
  >
    <div
      class="news-detail"
      :style="{
        backgroundImage: `url(${currentNews.detail.headUrl})`,
        backgroundSize: 'cover'
      }"
    >
      <p class="title">{{ currentNews.title }}</p>
      <p class="time">{{ formatDate(currentNews.updataTime) }}</p>
    </div>
    <v-md-editor
      :model-value="currentNews.detail.md"
      mode="preview"
    ></v-md-editor>
  </a-modal>
</template>

<script setup lang="ts">
import { homeData } from '../../../mock/home';
import { formatDate } from '../../utils/common';
import { ref } from 'vue'
import { openUrlByBrowser } from '@core/utils/game';

const supernews = homeData.supernews;
const topnews = homeData.topnews;
const news = homeData.news;
const video = homeData.video;
const adv = homeData.adv;

const open = ref(false);
const currentNews: any = ref({});

function handleOpen(news: any) {
  currentNews.value = news;
  open.value = true;
}

function gotoVideo(url: string) {
  openUrlByBrowser(url);
}
</script>

<style lang="less" scoped>
.home-page {
  width: 1000px;
  // background: yellow;
  display: flex;
  flex-direction: row;
  .left {
    width: 550px;
    padding-top: 5px;
    // background-color: red;
    .supernews {
      color: #f25322;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
      margin-top: 20px;
    }
    .news {
      margin-top: 10px;
      height: calc(100vh - 170px);
      // background-color: red;
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
    .news-item {
      position: relative;
      width: 550px;
      height: 70px;
      padding: 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid transparent;
      border-bottom-color: #333335;
      cursor: pointer;
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
      .title {
        width: 450px;
        text-overflow: ellipsis;
        text-wrap: nowrap;
        overflow: hidden;
        // background-color: red;
        font-size: 18px;
        color: #b8b8a2;
      }
      .time {
        font-size: 14px;
        color: #b8b8a2;
        opacity: 0.5;
      }
      .goto-url {
        position: absolute;
        right: 12px;
        bottom: 12px;
        font-size: 16px;
      }
    }
  }
  .right {
    width: 450px;
    padding-top: 5px;
    .vedio {
      width: 450px;
      padding-left: 20px;
      .vedio-list {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-top: 24px;
      }
      .vedio-item {
        width: 200px;
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
        cursor: pointer;
        position: relative;
        .img-wrapper {
          width: 200px;
          height: 118px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          .image {
            width: 200px;
            transition: transform .5s,-webkit-transform .5s;
            // height: 60px;
          }
        }
        .mask {
          transition: transform .5s,-webkit-transform .5s;
          position: absolute;
          width: 200px;
          height: 118px;
          left: 0;
          top: 0;
          opacity: 0;
          background-color: rgba(14,14,15,.5);
        }
        span {
          font-size: 14px;
          color: #b8b8a2;
          margin-top: 10px;
        }
        &:hover span {
          color: #f25322;
          opacity: 0.8;
        }
        &:hover .image {
          transform: scale(1.1);
        }
        &:hover .mask {
          opacity: 1;
          transition: opacity 0.5s;
        }
      }
    }
    .adv {
      padding-left: 20px;
      margin-top: 30px;
      img {
        width: 430px;
        margin-bottom: 20px;
        border-radius: 10px;
        cursor: pointer;
      }
    }
  }
  .part-name {
    color: #e9e2bf;
    font-size: 24px;
    font-weight: bolder;
    margin: 0;
    padding: 0;
  }
  
}
</style>

<style lang="less">
.news-detail-dialog {
  // background-color: red;
  .ant-modal-content {
    background-color: rgb(28,28,30);
    height: calc(100vh - 130px);
    overflow-x: hidden;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
    // &::-webkit-scrollbar-track {
    //   display: none;
    // }
    // &::-webkit-scrollbar {
    //   width: 5px;
    // }
    // &::-webkit-scrollbar-thumb {
    //   background: rgba(255,255,255,0.1);
    // }
  }
  .ant-modal-close {
    color: #b8b8a2;
  }
  .news-detail {
    width: 950px;
    height: 250px;
    margin-top: 25px;
    position: relative;
    .title {
      position: absolute;
      bottom: 40px;
      color: #f9f5e1;
      font-size: 36px;
      font-weight: bold;
    }
    .time {
      position: absolute;
      bottom: 10px;
      color: #b8b8a2;
      left: 20px;
      font-size: 20px;
    }
  }
}
</style>