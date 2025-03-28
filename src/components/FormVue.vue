<template>
  <div v-if="isLoading" class="loading-overlay">
    <div class="spinner"></div>
    <p>Carregando, por favor aguarde...</p>
  </div>
  <div v-else class="form">
    <div class="form-container">
      <div class="questionario">
        <form @submit.prevent class="perguntas">
          <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
            <div class="info">
              <label :for="'pergunta' + index">{{ pergunta }}:</label>
              <p>{{ descricao[index] }}</p>
            </div>
            <div class="notasGroup">
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
              <div class="justify-groupsla">
                <textarea
                  v-model="justificativa[index]"
                  :name="'justificativa' + index"
                  :id="'justificativa' + index"
                  cols="30"
                  rows="3"
                ></textarea>
                <button @click.prevent="removerPergunta(index)" class="btn btn-remover">
                  <img src="/public/assets/icons/iconTrash.png" alt="">
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div v-if="perguntas.length" class="botoes">
        <div class="buttons">
          <!-- Abre o modal para adicionar uma nova pergunta -->
          <button @click="openAddQuestionModal" class="btn btn-adicionar">
            Adicionar questão
          </button>
          <button @click="calcularMediaAba" class="btn btn-primary">
            Calcular média
          </button>
          <button @click="enviarJustificativas" class="btn btn-primary">
            Enviar/Alterar justificativa
          </button>
        </div>
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

  <!-- Modal para adicionar nova pergunta -->
  <Modal v-model="isAddQuestionModalOpen">
    <h2>Adicionar questão</h2>
    <form @submit.prevent="submitNewQuestion" class="modal-form">
      <div class="form-group">
        <label for="newQuestionTitle">Título da questão:</label>
        <input type="text" id="newQuestionTitle" v-model="newQuestionTitle" required />
      </div>
      <div class="form-group">
        <label for="newQuestionDescription">Descrição da questão:</label>
        <textarea id="newQuestionDescription" v-model="newQuestionDescription" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Adicionar</button>
    </form>
  </Modal>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Modal from '../components/Modal.vue'; // ajuste o caminho conforme necessário

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

// Estados para o modal de adicionar pergunta
const isAddQuestionModalOpen = ref(false);
const newQuestionTitle = ref('');
const newQuestionDescription = ref('');

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
    newNotas.forEach((nota, i) => {
      localStorage.setItem(`nota_${props.tabIndex}_${i}`, JSON.stringify(nota));
    });
  },
  { deep: true }
);

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

// Abre o modal para adicionar nova pergunta
const openAddQuestionModal = () => {
  newQuestionTitle.value = '';
  newQuestionDescription.value = '';
  isAddQuestionModalOpen.value = true;
};

// Submete a nova pergunta enviada via modal
const submitNewQuestion = async () => {
  if (!newQuestionTitle.value || !newQuestionDescription.value) {
    alert('Título e descrição são obrigatórios.');
    return;
  }
  isLoading.value = true;
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://qualiotbackend.onrender.com/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        title: newQuestionTitle.value,
        announced: newQuestionDescription.value,
        _idCategory: localStorage.getItem('abaSelecionada'),
      }),
    });
    if (!response.ok) {
      throw new Error('Erro ao cadastrar pergunta.');
    }
    const data = await response.json();
    console.log("Pergunta cadastrada", data);
    await buscarPerguntas();
    isAddQuestionModalOpen.value = false;
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
    const data = await response.json();
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
    console.log('Pergunta removida', data);
    await buscarPerguntas();
  } catch (error) {
    console.error('Erro ao remover pergunta:', error);
    alert('Erro ao remover pergunta. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
};

const buscarPerguntas = async () => {
  try {
    const token = localStorage.getItem('token');
    const abaSelecionada = localStorage.getItem('abaSelecionada');
    if (!abaSelecionada) {
      console.error("A aba selecionada não foi encontrada.");
      return;
    }
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
    const data = await response.json();
    console.log(data);
    if (data && Array.isArray(data.questionCategory)) {
      perguntas.value = [];
      descricao.value = [];
      notas.value = [];
      justificativa.value = [];
      for (let i = 0; i < data.questionCategory.length; i++) {
        perguntas.value.push(data.questionCategory[i].title);
        descricao.value.push(data.questionCategory[i].announced);
        const savedNota = localStorage.getItem(`nota_${props.tabIndex}_${i}`);
        notas.value.push(savedNota ? JSON.parse(savedNota) : (data.questionCategory[i].grade || 0));
        const savedJustificativa = localStorage.getItem(`justification_tab_${props.tabIndex}_${i}`);
        justificativa.value.push(savedJustificativa || "");
      }
      distribuirPesos();
      localStorage.setItem(`perguntas_tab_${props.tabIndex}`, JSON.stringify(perguntas.value));
      localStorage.setItem(`descricao_tab_${props.tabIndex}`, JSON.stringify(descricao.value));
      localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(notas.value));
      localStorage.setItem(`pesos_tab_${props.tabIndex}`, JSON.stringify(pesos.value));
      localStorage.setItem(
        `perguntasId_tab_${props.tabIndex}`,
        JSON.stringify(data.questionCategory.map((item) => item._id))
      );
    } else {
      console.error('Estrutura inesperada: questionCategory não é um array');
    }
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
  }
};

const updateQuestionGrades = async () => {
  const storedPerguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
  if (!storedPerguntasId) {
    return;
  }
  const perguntasIdArray = JSON.parse(storedPerguntasId);
  const token = localStorage.getItem('token');
  let storedNotas = JSON.parse(localStorage.getItem(`notas_tab_${props.tabIndex}`)) || [];
  const updatePromises = perguntasIdArray.map(async (id, i) => {
    let gradeValue = parseFloat(notas.value[i]);
    if (isNaN(gradeValue)) {
      gradeValue = storedNotas[i] !== undefined ? storedNotas[i] : 0;
    }
    const response = await fetch(`https://qualiotbackend.onrender.com/questions/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({
        grade: gradeValue,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error(`Erro ao atualizar grade para a pergunta ${id}`, data);
    } else {
      console.log(`Nota atualizada com sucesso para a pergunta ${id}`);
    }
  });
  await Promise.all(updatePromises);
  await buscarPerguntas();
  localStorage.setItem(`notas_tab_${props.tabIndex}`, JSON.stringify(notas.value));
};

const calcularMediaAba = async () => {
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
      const storedJustification = localStorage.getItem(`justification_tab_${props.tabIndex}_${i}`);
      if (storedJustification) {
        justificationsArray[i] = storedJustification;
      } else {
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
        if (data.justificationQuestions && data.justificationQuestions.length > 0) {
          justificationsArray[i] = data.justificationQuestions[0].justification || "";
          localStorage.setItem(`justification_tab_${props.tabIndex}_${i}`, data.justificationQuestions[0].justification);
        } else {
          justificationsArray[i] = "";
        }
      }
    }
    justificativa.value = justificationsArray;
  } catch (error) {
    console.error('Erro ao buscar justificativa:', error);
  }
};

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
      const justification = justificativa.value[i]?.trim();
      if (justification) {
        const storedJustificationId = localStorage.getItem(`justification_id_tab_${props.tabIndex}_${i}`);
        if (storedJustificationId) {
          const responsePut = await fetch(`https://qualiotbackend.onrender.com/justifications/${storedJustificationId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              justification,
              _idQuestionCategory: perguntasIdArray[i],
            }),
          });
          const data = await responsePut.json();
          if (responsePut.ok) {
            console.log('Justificativa atualizada com sucesso!');
            localStorage.setItem(`justification_tab_${props.tabIndex}_${i}`, justification);
          } else {
            console.error('Erro ao atualizar justificativa:', data);
          }
        } else {
          const responsePost = await fetch('https://qualiotbackend.onrender.com/justifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              justification,
              _idQuestionCategory: perguntasIdArray[i],
            }),
          });
          const data = await responsePost.json();
          if (responsePost.ok) {
            console.log('Justificativa criada com sucesso!');
            localStorage.setItem(`justification_id_tab_${props.tabIndex}_${i}`, data._id);
            localStorage.setItem(`justification_tab_${props.tabIndex}_${i}`, justification);
          } else {
            console.error('Erro ao criar justificativa:', data);
          }
        }
      }
    }
    await buscarJustificativa(); 
  } catch (error) {
    console.error('Erro ao enviar justificativas:', error);
  }
};

onMounted(async () => {
  isLoading.value = true;
  setTimeout(async () => {
    try {
      const notasSalvas = localStorage.getItem(`notas_tab_${props.tabIndex}`);
      if (notasSalvas) {
        distribuirPesos();
        calcularMediaAba();
      }
      await buscarPerguntas();
      await buscarJustificativa();
      await calcularMediaAba();
    } catch (error) {
      console.error("Erro ao carregar os dados:", error);
    } finally {
      isLoading.value = false;
    }
  }, 1000);
});
</script>

<style scoped>
/* Estilos existentes */
.groupjustify {
  display: flex;
  flex-direction: column;
  .btn-justify {
    margin-top: 10px;
    width: 50%;
    justify-self: center;
    border: none;
    background-color: #c82333;
    padding: 5px;
    color: white;
    border-radius: 10px;
    font-weight: bolder;
    align-self: center;
  }
}
.form {
  padding: 10px;
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
  width: auto;
  margin: 5px;
  border: 2px solid #ddd;
  @media (max-width: 1600px) {
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
  width: auto;
  margin-right: 20px;
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
  @media (max-width: 1600px) {
    width: 200px;
    font-size: 1em;
  }
}
.info p {
  font-size: 1em;
  color: #555;
  width: auto;
  max-width: 500px;
  margin-right: 30px;
  word-wrap: break-word;
  text-align: justify;
  @media (max-width: 1600px) {
    width: 350px;
    font-size: 1em;
  }
}
.justificativa-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}
.justify-groupsla {
  display: flex;
}
.justificativa-group span {
  font-weight: bold;
  color: #333;
}
.pergunta textarea {
  resize: none;
  width: auto;
  margin: 0px 10px;
  height: auto;
  padding: 5px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fafafa;
  transition: box-shadow 0.3s ease;
}
.botoes {
  margin-top: 20px;
  width: 100%;
  display: flex;
  justify-content: start;
  gap: 10px;
}
.buttons {
  display: flex;
  gap: 10px;
}
.notasGroup {
  display: flex;
  gap: 10px;
  flex-direction: column;
  align-items: center;
}
.notasGroup input {
  width: 100px;
  padding: 10px;
  font-size: 1.2em;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px;
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
  display: flex;
  align-items: center;
  img {
    width: 20px;
    filter: invert(1);
  }
}
.btn-remover:hover {
  background-color: #c82333;
  transform: scale(1.02);
}
.btn-adicionar {
  background-color: #28A745;
  color: #fff;
  transition: calc(0.3s);
}
.btn-adicionar:hover {
  background-color: #54c96d;
  transform: scale(1.02);
}
.btn-primary {
  background-color: #C7E9FF;
  color: #000000;
  transition: calc(0.3s);
}
.btn-primary:hover {
  background-color: #419dff;
  color: white;
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
  @media (max-width: 1600px) {
    font-size: 1.2em;
  }
}
.nota {
  font-weight: bold;
  font-size: 1.5em;
  @media (max-width: 1600px) {
    font-size: 1.2em;
  }
}
.loading-overlay {
  position: relative;
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
.loading-overlay p {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
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
/* Estilos para o modal de adicionar pergunta */
.modal-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.modal-form .form-group {
  display: flex;
  flex-direction: column;
}
.modal-form .form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}
.modal-form .form-group input,
.modal-form .form-group textarea {
  resize: none;
  margin: 10px;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

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
