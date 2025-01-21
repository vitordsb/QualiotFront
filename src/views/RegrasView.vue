<script setup>
import { ref, onMounted, watch } from "vue";
import FormVue from "@/components/FormVue.vue";

const tabs = ref([]);
const isLoading = ref(false);
const activeIndex = ref(0);
const categorias = ref([]);
const produtos = ref([]);

onMounted(() => {
  listarTabs();
});

watch(activeIndex, () => {
  atualizarTabAtual();
});

const removerTab = async () => {
  try {
    const token = localStorage.getItem("token");
    const abaSelecionada = tabs.value[activeIndex.value]?._id;
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/${abaSelecionada}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao remover aba");
    }
    tabs.value.splice(activeIndex.value, 1);
    await listarTabs();
    alert("Aba removida, vá para outra aba");
    setActiveTab(0);
    console.log("Aba removida com sucesso");
  } catch (error) {
    console.error("Erro ao remover aba:", error);
  }
};

const adicionarTab = async () => {
  try {
    const novoTitulo = prompt("Insira o nome da nova categoria:");
    const token = localStorage.getItem("token");
    if (!novoTitulo) return;
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          name: novoTitulo,
          _idProduct: localStorage.getItem("produtoParaDarNota"),
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao criar nova aba");
    }

    const data = await response.json();
    tabs.value.push({
      title: data.name,
      _id: data._id,
      inactive: false,
    });
    alert("Nova aba criada, precisa ir para ela!");
    await listarTabs();
    console.log("Nova categoria criada:", data);
  } catch (error) {
    console.error("Erro ao adicionar nova aba:", error);
  }
};

const listarTabs = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem("token");
    const productId = localStorage.getItem("produtoParaDarNota");
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/get-by-product/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao buscar dados das abas");
    }

    const data = await response.json();
    if (Array.isArray(data.category)) {
      tabs.value = data.category.map((item) => ({
        title: item.name,
        _id: item._id,
        inactive: false,
      }));
      categorias.value = Array(data.category.length).fill(0);
    } else {
      console.error("Estrutura inesperada: ", data);
      throw new Error("Os dados recebidos não são um array");
    }

    const abaSelecionada = data.category[activeIndex.value]?._id;
    if (abaSelecionada) {
      localStorage.setItem("abaSelecionada", abaSelecionada);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const atualizarTabAtual = async () => {
  try {
    const token = localStorage.getItem("token");
    const abaSelecionada = tabs.value[activeIndex.value]?._id;
    if (!abaSelecionada) {
      throw new Error("Aba selecionada não encontrada");
    }
    localStorage.setItem("abaSelecionada", abaSelecionada);
    console.log(abaSelecionada);
    const response = await fetch(
      `https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}?details=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao buscar perguntas");
    }

    const data = await response.json();
    const perguntaId = data.questionCategory.map((pergunta) => pergunta._id);
    localStorage.setItem("perguntas", perguntaId);
  } catch (error) {
    console.error("Erro ao buscar dados da aba ativa:", error);
  }
};

const setActiveTab = (index) => {
  activeIndex.value = index;
};


</script>


<template>
  <section class="regras-view">
    <div class="abas">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="setActiveTab(index)"
          :class="{ active: activeIndex === index, inactive: tab.inactive }"
          :disabled="tab.inactive"
        >
          {{ tab.title }}
          <button
            v-if="activeIndex === index"
            @click.stop="removerTab(index)"
            class="btn-removerTab"
          >
            X
          </button>
        </button>
      </div>
      <button @click="adicionarTab" class="addAba">+</button>
    </div>
    <div class="conteudo">
      <div class="grid-container">
        <div class="formulario">
          <transition name="fade" mode="out-in" class="name">
            <div :key="activeIndex" class="tab-content">
              <h2>{{ tabs[activeIndex]?.title }}</h2>
              <FormVue :key="activeIndex" :tab-index="activeIndex" />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.regras-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.abas {
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.abas button {
  border: none;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.518);
  padding: 8px;
  margin: 0 10px 0;
  width: auto;
  background-color: #c7e9ff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
}

.abas button.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.518);
}

.grid-container {
  align-items: center;
  display: flex;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.tab-content h2 {
  text-align: center;
  margin: 20px;
  font-size: 50px;
}

.formulario {
  width: 100%;
  background: white;
  border-radius: 15px;
  background-color: transparent;
  
}
.name {
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }

  .produto-selecao {
    order: 1;
  }

  .formulario {
    order: 2;
  }
}

.loading {
  text-align: center;
  color: #555;
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

.abas .btn-removerTab {
  background-color: #ff5061;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: .2s;
}
.abas .btn-removerTab:hover {
  background-color: #ff0019;
}

.abas button.addAba {
  transition: .2s;
  background-color: #28a745;
  color: white;
  font-size: 20px;
  border-radius: 20%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.abas button.addAba:hover {
  background-color: #218838;
}

.loading {
  text-align: center;
  color: #555;
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
</style>
