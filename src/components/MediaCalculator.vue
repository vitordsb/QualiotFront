<script setup>
import { ref } from 'vue';

const nota = ref(0)

</script>

<template>  
    <div class="mediaCaluculate">
        <div class="title">
            <h1>Média das notas acima:</h1>
        </div>
        <div class="nota">
            {{ nota }}
        </div>
    </div>
</template>

<style scoped>  
.mediaCaluculate {
    width: 500px;
    height: auto;
    margin: 20px 0;
    background-color: #e4e4e4;
    padding: 20px;
    border-radius: 20px;
    justify-content: center;
    display: flex;
    gap: 20px;
}

.title {
    h1 {
        font-size: 30px;
    }
}
.nota {
    font-size: 32px;
}
</style>