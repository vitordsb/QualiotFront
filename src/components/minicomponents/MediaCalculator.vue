<!-- MediaCalculator.vue -->
<template>
  <Transition mode="fade-slide">
    <div class="box3">
      <h1>A média das notas acima é:</h1>
      <span>{{ mediaCalculada }}</span>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
  notas: {
    type: Array,
    required: true
  }
});

const mediaCalculada = computed(() => {
  if (props.notas.length === 0) return 0;
  
  const soma = props.notas.reduce((acc, nota) => acc + nota, 0);
  return (soma / props.notas.length).toFixed(1);
});
</script>

<style scoped>
.box3 {
  display: flex;
  background-color: #ededed;
  border-radius: 10px;
  padding: 5px;
  width: auto;
  align-content: center;
  align-items: center;
  justify-content: space-between;
  height: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h1 {
  text-align: center;
  font-size: 30px;
}
span {
  font-size: 50px;
  background-color: #348ACF;
  padding: 10px;
  border-radius: 15px;
  color: #ffffff;
}
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px); /* Desliza para cima quando entra */
}

.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px); /* Desliza para cima quando sai */
}
</style>
