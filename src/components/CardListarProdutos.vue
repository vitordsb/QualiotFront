<template>
  <div class="produto-selecao">
    <h3>Listar e Selecionar Produto</h3>
    <div v-if="produtos.length === 0">
      <p>Carregando produtos...</p>
    </div>
    <select v-if="produtos.length" v-model="selectedProdutoIndex" class="select-produto">
      <option v-for="(prod, index) in produtos" :key="index" :value="index">
        {{ prod.name }}
      </option>
    </select>
    <div v-if="selectedProduto" class="produto-detalhes">
      <h4>Detalhes do Produto</h4>
      <p><strong>Nome:</strong> {{ selectedProduto.name }}</p>
      <p><strong>Descrição:</strong> {{ selectedProduto.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
const produtos = ref([]);
const selectedProdutoIndex = ref(null);
const backendURL = 'https://qualiotbackend.onrender.com/products';
const listarProdutos = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(backendURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }

    const data = await response.json();
    produtos.value = data.product
    const indexProduto = localStorage.getItem("produtoSelecionado")
    localStorage.setItem("indexSelecionado", indexProduto)

    const productId = data.product[indexProduto]._id
    localStorage.setItem("produtoParaDarNota", productId)

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    alert('Não foi possível carregar os produtos. Faça login novamente.');
  }
};

onMounted(() => {
  listarProdutos();
});

const selectedProduto = computed(() => {
  if (selectedProdutoIndex.value !== null && selectedProdutoIndex.value >= 0 && selectedProdutoIndex.value < produtos.value.length) {
    return produtos.value[selectedProdutoIndex.value];
  }
  return null;
});

watch(selectedProdutoIndex, (newIndex) => {
  if (newIndex !== null) {
    localStorage.setItem('produtoSelecionado', newIndex);
  }
});
onMounted(() => {
  const produtoSalvo = localStorage.getItem('produtoSelecionado');
  if (produtoSalvo) {
    selectedProdutoIndex.value = parseInt(produtoSalvo, 10);
  }
});
</script>

<style scoped>
.produto-selecao {
  position: relative;
  background: white;
  height: 200px;
  width: 500px;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    width: auto;
  }
}

.select-produto {
  margin-top: 10px;
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
}

.produto-detalhes h4 {
  margin-bottom: 10px;
}

.produto-selecao p {
  font-size: 14px;
  color: #555;
}
</style>
