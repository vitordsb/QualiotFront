<script setup>
import { defineProps, ref, onMounted, watch } from 'vue';

const props = defineProps({
  tabIndex: {
    type: Number,
    required: true,
  },
});

const justificativa = ref([]); 
const descricao = ref([]);
const perguntas = ref([]);
const isLoading = ref(true);
const notas = ref([]);
const pesos = ref([]);
const media = ref(0);
const finalGrade = ref(0);
const proeficiencia = ref('não avaliado');
proeficiencia.value = 'não avaliado'

watch(isLoading, (newValue) => {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    if (newValue) {
      overlay.classList.add('active');
    } else {
      overlay.classList.remove('active');
    }
  }
});

const enviarJustificativas = async () => {
  try {
    const token = localStorage.getItem('token');
    const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
    if (!storedPerguntasId) {
      alert('Nenhuma pergunta encontrada para enviar justificativas.');
      return;
    }
    const perguntasIdArray = JSON.parse(storedPerguntasId);
    for (let i = 0; i < justificativa.value.length; i++) {
      if (justificativa.value[i] && justificativa.value[i].trim() !== "") {
        const response = await fetch('https://qualiotbackend.onrender.com/justifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            justification: justificativa.value[i],
            _idQuestionCategory: perguntasIdArray[i],
          }),
        });
        const data = await response.json();
        console.log(data)
      }
    }
    buscarJustificativa();
  } catch (error) {
    console.error('Erro ao enviar justificativas:', error);
  }
};

const atualizarJustificativa = async () => {
  try {
    const token = localStorage.getItem('token');
    // Para cada justificativa, se houver um ID salvo, envia a atualização via PATCH
    for (let i = 0; i < justificativa.value.length; i++) {
      const justificationId = localStorage.getItem(`justification_tab_${props.tabIndex}_${i}`);
      if (justificationId) {
        const response = await fetch(`https://qualiotbackend.onrender.com/justifications/${justificationId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            justification: justificativa.value[i],
            _idQuestionCategory: localStorage.getItem(`perguntasId_tab_${props.tabIndex}`),
          }),
        });
        const data = await response.json();
        console.log(`Justificativa atualizada com sucesso para a pergunta ${i}:`, data);
      } else {
        console.log(`Nenhuma justificativa existente para a pergunta ${i}. Se for o caso, utilize o método "enviarJustificativas".`);
      }
    }
    buscarJustificativa();
  } catch (error) {
    console.error('Erro ao atualizar justificativas:', error);
    alert('Erro ao atualizar as justificativas. Tente novamente.');
  }
};
const distribuirPesos = () => {
  const numPerguntas = perguntas.value.length;
  switch (numPerguntas) {
    case 1:
      pesos.value = [10];
      break;
    case 2:
      pesos.value = [5, 5];
      break;
    case 3:
      pesos.value = [4, 3, 3];
      break;
    case 4:
      pesos.value = [4, 3, 3, 2];
      break;
    case 5:
      pesos.value = [4, 3, 3, 2, 2];
      break;
    default:
      const basePeso = 3;
      pesos.value = Array(numPerguntas).fill(basePeso);
      break;
  }
};

const adicionarPergunta = async () => {
  try {
    isLoading.value = true;
    const tituloPergunta = prompt('Insira o nome da pergunta:');
    const descricaoPergunta = prompt('Insira a descrição da pergunta:');
    if (!tituloPergunta || !descricaoPergunta) {
      alert('Título e descrição são obrigatórios.');
      isLoading.value = false;
      return;
    }
    const token = localStorage.getItem('token');
    const response = await fetch('https://qualiotbackend.onrender.com/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        title: tituloPergunta,
        announced: descricaoPergunta,
        _idCategory: localStorage.getItem('abaSelecionada'),
      }),
    });
    if (!response.ok) {
      throw new Error('Erro ao cadastrar pergunta.');
    }
    const data = await response.json();
    alert('Pergunta cadastrada com sucesso!');
    console.log('Pergunta cadastrada com sucesso:', data);
    buscarPerguntas();
    buscarJustificativa();
  } catch (error) {
    console.error('Erro ao cadastrar pergunta:', error);
    alert('Erro ao cadastrar pergunta. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

const removerPergunta = async (index) => {
  try {
    isLoading.value = true;
    const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
    if (!storedPerguntasId) {
      throw new Error('Nenhum ID de pergunta encontrado.');
    }
    const perguntasIdArray = JSON.parse(storedPerguntasId);
    const perguntaId = perguntasIdArray[index];
    const token = localStorage.getItem('token');
    const response = await fetch(`https://qualiotbackend.onrender.com/questions/${perguntaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao remover pergunta.');
    }
    perguntas.value.splice(index, 1);
    descricao.value.splice(index, 1);
    notas.value.splice(index, 1);
    pesos.value.splice(index, 1);
    justificativa.value.splice(index, 1);
    perguntasIdArray.splice(index, 1);
    localStorage.setItem(`perguntasId_tab_${props.tabIndex}`, JSON.stringify(perguntasIdArray));
    localStorage.setItem(`perguntas_tab_${props.tabIndex}`, JSON.stringify(perguntas.value));
    localStorage.setItem(`descricao_tab_${props.tabIndex}`, JSON.stringify(descricao.value));
    localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(notas.value));
    localStorage.setItem(`pesos_tab_${props.tabIndex}`, JSON.stringify(pesos.value));
    alert('Pergunta removida com sucesso!');
    console.log('Pergunta removida com sucesso:', await response.json());
    computeFinalGrade();
  } catch (error) {
    console.error('Erro ao remover pergunta:', error);
    alert('Erro ao remover pergunta. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

const buscarPerguntas = async () => {
  try {
    isLoading.value = true;
    const token = localStorage.getItem('token');
    const abaSelecionada = localStorage.getItem('abaSelecionada');
    const response = await fetch(
      `https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}?details=false`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error('Erro ao buscar perguntas.');
    }
    const data = await response.json();
    const perguntaId = data.questionCategory.map((pergunta) => pergunta._id);
    notas.value = data.questionCategory.map((pergunta) => pergunta.grade);
    perguntas.value = data.questionCategory.map((pergunta) => pergunta.title);
    descricao.value = data.questionCategory.map((pergunta) => pergunta.announced);
    justificativa.value = Array(data.questionCategory.length).fill('');
    distribuirPesos();
    localStorage.setItem(`perguntas_tab_${props.tabIndex}`, JSON.stringify(perguntas.value));
    localStorage.setItem(`descricao_tab_${props.tabIndex}`, JSON.stringify(descricao.value));
    localStorage.setItem(`perguntasId_tab_${props.tabIndex}`, JSON.stringify(perguntaId));
    localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(notas.value));
    localStorage.setItem(`pesos_tab_${props.tabIndex}`, JSON.stringify(pesos.value));
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    alert('Erro ao buscar perguntas. Tente novamente.');
  } finally {
    isLoading.value = false;
    computeFinalGrade();
  }
};

const updateQuestionGrades = async () => {
  const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
  if (!storedPerguntasId) return;
  const perguntasIdArray = JSON.parse(storedPerguntasId);
  const token = localStorage.getItem('token');
  let storedNotas = JSON.parse(localStorage.getItem(`notas_tab_${props.tabIndex}`)) || [];

  for (let i = 0; i < perguntasIdArray.length; i++) {
    let gradeValue = parseFloat(notas.value[i]);
    if (isNaN(gradeValue)) {
      gradeValue = storedNotas[i] !== undefined ? storedNotas[i] : 0;
    }
    
    const response = await fetch(`https://qualiotbackend.onrender.com/questions/${perguntasIdArray[i]}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ grade: gradeValue }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Erro ao atualizar grade para a pergunta ${perguntasIdArray[i]}`, errorData);
    }
  }
};

const calcularMediaAba = async () => {
  isLoading.value = true; // Ativa o loading

  try {
    await updateQuestionGrades();
    await buscarPerguntas();
    let somaPesos = 0;
    let somaPonderada = 0;
    
    for (let i = 0; i < perguntas.value.length; i++) {
      let notaAtual = parseFloat(notas.value[i]);
      if (isNaN(notaAtual)) {
        notaAtual = 0;
      }
      const peso = pesos.value[i] || 0;
      somaPonderada += notaAtual * peso;
      somaPesos += peso;
    }
    
    const resultadoMedia = somaPesos > 0 ? (somaPonderada / somaPesos) : 0;
    media.value = Number(resultadoMedia.toFixed(2));
    localStorage.setItem(`media_tab_${props.tabIndex}`, media.value.toFixed(2));
    computeFinalGrade();
    await buscarJustificativa();
  } catch (error) {
    console.error('Erro ao calcular a média ponderada:', error);
    alert('Erro ao calcular a média. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

const computeFinalGrade = () => {
  let somaMedias = 0;
  let contadorMedias = 0;
  for (let key in localStorage) {
    if (key.startsWith('media_tab_')) {
      const mediaAba = parseFloat(localStorage.getItem(key)) || 0;
      somaMedias += mediaAba;
      contadorMedias += 1;
    }
  }
  const mediaFinal = contadorMedias > 0 ? somaMedias / contadorMedias : 0;
  finalGrade.value = Number(mediaFinal.toFixed(2));
  if (finalGrade.value < 5) {
    proeficiencia.value = 'baixo';
  } else if (finalGrade.value <= 8) {
    proeficiencia.value = 'médio';
  } else {
    proeficiencia.value = 'alto';
  }
  localStorage.setItem('finalGrade', finalGrade.value);
};

const buscarJustificativa = async () => {
  try {
    const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
    if (!storedPerguntasId) return;
    const perguntasIdArray = JSON.parse(storedPerguntasId);
    const token = localStorage.getItem('token');
    let justificationsArray = [];

    for (let i = 0; i < perguntasIdArray.length; i++) {
      const id = perguntasIdArray[i];
      const response = await fetch(
        `https://qualiotbackend.onrender.com/justifications/get-by-question/${id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        }
      );
      
      const data = await response.json();
      if (
        data.justificationQuestions &&
        Array.isArray(data.justificationQuestions) &&
        data.justificationQuestions.length > 0
      ) {
        justificationsArray[i] = data.justificationQuestions[0].justification || "";
        localStorage.setItem(`justification_tab_${props.tabIndex}_${i}`, data.justificationQuestions[0]._id);
      } else {
        justificationsArray[i] = "";
      }
    }
    justificativa.value = justificationsArray;
    console.log('Justificativas carregadas:', justificativa.value);
  } catch (error) {
    console.error('Erro ao buscar justificativa:', error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  try {
    await calcularMediaAba();
    await buscarPerguntas();
    await buscarJustificativa();
    computeFinalGrade();
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 3000);
  }
});
</script>

<template>  
  <div class="form">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Carregando, por favor aguarde...</p>
    </div>
    <div v-else>
      <div class="questionario">
        <form @submit.prevent>
          <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
            <div class="sla">
              <label :for="'pergunta' + index">{{ pergunta }}:</label>
              <p>{{ descricao[index] }}</p>
              <span>Nota:</span>
              <input
                v-model.number="notas[index]"
                type="number"
                :id="'pergunta' + index"
                :name="'pergunta' + index"
                min="0"
                max="10"
              />
            </div>
            <span>Justificativa:</span>
            <textarea
              v-model="justificativa[index]"
              :name="'justificativa' + index"
              :id="'justificativa' + index"
              cols="30"
              rows="3"
            ></textarea>
            <button @click.prevent="removerPergunta(index)" class="btn btn-remover">
              Excluir
            </button>
          </div>
        </form>
      </div>

      <div class="botoes">
        <button @click="adicionarPergunta" class="btn btn-adicionar">
          Adicionar questão
        </button>
        <button @click="calcularMediaAba" class="btn btn-primary">
          Calcular média
        </button>
        <button @click="enviarJustificativas" class="btn btn-primary">
          Enviar/Atualizar justificativas
        </button>
      </div>

      <div class="calculos">
        <div class="mediaCalculateFinal">
          <div class="title">
            <h1>Média Final:</h1>
          </div>
          <div class="nota">
            {{ finalGrade }}
          </div>
        </div>
        <div class="mediaCalculate">
          <div class="title">
            <h1>Nota da categoria:</h1>
          </div>
          <div class="nota">
            {{ media }}
          </div>
        </div>
      </div>

      <div class="proeficientContainer" :class="proeficiencia">
        <div class="title">
          <h1>Nível de Proeficiência:</h1>
        </div>
        <div class="nota">
          {{ proeficiencia.charAt(0).toUpperCase() + proeficiencia.slice(1) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* (Os estilos permanecem inalterados) */
.calculos {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.proeficientContainer {
  width: 100%;
  display: flex;
  gap: 10px;
  padding: 10px 0;
  align-items: center;
  border-radius: 10px;
  color: white;
}

.proeficientContainer.baixo {
  color: #dc3545;
}

.proeficientContainer.médio {
  color: #ffc107;
}

.proeficientContainer.alto {
  color: #28a745;
}

.form {
  display: flex;
  flex-direction: column;
  padding: 50px;
  width: 100%;
  max-width: auto;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.318);
}

.questionario {
  display: flex;
  width: auto;
}

.pergunta textarea {
  resize: none;
  width: 100%;
  height: 70px;
  padding: 5px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  background-color: #e4e4e4;
  transition: box-shadow 0.3s ease;
}

.sla {
  align-items: center;
  width: 100%;
  gap: 30px;
  display: flex;
}

.sla p {
  font-size: 1em;
  text-align: justify;
  width: 400px;
}

.pergunta {
  margin: 10px;
  width: 100%;
  display: flex;
  gap: 20px;
  align-items: center;
}

.pergunta label {
  display: flex;
  text-align: start;
  width: 400px;
  font-weight: bold;
  font-size: 1.4em;
  color: #000000;
  margin-bottom: 5px;
}

.pergunta input {
  font-weight: bolder;
  text-align: center;
  display: flex;
  width: 20%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 2em;
  background-color: #e4e4e4;
  transition: box-shadow 0.3s ease;
}

.botoes {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.btn {
  padding: 10px 10px;
  font-size: 1.1em;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-remover {
  background-color: #dc3545;
  color: white;
}

.btn-adicionar {
  background-color: #28a745;
  color: white;
}

.btn-adicionar:hover {
  background-color: rgb(30, 126, 52);
  transform: scale(1.02);
}

.btn-remover:hover {
  background-color: #b10718;
  transform: scale(1.02);
}

.btn-atualizar {
  background-color: #17a2b8;
  color: white;
}

.btn-atualizar:hover {
  background-color: #138496;
  transform: scale(1.02);
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.mediaCalculate, .mediaCalculateFinal {
  width: auto;
  gap: 20px;
  height: auto;
  color: #007BFF;
  align-items: center;
  padding: 10px 0;
  border-radius: 10px;
  display: flex;
  margin-top: 10px;
}

.mediaCalculateFinal {
  color: rgb(0, 0, 0);
}

.title h1 {
  font-size: 25px;
}

.nota {
  font-weight: bold;
  font-size: 30px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.5s ease-in-out;
}
[v-cloak] .loading-overlay {
  opacity: 0;
  visibility: hidden;
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0, 123, 255, 0.3);
  border-top: 6px solid #007bff;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.loading-overlay p {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  opacity: 0;
  animation: fadeIn 1s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
