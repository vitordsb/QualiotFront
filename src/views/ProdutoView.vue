<template>
  <div class="produto-cadastro">
    <!-- Abas -->
    <div class="abas">
      <button 
        :class="{ active: abaAtiva === 'cadastrar' }" 
        @click="abaAtiva = 'cadastrar'">
        Cadastrar Produto
      </button>
      <button 
        :class="{ active: abaAtiva === 'listar' }" 
        @click="listarProdutos">
        Listar Produtos
      </button>
    </div>

    <div class="transicao-container">
      <Transition name="fade-horizontal">
        <div v-if="abaAtiva === 'cadastrar'" class="form-container">
          <h1>Cadastro de Produto</h1>
          <form @submit.prevent="cadastrarProduto">
            <div class="form-group">
              <label for="nome">Nome do Produto:</label>
              <input type="text" id="nome" v-model="produto.nome" required />
            </div>
            <div class="form-group">
              <label for="descricao">Descrição:</label>
              <textarea id="descricao" v-model="produto.descricao" required></textarea>
            </div>
            <button type="submit" class="btn-cadastrar">Cadastrar Produto</button>
          </form>
        </div>
      </Transition>

      <Transition name="fade-horizontal">
        <div v-if="abaAtiva === 'listar'" class="list-container">
          <h1>Produtos Cadastrados</h1>
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Carregando produtos, por favor aguarde...</p>
          </div>
          <div v-else-if="produtos.length" class="produtos-list">
            <div v-for="(prod, index) in produtos" :key="index" class="produto-card">
              <div class="produto-detalhes">
                <h2>{{ capitalizeFirstLetter(prod.name) }}</h2>
                <p>{{ prod.description }}</p>
                <button @click="confirmarRemocao(index)" class="btn-remover">Remover</button>
              </div>
            </div>
          </div>
          <div v-else>
            <p>Nenhum produto cadastrado.</p>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';

const abaAtiva = ref('cadastrar');
const produto = ref({ nome: '', descricao: '' });
const produtos = ref([]);
const isLoading = ref(false);

const backendURL = 'https://qualiotbackend.onrender.com/products';

const listarProdutos = async () => {
  abaAtiva.value = 'listar';
  try {
    isLoading.value = true; 
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
    console.log('Dados recebidos:', data);
    produtos.value = data.product;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    alert('Não foi possível carregar os produtos. Faça login novamente.');
  } finally {
    isLoading.value = false;
  }
};

const cadastrarProduto = async () => {
  if (produto.value.nome && produto.value.descricao) {
    try {
      const token = localStorage.getItem('token');
      const novoProduto = {
        name: produto.value.nome,
        description: produto.value.descricao,
      };

      const response = await fetch(backendURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(novoProduto),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar produto');
      }

      const data = await response.json();
      produtos.value.push(data);
      alert('Produto cadastrado com sucesso!');
      produto.value = { nome: '', descricao: '' };
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar o produto. Tente novamente.');
    }
  } else {
    alert('Por favor, preencha todos os campos obrigatórios.');
  }
};

const removerProduto = async (index) => {
  const produtoRemovido = produtos.value[index];
  if (!produtoRemovido) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${backendURL}/${produtoRemovido._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao remover produto');
    }

    produtos.value.splice(index, 1);
    alert('Produto removido com sucesso!');
  } catch (error) {
    console.error('Erro ao remover produto:', error);
    alert('Erro ao remover o produto. Tente novamente.');
  }
};

const confirmarRemocao = (index) => {
  if (confirm('Tem certeza que deseja remover este produto?')) {
    removerProduto(index);
  }
};

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
</script>

<style scoped>

.produto-cadastro {
  border-radius: 10px;
  max-width: 800px;
  margin: 120px auto;
  padding: 20px;
}

.abas {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.abas button {
  padding: 15px 30px;
  border: none;
  cursor: pointer;
  background-color: #ddd;
  font-weight: bold;
  font-size: 18px;
  border-radius: 8px;
  transition: background-color 0.3s;
  @media (max-width: 700px){
      padding: 10px;
  }
}

.abas button.active,
.abas button:hover {
  background-color: #348acf;
  color: white;
}

.transicao-container {
  position: relative;
  height: 100%;
}

.form-container,
.list-container {
    background-color: #F0F2F5;
    text-align: center;
  position: absolute;
  top: 0;
  border-radius: 20px;
  left: 0;
  box-shadow: 2px 4px 4px #ddd;
  width: 100%;
  padding: 30px;
}

.form-group {
    margin-top: 30px;
    text-align: start;
    margin-bottom: 20px;
}

.form-group label {

  font-weight: bold;
  font-size: 18px;
}

.form-group input,
.form-group textarea {

  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn-cadastrar {
  padding: 12px;
  background-color: #348acf;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  border-radius: 8px;
  display: flex;
  font-weight: bold;
  margin-right: auto;
  margin-left: auto;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.btn-cadastrar:hover {
  background-color: #276ba1;
}

.produtos-list {
text-align: start;
  display: flex;
  margin: 20px;
  flex-direction: column;
  gap: 20px;
  @media (max-width: 700px){
      margin: 0px;
  }
}

.produto-card {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  @media (max-width: 700px){
      padding: 10px;
      margin-top: 30px;
  }
}

.produto-detalhes h2 {
  margin: 0 0 15px;
  color: #333;
  font-size: 22px;
}

.produto-detalhes p {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.btn-remover {
  margin-top: 10px;
  padding: 8px 15px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.btn-remover:hover {
  background-color: #d42f2f;
}
.loading-container {
  text-align: center;
  color: #555;
  font-size: 1.2em;
}

.spinner {
  margin: 10px auto;
  width: 50px;
  height: 50px;
  border: 5px solid #e1e4e8;
  border-top: 5px solid #348acf;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

</style>
