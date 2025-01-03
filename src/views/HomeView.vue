<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <section class="home">
      <div class="dashboard">
        <RouterView />
      </div>
  </section>
</template>

<style>
.home {
  height: auto;
  display: flex;
}

.dashboard {
  width: 100%;
  background-color: #fff;
}
</style>
