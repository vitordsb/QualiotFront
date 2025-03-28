<script setup>
import Header from './components/Header.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <Header/>
  <transition name="slide-fade" mode="out-in">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </transition>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
}

input[type="number"] {
  -moz-appearance: textfield; 
  -webkit-appearance: none; 
  appearance: none; 
}

input[type="number"]::-webkit-inner-spin-button, 
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
}

body {
  overflow-x: hidden;
  overflow-y: scroll;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(100px);
  transition: all 2s ease;
}

.slide-fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-100px);
  transition: all 2s ease;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
</style>
