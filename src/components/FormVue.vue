<script setup>
import { defineProps, ref, onMounted, watch } from 'vue';
const props = defineProps({
  tabIndex: {
    type: Number,
    required: true,
  },
  totalTabs: {
    type: Number,
    default: 1,
  },
});
const justificativa = ref([]);
const descricao = ref([]);
const perguntas = ref([]);
const isLoading = ref(true);
const notas = ref([]);
const pesos = ref([]);
const media = ref(0);
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
watch(
  notas,
  (newNotas) => {
    localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(newNotas));
  },
  { deep: true }
);
const enviarJustificativas = async () => {
  try {
    isLoading.value = true;
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
        console.log(data);
      }
    }
    isLoading.value = false;
    buscarJustificativa();
  } catch (error) {
    isLoading.value = false;
    console.error('Erro ao enviar justificativas:', error);
  }
};
const distribuirPesos = () => {
  const numPerguntas = perguntas.value.length;
  switch (numPerguntas) {
    case 1:
      pesos.value = [10];
      break;
    case 2:
      pesos.value = [6, 4];
      break;
    case 3:
      pesos.value = [4, 3, 3];
      break;
    case 4:
      pesos.value = [4, 3, 2, 1];
      break;
    case 5:
      pesos.value = [3, 2, 2, 2, 1];
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
        Authorization: `${token}`,
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
      `https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      }
    );
    conectarProduto();
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
  } finally {
    isLoading.value = false;
  }
};

const updateQuestionGrades = async () => {
  isLoading.value = true;
  const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
  if (!storedPerguntasId) return;
  const perguntasIdArray = JSON.parse(storedPerguntasId);
  const token = localStorage.getItem('token');
  let storedNotas = JSON.parse(localStorage.getItem(`notas_tab_${props.tabIndex}`)) || [];
  
  const updatePromises = perguntasIdArray.map((id, i) => {
    let gradeValue = parseFloat(notas.value[i]);
    if (isNaN(gradeValue)) {
      gradeValue = storedNotas[i] !== undefined ? storedNotas[i] : 0;
    }
    return fetch(`https://qualiotbackend.onrender.com/questions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ grade: gradeValue }),
    }).then(response => {
      isLoading.value = false
      if (!response.ok) {
        isLoading.value = false;
        return response.json().then(errorData => {
          console.error(`Erro ao atualizar grade para a pergunta ${id}`, errorData);
        });
      }
    });
  });
  
  await Promise.all(updatePromises);
};

const conectarProduto = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://qualiotbackend.onrender.com/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
    });
    const data = await response.json();
    console.log(data);
    const proeficiency = data.product[0].proficiency;
    const notaFinal = data.product[0].finalGrade;
    localStorage.setItem('proeficiency', proeficiency);
    localStorage.setItem('finalGrade', notaFinal);
  } catch (error) {
    console.error('Erro ao conectar ao produto:', error);
    if (error.message === 'Failed to fetch') {
      alert('Erro ao conectar ao produto. Tente novamente.');
    } 
  }
};

const calcularMediaAba = async () => {
  isLoading.value = true;
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
  isLoading.value = false;
  localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(notas.value));
  
  localStorage.setItem(`notaAba_tab_${props.tabIndex}`, media.value);
  
  updateQuestionGrades();
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
      if (data.justificationQuestions && Array.isArray(data.justificationQuestions) && data.justificationQuestions.length > 0) {
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

onMounted( async () => {
  isLoading.value = true;
  try {
    const notasSalvas = localStorage.getItem(`notas_tab_${props.tabIndex}`);
    if (notasSalvas) {
      distribuirPesos();
      calcularMediaAba();
    }
    await buscarPerguntas();
    await calcularMediaAba();
    await buscarJustificativa();
  } catch (error) {
    console.error("Erro ao carregar os dados:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="form">
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Carregando, por favor aguarde...</p>
    </div>
    <div v-else class="form-container">
      <div class="questionario">
        <form @submit.prevent class="perguntas">
          <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
            <div class="info">
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
            <div class="justificativa-group">
              <span>Justificativa:</span>
              <textarea
                v-model="justificativa[index]"
                :name="'justificativa' + index"
                :id="'justificativa' + index"
                cols="30"
                rows="3"
              ></textarea>
            </div>
            <button @click.prevent="removerPergunta(index)" class="btn btn-remover">
              Excluir
            </button>
          </div>
        </form>
      </div>
      <div class="botoes">
        <div class="buttons">
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
          <div class="mediaCalculate">
            <div class="title">
              <h1>Média da categoria:</h1>
            </div>
            <div class="nota">
              {{ media }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  height: auto;
  width: auto;
  border-radius: 15px;
}
.form-container {
  display: flex;
  flex-direction: column;
  align-items: start;
  width: auto;
}
.questionario {
  width: auto;
  display: flex;
}
.pergunta {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 10px;
  justify-content: space-around;
  width: 100%;
  margin: 5px;
  border: 2px solid #ddd;
  @media (max-width: 1600px){
      width: auto;
  }
}
.perguntas {
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 100%;
}
.info {
  display: flex;
  align-items: center;
  justify-content: start;
  gap: 50px;
}
.info label {
  padding: 0px 10px;
  width: auto;
  text-align: start;
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  @media (max-width: 1600px){
      width: 200px;
      font-size: 1em;
  }
}
.info p {
  font-size: 1em;
  color: #555;
  width: 400px;
  word-wrap: break-word;
  text-align: justify;
  @media (max-width: 1600px){
      width: 350px;
      font-size: 1em;
  }
}
.info span {
  font-weight: bold;
  color: #333;
}
.info input {
  width: 100px;
  padding: 10px;
  font-size: 1.2em;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;

}
.info input:focus {
  box-shadow: 0 0 5px rgba(0,123,255,0.5);
}
.justificativa-group {
  display: flex;
  align-items: center;
  gap: 5px;
}
.justificativa-group span {
  font-weight: bold;
  color: #333;
}
.pergunta textarea {
  resize: none;
  width: 350px;
  margin: 0px 10px;
  height: 80px;
  padding: 5px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.3s ease;
}
.pergunta textarea:focus {
  box-shadow: 0 0 5px rgba(0,123,255,0.5);
}
.botoes {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
}
.buttons {
  display: flex;
  gap: 10px;
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
  color: #fff;
}
.btn-remover:hover {
  background-color: #c82333;
  transform: scale(1.02);
}
.btn-adicionar {
  background-color: #00be2cc8;
  color: #fff;
}
.btn-adicionar:hover {
  background-color: #54c96d;
  transform: scale(1.02);
}
.btn-primary {
  background-color: #0eb7ff;
  color: #fff;
}
.btn-primary:hover {
  background-color: #0a81ff;
  transform: scale(1.02);
}
.mediaCalculate {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 10px;
  background-color: #f1f1f1;
}
.mediaCalculate h1 {
  font-size: 1.5em;
  color: #000000;
  @media (max-width: 1600px){
      font-size: 1.2em;
  }
}
.nota {
  font-weight: bold;
  font-size: 1.5em;
  @media (max-width: 1600px){
      font-size: 1.2em;
  }
}
.calculos {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255,255,255,0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 99;
  transition: opacity 0.5s ease-in-out;
}
.spinner {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(0,123,255,0.3);
  border-top: 6px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.loading-overlay p {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  animation: fadeIn 1s ease-in-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Novos estilos responsivos */
@media (max-width: 768px) {
  .form {
    flex-direction: column;
    padding: 10px;
    width: auto;
  }
  .questionario {
    flex-direction: column;
  }
  .pergunta {
    flex-direction: column;
    align-items: flex-start;
    padding: 15px;
    width: auto;
  }
  .info {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  .info p {
    width: 100%;
  }
  .pergunta textarea {
    width: 100%;
  }
  .botoes {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
}

</style>
