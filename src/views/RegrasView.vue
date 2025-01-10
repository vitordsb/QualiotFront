<template>
  <section class="regras-view">
    <!-- Navegação de Abas -->
    <div class="abas">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        @click="setActiveTab(index)"
        :class="{ active: activeIndex === index, inactive: tab.inactive }"
        :disabled="tab.inactive"
      >
        {{ tab.title }}
      </button>
      <button class="addAba closeAba">
        +
      </button>
    </div>
    
    <!-- Conteúdo das Abas -->
    <div class="conteudo">
      <div class="grid-container">
        <!-- Seleção de Produto -->
        <CardListarProdutos/>
        
        <!-- Formulário de Avaliação -->
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

<script setup>
import { ref, onMounted, watch } from "vue";
import FormVue from "@/components/FormVue.vue";
import CardListarProdutos from "@/components/CardListarProdutos.vue";

const tabs = ref([]);
const activeIndex = ref(0);
const mediasPorAba = ref([]);
const listarTabs = async () => {
  try {
    const token = localStorage.getItem("token");
    const productId = localStorage.getItem("produtoParaDarNota")
    const response = await fetch(`https://qualiotbackend.onrender.com/categorys/get-by-product/${productId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar dados das abas");
    }

    const data = await response.json();
    const abaSelecionada = data.category[activeIndex.value]._id;
    console.log(abaSelecionada)
    localStorage.setItem("abaSelecionada", abaSelecionada);

    if (Array.isArray(data.category)) {
      tabs.value = data.category.map((item) => ({
        title: item.name,
        _id: item._id, // Salve o ID para referência posterior
        inactive: false,
      }));
      mediasPorAba.value = Array(data.category.length).fill(0);
    } else {
      console.error("Estrutura inesperada: ", data);
      throw new Error("Os dados recebidos não são um array");
    }
  } catch (error) {
    console.error(error);
  }
};

const buscarDadosDaAbaAtiva = async () => {
  try {
    const token = localStorage.getItem("token");
    const abaSelecionada = tabs.value[activeIndex.value]?._id;
    if (!abaSelecionada) {
      throw new Error("Aba selecionada não encontrada");
    }

    localStorage.setItem("abaSelecionada", abaSelecionada);
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
    console.log("Perguntas para aba ativa:", data);
  } catch (error) {
    console.error("Erro ao buscar dados da aba ativa:", error);
  }
};

const setActiveTab = (index) => {
  activeIndex.value = index;
};

watch(activeIndex, () => {
  buscarDadosDaAbaAtiva();
});


onMounted(() => {
  listarTabs();
});
</script>


<style scoped>
.regras-view {
  padding: 20px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.abas {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.abas button {
  padding: 20px 25px;
  background-color: #c7e9ff;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
}

.abas button.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
}

.abas button.inactive {
  background-color: #bbb;
  color: #666;
  cursor: not-allowed;
}

.grid-container {
  display: flex;
  gap: 20px;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
}

.formulario {
  
  width: 100%;
  background: white;
  border-radius: 15px;
  padding: 20px;
  background-color: #c7e9ff;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  
}
.name {
  text-align: center;
}

.controle {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.closeAba {
  background-color: #e74c3c !important;
}
.addAba {
  background-color: #5dfff7 !important;
}

.btn-inativar {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}

.btn-reativar {
  background-color: #2ecc71;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}

.resultado {
  margin-top: 20px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
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
</style>
