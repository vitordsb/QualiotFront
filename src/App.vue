<script setup>
import Header from './components/Header.vue';
import { RouterView } from 'vue-router';
</script>

<template>
  <Header/>
    <RouterView v-slot="{ Component }">
        <Transition name="router" mode="default">
            <component :is="Component" :key="$route.fullPath" />
        </Transition>
    </RouterView>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif
}
  input[type="number"] {
    -moz-appearance: textfield; 
    -webkit-appearance: none; 
    appearance: none; 
  }

  input[type="number"]::-webkit-inner-spin-button, 
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

body {
    background: linear-gradient(100deg, #ffffff, white ,#BAE2FC);
    background-repeat: no-repeat;
    height: 100vh;
    @media (max-width: 768px) {
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
