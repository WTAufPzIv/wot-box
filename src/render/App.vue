<template>
  <page>
      <!-- <router-view></router-view> -->
      <router-view v-slot="slotProps">
        <keep-alive>
          <component :is="slotProps.Component"></component>
        </keep-alive>
      </router-view>
  </page>
</template>

<script setup lang="ts">
import Page from './components/page/index.vue';
</script>

<style scoped>
</style>
