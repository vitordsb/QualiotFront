<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <transition name="slide-fade" mode="out-in">
      <RouterView/>
  </transition>
</template>

<style scoped>

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-enter-active {
  transition: all 0.5s ease;
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-fade-leave-active {
  transition: all 0.5s ease;
}

</style>
