<template>
  <div class="produto-cadastro">
    <div class="abas">
      <button
        :class="{ active: abaAtiva === 'cadastrar' }"
        @click="abaAtiva = 'cadastrar'"
      >
        Cadastrar Produto
      </button>
      <button
        :class="{ active: abaAtiva === 'listar' }"
        @click="listarProdutos"
      >
        Listar Produtos
      </button>
    </div>
    <div class="transicao-container">
      <Transition name="fade-horizontal">
        <div v-if="abaAtiva === 'cadastrar'" class="form-container">
          <div v-if="isLoading" class="loading-container">
            <div class="spinner"></div>
            <p>Carregando produto, por favor aguarde...</p>
          </div>
          <div v-else>
            <h1>Cadastro de Produto</h1>
            <form @submit.prevent="cadastrarProduto">
              <div class="form-group">
                <label for="nome">Nome do Produto:</label>
                <input type="text" id="nome" v-model="produto.nome" required />
              </div>
              <div class="form-group">
                <label for="descricao">Descrição:</label>
                <textarea
                  id="descricao"
                  v-model="produto.descricao"
                  required
                ></textarea>
              </div>
              <button type="submit" class="btn-cadastrar">
                Cadastrar Produto
              </button>
            </form>
          </div>
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
            <div
              v-for="(prod, index) in produtos"
              :key="prod._id"
              class="produto-card"
            >
              <div class="produto-detalhes">
                <h2>{{ capitalizeFirstLetter(prod.name) }}</h2>
                <p>{{ prod.description }}</p>
                <div class="botoes">
                  <button @click="confirmarRemocao(index)" class="btn-remover">
                    Remover
                  </button>
                  <button @click="editarProduto(index)" class="btn-editar">
                    Editar
                  </button>
                </div>
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
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
const abaAtiva = ref("cadastrar");
const produto = ref({ nome: "", descricao: "" });
const produtos = ref([]);
const isLoading = ref(false);
const backendURL = "https://qualiotbackend.onrender.com/products";

const router = useRouter();
const isReloading = ref(false);

onMounted( () => {
  listarProdutos();
  if (!localStorage.getItem("reloadDone")) {
    localStorage.setItem("reloadDone", "true");
    isReloading.value = true;
    router.go(0);
  } else {
    isReloading.value = false;
  }
});

const listarProdutos = async () => {
  try {
    abaAtiva.value = 'listar'
    isLoading.value = true;
    const token = localStorage.getItem("token");
    const response = await fetch(backendURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });
    const data = await response.json();
    produtos.value = data.product;
    if (produtos.value.length > 0) {
      localStorage.setItem("produtoParaDarNota", produtos.value[0]._id);
      console.log(produtos.value[0]._id);
    }
    console.log("Produtos recebidos:", data.product);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  } finally {
    isLoading.value = false;
  }
};
const cadastrarProduto = async () => {
  if (produto.value.nome && produto.value.descricao) {
    try {
      isLoading.value = true;
      const token = localStorage.getItem("token");
      const novoProduto = {
        name: produto.value.nome,
        description: produto.value.descricao,
      };
      const response = await fetch(backendURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(novoProduto),
      });
      if (!response.ok) {
        throw new Error("Erro ao cadastrar produto");
      }
      const data = await response.json();
      produtos.value.push(data);
      alert("Produto cadastrado com sucesso!");
      if (produtos.value.length === 1) {
        localStorage.setItem("produtoParaDarNota", data._id);
      }
      localStorage.setItem("produto", JSON.stringify(produtos.value));
      produto.value = { nome: "", descricao: "" };
      window.location.reload();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar o produto. Tente novamente.");
    }
  } else {
    alert("Por favor, preencha todos os campos obrigatórios.");
  }
};
const removerProduto = async (index) => {
  const produtoRemovido = produtos.value[index];
  if (!produtoRemovido) return;
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendURL}/${produtoRemovido._id}`, {
      method: "DELETE",
      headers: {
        Authorization: `${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao remover produto");
    }
    produtos.value.splice(index, 1);
    alert("Produto removido com sucesso!");
    window.location.reload();
  } catch (error) {
    console.error("Erro ao remover o produto:", error);
    alert("Erro ao remover o produto. Tente novamente.");
  }
};
const confirmarRemocao = (index) => {
  if (confirm("Tem certeza que deseja remover este produto?")) {
    removerProduto(index);
  }
};
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};
const editarProduto = async (index) => {
  const prod = produtos.value[index];
  if (!prod) {
    alert("Produto não encontrado.");
    return;
  }
  const newProductName = prompt("Digite o novo nome do produto", prod.name);
  const newProductDescription = prompt(
    "Digite a nova descrição do produto",
    prod.description
  );
  if (newProductName === null || newProductDescription === null) {
    alert("Edição cancelada.");
    return;
  }
  const trimmedName = newProductName.trim();
  const trimmedDescription = newProductDescription.trim();
  if (!trimmedName || !trimmedDescription) {
    alert("Os campos não podem estar vazios.");
    return;
  }
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendURL}/${prod._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        name: trimmedName,
        description: trimmedDescription,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Erro ao editar o produto");
    }
    window.location.reload();
    produtos.value[index] = data;
    alert("Produto editado com sucesso!");
  } catch (error) {
    console.error("Erro ao editar o produto:", error);
    alert("Erro ao editar o produto. Tente novamente.");
  }
};
</script>

<style scoped>
.produto-cadastro {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  max-width: 800px;
  margin: 100px auto;
}
.abas {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}
.botoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.abas button {
  padding: 15px 30px;
  border: none;
  cursor: pointer;
  background-color: #ddd;
  font-weight: bold;
  font-size: 18px;
  border-radius: 10px;
  transition: background-color 0.2s;
}
@media (max-width: 700px) {
  .abas button {
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
  background-color: #f0f2f5;
  text-align: center;
  position: relative;
  border-radius: 10px;
  left: 0;
  box-shadow: 2px 4px 4px #ddd;
  width: 100%;
  padding: 50px;
}
.form-group {
  margin-top: 30px;
  display: flex;
  width: auto;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}
.form-group label {
  font-weight: bold;
  font-size: 20px;
  width: 400px;
}
.form-group input,
.form-group textarea {
  resize: none;
  width: 100%;
  padding: 10px;
  text-align: center;
  margin: 10px;
  font-size: 20px;
  border: none;
  box-shadow: 1px 1px 1px 1px #ddd;
  border-radius: 10px;
}
.form-group input:focus,
.form-group textarea:focus {
  outline: none;
}
.btn-cadastrar {
  padding: 10px;
  background-color: #348acf;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 20px;
  border-radius: 8px;
  display: flex;
  font-weight: bold;
  margin: 10px auto 0;
  transition: background-color 0.3s;
}
.btn-cadastrar:hover {
  background-color: #276ba1;
}
.produtos-list {
  margin-top: 50px;
  text-align: start;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
@media (max-width: 700px) {
  .produtos-list {
    margin: 0;
  }
}
.produto-card {
  background-color: #ffffff;
  box-shadow: 1px 1px 1px 2px #0000003e;
  padding: 30px;
  border-radius: 8px;
}
@media (max-width: 700px) {
  .produto-card {
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
.botoes {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
.btn-remover {
  padding: 8px 15px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  transition: 0.3s;
  cursor: pointer;
  font-size: 16px;
}
.btn-remover:hover {
  background-color: #d42f2f;
}
.btn-editar {
  padding: 8px 15px;
  background-color: #007af3;
  color: white;
  border: none;
  border-radius: 5px;
  transition: 0.3s;
  cursor: pointer;
  font-size: 16px;
}
.btn-editar:hover {
  background-color: #0056b3;
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
.fade-horizontal-enter-active,
.fade-horizontal-leave-active {
  transition: all 0.25s;
}
.fade-horizontal-enter-from,
.fade-horizontal-leave-to {
  opacity: 0;
  transform: translateX(-100px) scale(0.9);
}
</style>
