<template>
  <section class="relatoriofull" ref="reportSection">
    <h1 class="title">Relatório completo</h1>
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
    </div>
    <div class="relatorio" v-else>
      <div class="topo">
        <div class="infos" v-if="relatorio">
          <h2>Nome produdo: {{ relatorio.name }}</h2>
          <p>Descrição: {{ relatorio.description }}</p>
        </div>
        <div class="infos" v-if="relatorio && relatorio.user">
          <h2>Projetista e avaliador:</h2>
          <p>Nome: {{ relatorio.user.name }}</p>
          <p>Email: {{ relatorio.user.email }}</p>
          <p>ID: {{ relatorio.user._id }}</p>
        </div>
      </div>
      <div class="categories" v-if="relatorio && relatorio.categorys">
        <div
          class="category-item"
          v-for="(cat, index) in relatorio.categorys"
          :key="index"
        >
          <h3>{{ cat.name }}</h3>
          <p class="final-grade">Nota da categoria: {{ cat.finalGrade }}</p>
          <div class="custom-tags">
            <div class="tag" v-for="(tag, tagIndex) in customTags[index]" :key="tagIndex">
              <template v-if="editingTags[index] && editingTags[index][tagIndex]">
                <input type="text" v-model="customTags[index][tagIndex]" @blur="stopEditingTag(index, tagIndex)" class="input-tag" />
              </template>
              <template v-else>
                <span @click="startEditingTag(index, tagIndex)" class="tag-display">
                  {{ tag }}
                </span>
              </template>
              <button @click="removeTag(index, tagIndex)" class="btn-remove-tag">x</button>
            </div>
            <div class="add-tag">
              <input type="text" v-model="newTag[index]" placeholder="Digite nova tag" class="input-tag" />
              <button @click="addTag(index)" class="btn-add-tag">Adicionar tag</button>
            </div>
          </div>
          <div class="questions">
            <h4>Perguntas e justificativas:</h4>
            <div
              class="question-item"
              v-for="(question, qIndex) in cat.questions"
              :key="qIndex"
            >
              <p class="question-text">
                {{ question.title }} - Nota: {{ question.grade }}
              </p>
              <p
                v-if="question.justication && question.justication.justification"
                class="justification-text"
              >
                Justificativa: {{ question.justication.justification }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="final-grade-section"
        v-if="relatorio"
        :style="proficiencySectionStyle"
      >
        <h2>Resultado Final</h2>
        <div class="final-grade-box">
          <p>Final Grade: <span>{{ relatorio.finalGrade }}</span></p>
          <p>
            Proficiency:
            <span :style="proficiencyTextStyle">
              {{ relatorio.proficiency }}
            </span>
          </p>
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
const customTags = ref([]);
const editingTags = ref([]);
const newTag = ref([]);

const chamarRelatorio = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const idProduto = localStorage.getItem('idProdutoRelatorio');

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
    loadCustomTags();
  } catch (err) {
    console.error(err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  chamarRelatorio();
});

const initializeCustomTags = (numCategories) => {
  if (customTags.value.length < numCategories) {
    for (let i = customTags.value.length; i < numCategories; i++) {
      customTags.value.push([]);
    }
  }
  if (editingTags.value.length < numCategories) {
    for (let i = editingTags.value.length; i < numCategories; i++) {
      editingTags.value.push([]);
    }
  }
  if (newTag.value.length < numCategories) {
    for (let i = newTag.value.length; i < numCategories; i++) {
      newTag.value.push('');
    }
  }
};
const loadCustomTags = () => {
  const saved = localStorage.getItem(`customTags_tab_${props.tabIndex}`);
  if (saved) {
    customTags.value = JSON.parse(saved);
    if (!Array.isArray(editingTags.value) || editingTags.value.length !== customTags.value.length) {
      editingTags.value = customTags.value.map(() => []);
    }
    if (!Array.isArray(newTag.value) || newTag.value.length !== customTags.value.length) {
      newTag.value = customTags.value.map(() => '');
    }
  }
};

const saveCustomTags = () => {
  localStorage.setItem(`customTags_tab_${props.tabIndex}`, JSON.stringify(customTags.value));
};
const addTag = (catIndex) => {
  const tagText = newTag.value[catIndex]?.trim();
  if (tagText) {
    customTags.value[catIndex].push(tagText);
    if (!editingTags.value[catIndex]) {
      editingTags.value[catIndex] = [];
    }
    editingTags.value[catIndex].push(false);
    newTag.value[catIndex] = '';
    saveCustomTags();
  }
};

// Função para remover uma tag de uma categoria
const removeTag = (catIndex, tagIndex) => {
  customTags.value[catIndex].splice(tagIndex, 1);
  if (editingTags.value[catIndex]) {
    editingTags.value[catIndex].splice(tagIndex, 1);
  }
  saveCustomTags();
};

// Inicia o modo de edição para uma tag
const startEditingTag = (catIndex, tagIndex) => {
  if (!editingTags.value[catIndex]) {
    editingTags.value[catIndex] = [];
  }
  editingTags.value[catIndex][tagIndex] = true;
};
const stopEditingTag = (catIndex, tagIndex) => {
  editingTags.value[catIndex][tagIndex] = false;
  saveCustomTags();
};

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
    margin: 0,
    autoPaging: 'none',
    filename: 'QualiotReport.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 1 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
.title {
  font-size: 50px;
  color: #3389ce;
  margin-bottom: 10px;
  text-align: center;
}

.topo {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 10px;
}

.infos {
  background-color: #3389ce;
  padding: 30px;
  border-radius: 10px;
  color: #ffffff;
}

.relatorio {
  page-break-inside: avoid;
  display: flex;
  flex-direction: column;
  border-radius: 15px;
}

.category-item {
  page-break-inside: avoid;
  display: flex;
  padding: 30px;
  margin: 10px;
  flex-direction: column;
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  border-radius: 10px;
}

.category-item h3 {
  margin-bottom: 5px;
  font-size: 30px;
}

.final-grade {
  page-break-inside: avoid;
  font-weight: bold;
  margin-bottom: 10px;
  color: #000000;
  background-color: #bbe0fe;
  padding: 10px;
  font-size: 20px;
  width: 250px;
  border-radius: 10px;
}

.custom-tags {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.tag-display {
  background-color: #ffcc00;
  color: #fff;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}
.input-tag {
  padding: 5px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.btn-remove-tag,
.btn-add-tag {
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #dc3545;
  color: #fff;
  transition: background-color 0.3s, transform 0.2s;
}
.btn-remove-tag:hover,
.btn-add-tag:hover {
  background-color: #c82333;
  transform: scale(1.05);
}
.btn-custom-tag {
  padding: 5px 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #0eb7ff;
  color: #fff;
  transition: background-color 0.3s, transform 0.2s;
}
.btn-custom-tag:hover {
  background-color: #0a81ff;
  transform: scale(1.05);
}

.questions {
  page-break-inside: avoid;
}

.questions h4 {
  font-size: 25px;
  margin-bottom: 10px;
}

.question-text {
  background-color: #3389ce;
  padding: 20px;
  font-size: 20px;
  font-weight: bolder;
  border-radius: 15px;
  color: #ffffff;
}

.justification-text {
  font-size: 20px;
  background-color: #84c2f5;
  color: #000000;
  padding: 10px;
  font-weight: bolder;
  border-radius: 15px;
  margin-left: 40px;
}

.final-grade-section {
  border-radius: 15px;
  padding: 30px;
  text-align: center;
}

.final-grade-section h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.final-grade-box p {
  font-size: 20px;
  margin: 10px 0;
}
.export-btn-container {
  text-align: center;
  margin-top: 20px;
}

.btn-export {
  page-break-inside: avoid;
  padding: 10px 20px;
  font-size: 18px;
  background-color: #0eb7ff;
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-export:hover {
  background-color: #0a81ff;
  transform: scale(1.05);
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
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
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
