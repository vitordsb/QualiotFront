<template>
  <div class="form-container">
    <h2>Avaliação Personalizada</h2>

    <!-- Perguntas Fixas -->
    <div class="fixed-criterios">
      <div class="criterio" v-for="(nota, index) in notasFixas" :key="'fixa-' + index">
        <label :for="'criterio' + (index + 1)">
          {{ perguntasFixas[index].texto }} (Peso: {{ pesosRebalanceados[index] }})
          <p>{{ perguntasFixas[index].descricao }}</p>
        </label>
        <input
          type="number"
          :id="'criterio' + (index + 1)"
          v-model="notasFixas[index]"
          min="0"
          max="10"
          placeholder="Nota (0-10)"
        />
        <!-- Justificativa para a nota -->
        <textarea
          v-model="justificativasFixas[index]"
          :placeholder="'Justifique sua nota para ' + perguntasFixas[index].texto"
          class="textarea-justificativa"
        ></textarea>
      </div>
    </div>

    <!-- Critérios Dinâmicos -->
    <div v-for="(criterio, index) in criterios" :key="'dinamico-' + index" class="criterio">
      <label>
        Critério Adicional {{ index + 1 }} (Peso: {{ pesosRebalanceados[index + 3] }})
      </label>
      <input
        type="text"
        v-model="criterio.nome"
        placeholder="Nome do critério"
      />
      <input
        type="number"
        v-model="criterio.nota"
        min="0"
        max="10"
        placeholder="Nota (0-10)"
      />
      <!-- Justificativa para o critério adicional -->
      <textarea
        v-model="criterio.justificativa"
        placeholder="Justifique sua nota para este critério adicional"
        class="textarea-justificativa"
      ></textarea>
      <button @click="removerCriterio(index)" class="btn-remover">Remover</button>
    </div>

    <!-- Botão para Adicionar Critério -->
    <button
      @click="adicionarCriterio"
      class="btn-adicionar"
      :disabled="criterios.length >= maxCriterios"
    >
      Adicionar Critério
    </button>

    <!-- Botão para Salvar Dados -->
    <button
      @click="salvarDados"
      class="btn-salvar"
    >
      Salvar Dados
    </button>

    <!-- Resultado -->
    <div class="resultado">
      <h3>Média Ponderada: {{ calcularMediaPonderada }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";

// Propriedades recebidas pelo componente (3 perguntas fixas)
const props = defineProps({
  q1: String,
  q2: String,
  q3: String,
  p1: String,
  p2: String,
  p3: String,
});

// Evento emitido para atualizar a média calculada no componente pai
const emit = defineEmits(["atualizar-media"]);

// Limitação para adicionar no máximo 2 critérios adicionais
const maxCriterios = 2;

// Notas e pesos fixos para as 3 perguntas principais
const notasFixas = ref([0, 0, 0]); // Notas para as perguntas fixas
const justificativasFixas = ref(["", "", ""]); // Justificativas para cada pergunta fixa
const pesosFixos = ref([4, 3, 3]); // Pesos iniciais: somam 10

// Perguntas fixas
const perguntasFixas = ref([
  { texto: props.q1, descricao: props.p1 },
  { texto: props.q2, descricao: props.p2 },
  { texto: props.q3, descricao: props.p3 },
]);

// Critérios dinâmicos adicionados pelo usuário
const criterios = ref([]);

// Adiciona um novo critério dinâmico (até o limite de 2)
function adicionarCriterio() {
  if (criterios.value.length < maxCriterios) {
    criterios.value.push({ nome: "", nota: 0, justificativa: "" });
    recalcularPesos();
  }
}

// Remove um critério dinâmico e recalcula os pesos
function removerCriterio(index) {
  criterios.value.splice(index, 1);
  recalcularPesos();
}

// Calcula os pesos rebalanceados para perguntas fixas e critérios dinâmicos
const pesosRebalanceados = computed(() => {
  const totalPesos = 10; // A soma total dos pesos deve ser sempre 10
  const totalCriterios = 3 + criterios.value.length;

  // Calcula o peso base para cada critério
  const pesoBase = Math.floor(totalPesos / totalCriterios);
  const pesos = Array(totalCriterios).fill(pesoBase);

  // Ajusta o restante para garantir que a soma seja exatamente 10
  let restante = totalPesos - pesoBase * totalCriterios;
  for (let i = 0; restante > 0; i = (i + 1) % totalCriterios) {
    pesos[i]++;
    restante--;
  }

  return pesos; // Retorna os pesos ajustados
});

// Calcula a média ponderada com base nas notas e nos pesos
const calcularMediaPonderada = computed(() => {
  let soma = 0;
  let totalPesos = 0;

  // Média ponderada das perguntas fixas
  notasFixas.value.forEach((nota, index) => {
    soma += nota * pesosRebalanceados.value[index];
    totalPesos += pesosRebalanceados.value[index];
  });

  // Média ponderada dos critérios dinâmicos
  criterios.value.forEach((criterio, index) => {
    const peso = pesosRebalanceados.value[index + 3];
    soma += criterio.nota * peso;
    totalPesos += peso;
  });

  // Retorna a média calculada e emite para o componente pai
  const media = totalPesos > 0 ? (soma / totalPesos).toFixed(2) : "0.00";
  emit("atualizar-media", media);
  return media;
});

// Função para salvar os dados no localStorage
function salvarDados() {
  const dados = {
    notasFixas: notasFixas.value,
    justificativasFixas: justificativasFixas.value,
    criterios: criterios.value,
    mediaPonderada: calcularMediaPonderada.value,
  };
  localStorage.setItem("avaliacao", JSON.stringify(dados));
  alert("Dados salvos com sucesso!");
}
</script>

<style scoped>
/* Estilos principais para o layout do formulário */
.form-container {
  width: 90%;
  max-width: 1200px;
  margin: 20px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.fixed-criterios,
.criterio {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

input,
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 5px;
}

textarea {
  resize: none;
  height: 80px;
}

.btn-adicionar,
.btn-remover,
.btn-salvar {
  width: 100%;
  padding: 10px;
  font-weight: bold; 
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.btn-adicionar {
  background-color: #2ecc71;
  color: white;
}

.btn-adicionar:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.btn-remover {
  background-color: #e74c3c;
  color: white;
}

.btn-salvar {
  background-color: #007bff;
  color: white;
}

.btn-salvar:hover {
  background-color: #0056b3;
}

.resultado {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
}

h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
</style>
