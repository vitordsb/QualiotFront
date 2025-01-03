<template>
  <section class="comparacao-view">
    <h2>Comparação de Produtos</h2>

    <!-- Seleção de Produtos para Comparação -->
    <div class="selecionar-produtos">
      <div class="produto-selecao">
        <h3>Produto 1</h3>
        <select v-model="selectedProduto1" class="select-produto">
          <option v-for="(produto, index) in produtos" :key="index" :value="index">
            {{ produto.nome }}
          </option>
        </select>
      </div>

      <div class="produto-selecao">
        <h3>Produto 2</h3>
        <select v-model="selectedProduto2" class="select-produto">
          <option v-for="(produto, index) in produtos" :key="index" :value="index">
            {{ produto.nome }}
          </option>
        </select>
      </div>
    </div>

    <!-- Exibição da Comparação -->
    <div v-if="produto1 && produto2" class="tabela-comparacao">
      <table>
        <thead>
          <tr>
            <th>Pergunta</th>
            <th>{{ produto1.nome }}</th>
            <th>{{ produto2.nome }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pergunta, index) in perguntas" :key="index">
            <td>{{ pergunta }}</td>
            <td>{{ produto1.respostas[index] || "N/A" }}</td>
            <td>{{ produto2.respostas[index] || "N/A" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensagem caso não haja produtos suficientes -->
    <div v-else class="mensagem">
      <p>Por favor, selecione dois produtos para comparação.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// Produtos cadastrados no localStorage
const produtos = ref([]);
const selectedProduto1 = ref(null);
const selectedProduto2 = ref(null);

onMounted(() => {
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtos.value = produtosSalvos;
});

// Computed para obter os produtos selecionados
const produto1 = computed(() => produtos.value[selectedProduto1.value]);
const produto2 = computed(() => produtos.value[selectedProduto2.value]);

// Perguntas para exibição na tabela de comparação
const perguntas = [
  "Identificação única",
  "Capacidade de atualização",
  "Consumo de energia",
  "Tipos de sensores",
  "Precisão e calibração",
  "Resiliência ambiental",
  "Protocolos de comunicação",
  "Gerenciamento de banda",
  "Estratégias de retransmissão",
];
</script>

<style scoped>
.comparacao-view {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  max-width: 1200px;
  margin: 20px auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.selecionar-produtos {
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 20px;
}

.produto-selecao {
  width: 45%;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.select-produto {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
}

.tabela-comparacao {
  overflow-x: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead th {
  background-color: #007bff;
  color: white;
  padding: 10px;
}

tbody td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

tbody tr:hover {
  background-color: #f1f1f1;
}

.mensagem {
  text-align: center;
  font-size: 18px;
  color: #555;
  margin-top: 20px;
}
</style>
