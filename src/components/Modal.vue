<template>
  <!-- Exibe o modal apenas se modelValue for true -->
  <div v-if="modelValue" class="modal-overlay" @click.self="close">
    <transition name="modal-anim">
      <div class="modal-container">
        <button class="modal-close" @click="close">&times;</button>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => {
  emit("update:modelValue", false);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
}

.modal-container {
    resize: none;
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  max-width: 700px;
  width: 100%;
  position: relative;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.modal-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Animação para a entrada e saída do modal */
.modal-anim-enter-active,
.modal-anim-leave-active {
  transition: all 0.3s ease;
}
.modal-anim-enter-from,
.modal-anim-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
.modal-anim-enter-to,
.modal-anim-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
