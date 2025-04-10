<template>
    <section class="lista-cadastrados">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Carregando cadastros, por favor aguarde...</p>
      </div>
      <div v-else>
        <h2>Lista de Cadastros</h2>
        <ul class="cadastros">
          <li v-for="(cadastro, index) in cadastrados" :key="index" class="cadastro-item">
            <div class="infos">
              <h3>{{ cadastro.name }}</h3>
              <p><strong>Email:</strong> {{ cadastro.email }}</p>
              <p><strong>ID:</strong> {{ cadastro._id }}</p>
            </div>
            <div class="botoes">
              <button @click="alterarCadastro(index)" class="btn-alterar">Alterar</button>
              <button @click="excluirCadastro(index)" class="btn-excluir">Excluir</button>
            </div>
          </li>
        </ul>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
  
  const cadastrados = ref([]);
  const isLoading = ref(true);
  
  const buscarCadastrados = async () => {
    try {
      const response = await fetch("https://qualiotbackend.onrender.com/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar cadastrados");
      }
      const data = await response.json();
      cadastrados.value = data.user;
    } catch (error) {
      console.error("Erro ao buscar cadastrados:", error);
    } finally {
      isLoading.value = false;
    }
  };
  const alterarCadastro = async (index) => {
    try {
      const usuario = cadastrados.value[index];
      const novoNome = prompt("Insira o novo nome do usuário:", usuario.name);
      const novoEmail = prompt("Insira o novo email do usuário:", usuario.email);
      if (!novoNome || !novoEmail) return;
      const response = await fetch(`https://qualiotbackend.onrender.com/users/${usuario._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: novoNome,
          email: novoEmail,
        }),
      });
      if (!response.ok) {
        throw new Error("Erro ao alterar cadastro");
      }
      cadastrados.value[index].name = novoNome;
      cadastrados.value[index].email = novoEmail;
      console.log("Cadastro alterado com sucesso");
    } catch (error) {
      console.error("Erro ao alterar cadastro:", error);
    }
  };
  
  const excluirCadastro = async (index) => {
    try {
      const usuario = cadastrados.value[index];
      const confirmacao = confirm(`Tem certeza que deseja excluir o cadastro de ${usuario.name}?`);
      if (!confirmacao) return;
  
      const response = await fetch(`https://qualiotbackend.onrender.com/users/${usuario._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Erro ao excluir cadastro");
      }
  
      cadastrados.value.splice(index, 1);
      console.log("Cadastro excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir cadastro:", error);
    }
  };
  
  onMounted(() => {
    buscarCadastrados();
  });
  </script>
  
  <style scoped>
  .lista-cadastrados {
    padding: 20px 0px;
    display: flex;
    width: auto;
    justify-content: space-around;
    align-items: center;
    height: auto;
    border-radius: 10px;
  }
  .lista-cadastrados h2 {
    justify-content: center;
    display: flex;
    width: 100%;
    font-size: 50px;
  }
  
  .loading {
    text-align: center;
    color: #000000;
    font-size: 1.2em;
  }
  
  .spinner {
    margin: 10px auto;
    width: 50px;
    height: 50px;
    border: 5px solid #e1e4e8;
    border-top: 5px solid #007bff;
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
  
  .cadastros {
    margin-top: 40px;
    list-style-type: none;
    grid-template-columns: repeat(4, 1fr);
    gap: 50px;
    justify-content: space-around;
    width: auto;
    display: grid;
  }
  .infos {
    display: flex;
    flex-direction: column;
  }
  
  .cadastro-item {
    display: flex;
    align-items: center;
    width: auto;
    cursor: pointer;
    gap: 30px;
    transition: calc(.2s);
    background: #f1f1f1;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.521);
  }
  
  .cadastro-item:hover {
    transform: scale(1.02);
  }
  .cadastro-item h3 {
    margin: 0 0 5px;
    font-size: 2em;
  }
  
  .cadastro-item p {
    margin: 0;
  }
  
  .botoes {
    flex-direction: column;
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  .btn-alterar {
    background-color: #007bff;
    color: white;
    padding: 10px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-alterar:hover {
    background-color: #0056b3;
  }
  
  .btn-excluir {
    background-color: #ff5061;
    color: white;
    padding: 10px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-excluir:hover {
    background-color: #ff0019;
  }
  </style>
  
