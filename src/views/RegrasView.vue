<script setup>
import { ref, onMounted, watch } from "vue";
import FormVue from "@/components/FormVue.vue";

const tabs = ref([]);
const isLoading = ref(false);
const activeIndex = ref(0);
const categorias = ref([]);

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
    if (!abaSelecionada) {
      throw new Error("Aba não encontrada.");
    }
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/${abaSelecionada}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`
        }
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
          Authorization: `${token}`
        },
        body: JSON.stringify({
          name: novoTitulo,
          _idProduct: localStorage.getItem("produtoParaDarNota")
        })
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao criar nova aba");
    }
    const data = await response.json();
    tabs.value.push({
      title: data.name,
      _id: data._id,
      inactive: false
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
          Authorization: `${token}`
        }
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
        inactive: false
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
    console.log("Aba ativa:", abaSelecionada);
    const response = await fetch(
      `https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}?details=false`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`
        }
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
      <div class="tabs-container">
        <div v-for="(tab, index) in tabs" :key="tab._id || index" class="tab-item">
          <button @click="setActiveTab(index)" :class="{ active: activeIndex === index, inactive: tab.inactive }" :disabled="tab.inactive" class="tab-button">
            {{ tab.title }}
          </button>
          <button v-if="activeIndex === index" @click.stop="removerTab(index)" class="btn-removerTab">
            X
          </button>
        </div>
      </div>
      <div class="add">
        <button @click="adicionarTab" class="addAba">+</button>
        <p>New tab</p>
      </div>
    </div>
    <div class="conteudo">
      <div class="grid-container">
        <div class="formulario">
          <transition name="fade-horizontal" mode="out-in">
            <div :key="activeIndex" class="tab-content">
              <h2>Categoria: {{ tabs[activeIndex]?.title }}</h2>
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
  padding: 20px;
  transition: calc(.3s);
}
.abas {
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: start;
  margin-right: 30px;
  gap: 10px;
}
.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-start;
}
.tab-item {
  position: relative;
  display: inline-block;
}
.add {
  cursor: default;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  p {
    font-weight: bold;
  }
}
.tab-button {
  font-weight: bolder;
  border: none;
  width: 130px;
  padding: 10px 10px;
  margin: 0 5px;
  text-align: start;
  background-color: #c7e9ff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 0.3s, transform 0.3s;
}
.tab-button:hover {
  background-color: #007bff;
  color: white;
  transform: scale(1.05);
}
.tab-button.active {
  background-color: #007bff;
  color: white;
  transform: scale(1.10);
}
.tab-button.inactive {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-removerTab {
  position: absolute;
  top: 2px;
  right: -10px;
  background-color: #ff4658;
  color: white;
  border: none;
  border-radius: 30%;
  width: 40px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 2;
}
.btn-removerTab:hover {
  background-color: #ff0019;
}
.addAba {
  background-color: #28a745;
  color: white;
  font-size: 20px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s, transform 0.3s;
}
.addAba:hover {
  background-color: #218838;
  transform: scale(1.05);
}
.tab-content h2 {
  text-align: start;
  padding: 15px;
  font-size: 58px;
  color: #000000;
}
.formulario {
  width: 100%;
  border-radius: 10px;
  padding: 20px;
}
.fade-horizontal-enter-active,
.fade-horizontal-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-horizontal-enter-from,
.fade-horizontal-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
@media (max-width: 768px) {
  .abas {
    flex-direction: column;
  }
  .grid-container {
    flex-direction: column;
  }
}
</style>
