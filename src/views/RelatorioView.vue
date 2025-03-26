<template>
  <section class="relatoriofull" ref="reportSection">
    <h1 class="title">Relatório do Produto IoT</h1>
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Carregando, por favor aguarde...</p>
    </div>
    <div class="relatorio" v-else>
      <div class="topo">
        <div class="infos" v-if="relatorio">
          <h2>Nome do Produto: {{ relatorio.name }}</h2>
          <p>{{ relatorio.description }}</p>
        </div>
        <div class="infos" v-if="relatorio && relatorio.user">
          <h2>Projetista e Avaliador</h2>
          <p>Nome: {{ relatorio.user.name }}</p>
          <p>Email: {{ relatorio.user.email }}</p>
          <p>ID: {{ relatorio.user._id }}</p>
        </div>
        <div class="final-grade-section" v-if="relatorio" :style="proficiencySectionStyle">
          <h2>Resultado Final</h2>
          <div class="final-grade-box">
            <p>Final Grade: <span>{{ relatorio.finalGrade }}</span></p>
            <p>Proficiency: <span :style="proficiencyTextStyle">{{ relatorio.proficiency }}</span></p>
          </div>
        </div>
      </div>
      
      <div class="categories" v-if="relatorio && relatorio.categorys">
        <div class="category-item page-break" v-for="(cat, index) in relatorio.categorys" :key="index">
          <h3>{{ cat.name }}</h3>
          <p class="final-grade">Nota da categoria: {{ cat.finalGrade }}</p>
          <div class="questions">
            <h4>Perguntas e Justificativas</h4>
            <div class="question-item" v-for="(question, qIndex) in cat.questions" :key="qIndex">
              <p class="question-text">{{ question.title }} - Nota: {{ question.grade }}</p>
              <p v-if="question.justication && question.justication.justification" class="justification-text">
                Justificativa: {{ question.justication.justification }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="export-btn-container">
        <button class="btn btn-export" @click="exportPDF">Exportar PDF</button>
      </div>
    </div>
  </section>
</template>


<script setup>
import { onMounted, ref, computed, defineProps } from 'vue';
import html2pdf from 'html2pdf.js';
const props = defineProps({
  tabIndex: {
    type: Number,
    required: true,
  }
});
const isLoading = ref(false);
const relatorio = ref(null);
const reportSection = ref(null);

const chamarRelatorio = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const idProduto = localStorage.getItem('produtoParaDarNota');

    const response = await fetch(
      `https://qualiotbackend.onrender.com/products/relatorio/${idProduto}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      }
    );

    const data = await response.json();
    console.log('Resposta da API:', data);

    if (!response.ok) {
      throw new Error('Erro ao buscar relatório do produto');
    }

    relatorio.value = data.relatorio;
    if (relatorio.value && relatorio.value.categorys) {
      initializeCustomTags(relatorio.value.categorys.length);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async() => {
  await chamarRelatorio();
});

const proficiencySectionStyle = computed(() => {
  if (!relatorio.value || !relatorio.value.proficiency) return {};
  const normalized = relatorio.value.proficiency.trim().toLowerCase();
  if (normalized === 'baixa' || normalized === 'baixo') {
    return {
      backgroundColor: '#ffe6e6',
      border: '2px solid #ff4d4d',
      color: '#ff4d4d'
    };
  } else if (normalized === 'media' || normalized === 'medio') {
    return {
      backgroundColor: '#fff5e6',
      border: '2px solid #ffcc00',
      color: '#ffcc00'
    };
  } else if (normalized === 'alta') {
    return {
      backgroundColor: '#e6ffe6',
      border: '2px solid #00cc00',
      color: '#00cc00'
    };
  }
  return {};
});
const proficiencyTextStyle = computed(() => {
  if (!relatorio.value || !relatorio.value.proficiency) return {};
  const normalized = relatorio.value.proficiency.trim().toLowerCase();
  if (normalized === 'baixa' || normalized === 'baixo') {
    return { color: '#ff0000' };
  } else if (normalized === 'media' || normalized === 'medio') {
    return { color: '#ffcc00' };
  } else if (normalized === 'alta') {
    return { color: '#00cc00' };
  }
  return {};
});
const exportPDF = () => {
  const element = reportSection.value;
  const opt = {
    margin: [0, 0, 0, 0],  // Remover margens
    filename: 'QualiotReport.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 1 },
    jsPDF: {
      unit: 'in',
      format: 'letter',
      orientation: 'portrait',
      compress: true,  // Garantir que o conteúdo seja compactado se necessário
      putOnlyUsedFonts: true, // Usar apenas fontes necessárias
      maxWidth: 600,  // Limitar a largura para ajustar o conteúdo
    },
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
.relatoriofull {
  display: flex;
  flex-direction: column;
  padding: 30px;
  max-width: 1300px;
  margin: 0 auto;
  background-color: #f9f9f9;
  border-radius: 15px;
}

.title {
  font-size: 2.5rem;
  color: #3389ce;
  margin-bottom: 20px;
  font-weight: 600;
  text-align: center;
}

.topo {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.infos {
  background-color: #3389ce;
  padding: 20px;
  border-radius: 10px;
  color: #ffffff;
  flex: 1 1 45%;
}

.infos h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.final-grade-section {
  background-color: #f0faff;
  border-radius: 10px;
  padding: 20px;
  flex: 1 1 45%;
}

.final-grade-section h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.final-grade-box {
  padding: 15px;
  border-radius: 10px;
  background-color: #fff;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.category-item {
  flex: 1 1 calc(33% - 20px);
  background-color: #ffffff;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  page-break-inside: avoid; /* Evita que o conteúdo da categoria se divida em duas páginas */
}

.category-item h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.final-grade {
  font-weight: bold;
  background-color: #bbe0fe;
  padding: 10px;
  border-radius: 10px;
  font-size: 1rem;
  margin-bottom: 15px;
}

.questions {
  margin-top: 15px;
  page-break-inside: avoid; /* Evita que as perguntas se dividam no meio */
}

.question-item {
  background-color: #f4f4f4;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 10px;
}

.question-text {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.justification-text {
  background-color: #84c2f5;
  color: #333;
  padding: 10px;
  font-weight: bold;
  border-radius: 10px;
}

.export-btn-container {
  text-align: center;
  margin-top: 40px;
}

.btn {
  padding: 10px 10px;
  font-size: 1.1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-export {
  background-color: #0eb7ff;
  color: white;
}

.btn-export:hover {
  background-color: #0a81ff;
  transform: scale(1.05);
}

.loading {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #e1e4e8;
  border-top: 5px solid #348acf;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Quebra de página apenas onde necessário */
.page-break {
  page-break-before: always; /* Use quando quiser forçar o início de uma nova página */
}

/* Evitar quebras indesejadas dentro de blocos */
.page-break-inside-avoid {
  page-break-inside: avoid;
}
</style>
