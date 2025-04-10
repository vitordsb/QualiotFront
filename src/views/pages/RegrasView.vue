<script setup>
import { ref, onMounted, watch } from "vue";
import FormVue from "@/components/FormVue.vue";
import Modal from "@/components/Modal.vue";

const isLoading = ref(false);
const tabs = ref([]);
const activeIndex = ref(0);
const categorias = ref([]);

const props = defineProps({
  totalTabs: {
    type: Number,
    default: 1,
  },
});
const isAddTabModalOpen = ref(false);
const newTabTitle = ref("");

onMounted(async () => {
  isLoading.value = true;
  await listarTabs();
  if (tabs.value.length > 0) {
    if (!localStorage.getItem("abaSelecionada")) {
      setActiveTab(0);
      localStorage.setItem("abaSelecionada", tabs.value[0]._id);
    } else {
      const abaSelecionada = localStorage.getItem("abaSelecionada");
      const tabIndex = tabs.value.findIndex((tab) => tab._id === abaSelecionada);
      if (tabIndex !== -1) {
        setActiveTab(tabIndex);
      }
    }
  }
});
watch(activeIndex, () => {
  const abaSelecionada = tabs.value[activeIndex.value]?._id;
  if (abaSelecionada) {
    localStorage.setItem("abaSelecionada", abaSelecionada);
  }
});
const removerTab = async () => {
  try {
    isLoading.value = true;
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
          Authorization: `${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error("Erro ao remover aba");
    }
    isLoading.value = false;
    tabs.value.splice(activeIndex.value, 1);
    await listarTabs();
    alert("Aba removida, vá para outra aba");
    setActiveTab(0);
    console.log("Aba removida com sucesso");
  } catch (error) {
    console.error("Erro ao remover aba:", error);
    isLoading.value = false;
  }
};

const openAddTabModal = () => {
  newTabTitle.value = "";
  isAddTabModalOpen.value = true;
};

const submitNewTab = async () => {
  if (!newTabTitle.value) {
    alert("Insira o nome da nova categoria.");
    return;
  }
  try {
    isLoading.value = true;
    isAddTabModalOpen.value = false;
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          name: newTabTitle.value,
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
    alert("Nova aba criada, vá para ela!");
    await listarTabs();
    isAddTabModalOpen.value = false;
  } catch (error) {
    console.error("Erro ao adicionar nova aba:", error);
    alert("Erro ao adicionar nova aba, tente novamente.");
  } finally {
    isLoading.value = false;
  }
};

const listarTabs = async () => {
  try {
    const token = localStorage.getItem("token");
    const productId = localStorage.getItem("produtoParaDarNota");
    const response = await fetch(
      `https://qualiotbackend.onrender.com/categorys/get-by-product/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
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
      let abaSelecionada = localStorage.getItem("abaSelecionada");
      categorias.value = data.category;
      if (!abaSelecionada && tabs.value.length > 0) {
        abaSelecionada = tabs.value[0]._id;
        localStorage.setItem("abaSelecionada", abaSelecionada);
      }
      const abaValida = tabs.value.find((tab) => tab._id === abaSelecionada);
      if (abaValida) {
        localStorage.setItem("abaSelecionada", abaValida._id);
      } else {
        abaSelecionada = tabs.value[0]._id;
        localStorage.setItem("abaSelecionada", abaSelecionada);
      }
      activeIndex.value = tabs.value.findIndex((tab) => tab._id === abaSelecionada);
    } else {
      console.error("Estrutura inesperada: ", data);
      throw new Error("Os dados recebidos não são um array");
    }
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  isLoading.value = true;
  listarTabs();
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});

const setActiveTab = (index) => {
  activeIndex.value = index;
  const abaSelecionada = tabs.value[activeIndex.value]?._id;
  if (abaSelecionada) {
    localStorage.setItem("abaSelecionada", abaSelecionada);
  }
};
</script>

<template>
  <section class="regras-view">
    <div v-if="isLoading" class="spinner"></div>
    <div v-else class="abas">
      <div class="tabs-container">
        <div
          v-for="(tab, index) in tabs"
          :key="tab._id || index"
          class="tab-item"
        >
          <button
            @click="setActiveTab(index)"
            :class="{ active: activeIndex === index, inactive: tab.inactive }"
            :disabled="tab.inactive"
            class="tab-button"
          >
            {{ tab.title }}
          </button>
          <button
            v-if="activeIndex === index"
            @click.stop="removerTab(index)"
            class="btn-removerTab"
          >
            X
          </button>
        </div>
      </div>
      <div class="add">
        <button @click="openAddTabModal" class="addAba">+</button>
        <p>New tab</p>
      </div>
    </div>
    <transition name="fade-horizontal" mode="out-in">
      <div :key="activeIndex" class="tab-content">
        <h2>Requisito: {{ tabs[activeIndex]?.title }}</h2>
        <FormVue :key="activeIndex" :tab-index="activeIndex" />
      </div>
    </transition>
  </section>

  <!-- Modal para criar nova aba -->
  <Modal v-model="isAddTabModalOpen">
    <h2>Nova Categoria</h2>
    <form @submit.prevent="submitNewTab" class="modal-form">
      <div class="modal-form-group">
        <label for="newTabTitle">Nome da Categoria:</label>
        <input type="text" id="newTabTitle" v-model="newTabTitle" required />
      </div>
      <button type="submit" class="btn btn-primary">Criar</button>
    </form>
  </Modal>
</template>

<style scoped>
.regras-view {
  display: flex;
  padding: 10px;
  transition: calc(0.3s);
}
.abas {
  height: auto;
  display: flex;
  justify-content: start;
  flex-direction: column;
  align-items: start;
  margin-right: 3%;
  padding: 10px;
  gap: 10px;
  transition: calc(0.5s);
}
.tabs-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: flex-start;
  transition: calc(0.5s);
}
.tab-item {
  position: relative;
  display: flex;
  align-items: center;
  transition: calc(0.5s);
}
.add {
  cursor: default;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  transition: calc(0.5s);
}
.tab-button {
  font-weight: bolder;
  border: none;
  width: 150px;
  padding: 12px 12px;
  margin: 0 5px;
  text-align: start;
  background-color: #c7e9ff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  transition: calc(0.5s);
}
.tab-button:hover {
  background-color: #007bff;
  color: white;
  transform: scale(1.05);
}
.tab-button.active {
  background-color: #007bff;
  color: white;
  transform: scale(1.1);
}
.tab-button.inactive {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-removerTab {
  position: relative;
  background-color: #ff4658;
  color: white;
  border: none;
  border-radius: 30%;
  width: 40px;
  height: 40px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  z-index: 1;
}
.btn-removerTab:hover {
  background-color: #ff0019;
}
.addAba {
  background-color: #28a745;
  color: white;
  font-size: 20px;
  border-radius: 20%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: none;
  transition: calc(0.5s);
}
.addAba:hover {
  background-color: #218838;
  transform: scale(1.05);
}
.tab-content h2 {
  transition: calc(0.5s);
  text-align: start;
  padding: 20px;
  font-size: 60px;
  color: #000000;
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
.modal-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.modal-form-group {
  display: flex;
  flex-direction: column;
}
.modal-form-group label {
  font-weight: bold;
  margin-bottom: 10px;
}
.modal-form-group input {
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .abas {
    flex-direction: column;
  }
  .grid-container {
    flex-direction: column;
  }
}
@media (max-width: 480px) {
  .regras-view {
    flex-direction: column;
    padding: 5px;
  }
  .abas {
    align-items: center;
  }
  .tabs-container {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
  .tab-button {
    width: auto;
    font-size: 15px;
    padding: 8px;
  }
  .tab-content h2 {
    font-size: 30px;
    padding: 10px;
    text-align: center;
  }
  .btn-removerTab {
    width: 20px;
    height: 20px;
    font-size: 12px;
    right: -15px;
  }
  .addAba {
    width: 35px;
    height: 35px;
    font-size: 18px;
  }
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0, 123, 255, 0.3);
  border-top: 6px solid #007bff;
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
