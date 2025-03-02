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
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  input[type="number"] {
    -moz-appearance: textfield; 
    -webkit-appearance: none; 
    appearance: none; 
  }

  input[type="number"]::-webkit-inner-spin-button, 
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
  }
}
body {
  overflow-x: hidden;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

/* Quando está entrando (ativa durante a transição) */
.slide-fade-enter-active {
  transition: all 1s ease;
}

/* Saindo: vai para a esquerda e some */
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Quando está saindo (ativa durante a transição) */
.slide-fade-leave-active {
  transition: all 1s ease;
}
</style>
