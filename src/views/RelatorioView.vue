<template>
  <div class="relatorio-container">
    <h1>Relatórios de Avaliação</h1>
    <div v-if="loading">Carregando...</div>
    <div v-if="error" class="error">{{ error }}</div>
    
    <h2>Resumo do produto cadastrado</h2>
    <table v-if="produtos.length">
      <thead>
        <tr>
          <th>ID do produto</th>
          <th>Nome do produto</th>
          <th>Descrição do produto</th>
          <th>Avaliação do produto</th>
          <th>Nota final do produto</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="produto in produtos" :key="produto.id">
          <td>{{ idProdutoRelatorio }}</td>
          <td>{{ nomeProdutoRelatorio }}</td>
          <td>{{ descricaoProdutoRelatorio }}</td>
          <td>{{ proeficiency }}</td>
          <td>{{ notaFinalProduto }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else>Nenhum produto encontrado.</div>
    <FullRelatorio />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import FullRelatorio from '@/components/FullRelatorio.vue';

const produtos = ref([]);
const loading = ref(false);
const error = ref(null);
const token = localStorage.getItem("token");
const nomeProdutoRelatorio = localStorage.getItem("nomeProdutoRelatorio");
const idProdutoRelatorio = localStorage.getItem("idProdutoRelatorio");
const descricaoProdutoRelatorio = localStorage.getItem("descricaoProdutoRelatorio");
const proeficiency = localStorage.getItem("proeficiency");
const notaFinalProduto = localStorage.getItem("finalGrade");


const fetchDados = async () => {
loading.value = true;
error.value = null;

  try {
    const produtosResponse = await fetch('https://qualiotbackend.onrender.com/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        });

        if (!produtosResponse.ok) {
          throw new Error('Erro ao buscar os produtos');
        }
        
    const produtosData = await produtosResponse.json();
        console.log(produtosData);
        produtos.value = produtosData.product;
        localStorage.setItem("nomeProdutoRelatorio", produtosData.product[0].name);
        localStorage.setItem("idProdutoRelatorio", produtosData.product[0]._id);
    localStorage.setItem("descricaoProdutoRelatorio", produtosData.product[0].description);
    localStorage.setItem("proeficiency", produtosData.product[0].proeficiency);
        localStorage.setItem("notas", JSON.stringify(produtosData.product[0].finalGrade));
      } catch (err) {
        error.value = err.message;
      } finally {
        loading.value = false;
      }
    };

onMounted(() => {
  fetchDados();
});


</script>

<style scoped>
.relatorio-container {
  padding: 20px;
  h1 {
    font-size: 40px;
    margin-bottom: 10px;
    text-align: center;
  }
}
button {
  margin-bottom: 10px;
  padding: 8px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #0056b3;
}
.error {
  color: red;
  margin-top: 10px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  text-align: center;
  margin: 20px 0;
}
th, td {
  border: 1px solid #989898;
  padding: 10px;
}
th {
  background-color: #f4f4f4;
}
</style>
