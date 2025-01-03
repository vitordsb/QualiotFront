<script setup>
import Header from './components/Header.vue';
</script>

<template>
  <Header />
  <Transition name="router" mode="fade">
    <router-view v-slot="{ Component }">  
        <component :is="Component" :key="$route.fullPath" />
      </router-view>
    </Transition>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
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
