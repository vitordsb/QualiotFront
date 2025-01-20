<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <section class="home">
        <RouterView v-slot="{ Component }">
        <Transition name="router" mode="default">
            <component :is="Component" :key="$route.fullPath" />
        </Transition>
    </RouterView>
  </section>
</template>

<style scoped>

.home {
  height: auto;
  @media (max-width: 768px){
      height: auto;
  }
}
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
