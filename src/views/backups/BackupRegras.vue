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
    </div>

    <!-- Conteúdo das Abas -->
    <div class="conteudo">
      <div class="grid-container">
        <!-- Seleção de Produto -->
        <div class="produto-selecao">
          <h3>Selecionar Produto</h3>
          <select v-model="selectedProdutoIndex" class="select-produto">
            <option v-for="(produto, index) in produtos" :key="index" :value="index">
              {{ produto.nome }}
            </option>
          </select>

          <div v-if="selectedProduto" class="produto-detalhes">
            <h4>Detalhes do Produto</h4>
            <p><strong>Nome:</strong> {{ selectedProduto.nome }}</p>
            <p><strong>Descrição:</strong> {{ selectedProduto.descricao }}</p>
          </div>
        </div>

        <!-- Formulário de Avaliação -->
        <div class="formulario">
          <transition name="fade" mode="out-in">
            <div :key="activeIndex" class="tab-content">
              <div v-if="activeIndex === 0">
                <h2>Configurações do Objeto IoT</h2>
                <FormVue
                  q1="Identificação única"
                  p1="Qual é o identificador único do objeto IoT e como ele é gerado?"
                  q2="Capacidade de atualização"
                  p2="O objeto IoT pode receber atualizações? Como o processo é seguro?"
                  q3="Consumo de energia"
                  p3="Quais são as expectativas de consumo de energia?"
                  @atualizar-media="atualizarMedia(0, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 1">
                <h2>Configurações de Sensores</h2>
                <FormVue
                  q1="Tipos de sensores"
                  p1="Quais tipos de sensores são utilizados e para quais finalidades?"
                  q2="Precisão e calibração"
                  p2="Qual é a precisão necessária e como a calibração é mantida?"
                  q3="Resiliência ambiental"
                  p3="Como os sensores lidam com variações ambientais?"
                  @atualizar-media="atualizarMedia(1, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 2">
                <h2>Configurações de Transmissão</h2>
                <FormVue
                  q1="Protocolos de comunicação"
                  p1="Quais protocolos de comunicação são suportados (MQTT, HTTP, etc.)?"
                  q2="Gerenciamento de banda"
                  p2="Como será gerenciado o uso da banda de rede?"
                  q3="Estratégias de retransmissão"
                  p3="Existem mecanismos para garantir a entrega de dados?"
                  @atualizar-media="atualizarMedia(2, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 3">
                <h2>Armazenamento em Nuvem</h2>
                <FormVue
                  q1="Escalabilidade"
                  p1="Como a solução lida com o aumento de dispositivos e dados?"
                  q2="Recuperação de desastres"
                  p2="Quais planos existem para recuperação de dados e continuidade?"
                  q3="Qualidade dos dados"
                  p3="Como a qualidade dos dados é garantida durante o armazenamento?"
                  @atualizar-media="atualizarMedia(3, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 4">
                <h2>Segurança e Privacidade</h2>
                <FormVue
                  q1="Privacidade e proteção dos dados"
                  p1="Quais medidas são adotadas para proteger os dados pessoais dos usuários?"
                  q2="Segurança da informação"
                  p2="Como o sistema protege contra ataques cibernéticos e vazamento de dados?"
                  q3="Gerenciamento de acesso"
                  p3="Como o acesso aos dados é controlado e auditado?"
                  @atualizar-media="atualizarMedia(4, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 5">
                <h2>Análise de Dados</h2>
                <FormVue
                  q1="Processamento de dados"
                  p1="Como os dados são processados e analisados para extrair informações?"
                  q2="Insights acionáveis"
                  p2="Como os insights são gerados e apresentados para tomada de decisões?"
                  q3="Visualização dos dados"
                  p3="Quais ferramentas são utilizadas para representar os dados de forma clara?"
                  @atualizar-media="atualizarMedia(5, $event)"
                />
              </div>

              <div v-else-if="activeIndex === 6">
                <h2>Experiência do Usuário</h2>
                <FormVue
                  q1="Usabilidade"
                  p1="O sistema é intuitivo e fácil de usar?"
                  q2="Acessibilidade"
                  p2="O sistema é acessível para pessoas com deficiência?"
                  q3="Satisfação do usuário"
                  p3="O sistema atende às expectativas e necessidades do usuário final?"
                  @atualizar-media="atualizarMedia(6, $event)"
                />
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Botões de Controle -->
    <div class="controle">
      <button @click="inativarAba" class="btn-inativar" :disabled="tabs[activeIndex].inactive">
        Inativar Aba Atual
      </button>
      <button @click="reativarAba" class="btn-reativar">
        Reativar Aba
      </button>
    </div>

    <!-- Resultado Final -->
    <div class="resultado">
      <h3>Média Geral: {{ mediaGeral }}</h3>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import FormVue from "@/components/FormVue.vue";

const tabs = ref([
  { title: "Objeto IoT", inactive: false },
  { title: "Sensores", inactive: false },
  { title: "Transmissão", inactive: false },
  { title: "Armazenamento", inactive: false },
  { title: "Segurança", inactive: false },
  { title: "Análise", inactive: false },
  { title: "Experiência", inactive: false },
]);

const activeIndex = ref(0);
const mediasPorAba = ref([0, 0, 0, 0, 0, 0, 0]);

const produtos = ref([]);
const selectedProdutoIndex = ref(null);

onMounted(() => {
  const produtosSalvos = JSON.parse(localStorage.getItem("produtos")) || [];
  produtos.value = produtosSalvos;
  if (produtos.value.length > 0) {
    selectedProdutoIndex.value = 0;
  }
});

const selectedProduto = computed(() => produtos.value[selectedProdutoIndex.value]);

function setActiveTab(index) {
  if (!tabs.value[index].inactive) activeIndex.value = index;
}

function inativarAba() {
  tabs.value[activeIndex.value].inactive = true;
  setNextActiveTab();
}

function reativarAba() {
  const inativaIndex = tabs.value.findIndex((tab) => tab.inactive);
  if (inativaIndex !== -1) {
    tabs.value[inativaIndex].inactive = false;
    activeIndex.value = inativaIndex;
  }
}

function setNextActiveTab() {
  const nextActive = tabs.value.findIndex((tab, idx) => !tab.inactive && idx > activeIndex.value);
  activeIndex.value = nextActive !== -1 ? nextActive : 0;
}

function atualizarMedia(index, media) {
  mediasPorAba.value[index] = parseFloat(media);
}

const mediaGeral = computed(() => {
  const mediasValidas = mediasPorAba.value.filter((m) => m > 0);
  return mediasValidas.length > 0
    ? (mediasValidas.reduce((acc, val) => acc + val, 0) / mediasValidas.length).toFixed(2)
    : "0.00";
});
</script>

<style scoped>
.regras-view {
  padding: 20px;
  background-color: #f4f7fa;
  border-radius: 15px;
}

.abas {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.abas button {
  padding: 10px 15px;
  background-color: #ddd;
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
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
}

.produto-selecao {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.select-produto {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
}

.produto-detalhes h4 {
  margin-bottom: 10px;
}

.formulario {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.controle {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
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
