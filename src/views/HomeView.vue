<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <transition name="fade" mode="out-in">
    <keep-alive>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </keep-alive>
  </transition>
</template>


<style scoped>


.router-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.router-enter-active {
  transition: all 0.3s ease-out;
}
.router-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
.router-leave-active {
  transition: all 0.3s ease-out;
}
</style>
