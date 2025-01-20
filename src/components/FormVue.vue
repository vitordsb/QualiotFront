<script setup>
import { defineProps, ref, onMounted } from 'vue';
import MediaCalculator from './MediaCalculator.vue';

onMounted(() => {
  buscarPerguntas();
});

const justificativa = ref('');
const descricao = ref([]);
const perguntas = ref([]);
const isLoading = ref(true);

const props = defineProps({
  tabIndex: {
    type: Number,
    required: true,
  },
});

const adicionarPergunta = async () => {
  try {
    isLoading.value = true;
    const tituloPergunta = prompt('Insira o nome da pergunta:');
    const descricaoPergunta = prompt('Insira a descricao da pergunta:');
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
    perguntas.value.push(perguntas);
    const data = await response.json();
    alert('Pergunta cadastrada');
    console.log('Pergunta cadastrada com sucesso:', data);
    buscarPerguntas()
  } catch (error) {
    isLoading.value = false;
    console.error('Erro ao cadastrar pergunta:', error);
  }
}

const removerPergunta = async (index) => {
  try {
    isLoading.value = true;
    const perguntaId = localStorage.getItem('perguntasId').split(',')[index];
    const token = localStorage.getItem('token');
    const response = await fetch(`https://qualiotbackend.onrender.com/questions/${perguntaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      perguntas.value.splice(index, 1);
      descricao.value.splice(index, 1);
      const perguntasId = localStorage.getItem('perguntasId').split(',');
      perguntasId.splice(index, 1);
      localStorage.setItem('perguntasId', perguntasId.join(','));
    }
    buscarPerguntas()
    const data = await response.json();
    console.log('Pergunta removida com sucesso:', data);
  } catch (error) {
    isLoading.value = false;
    console.error('Erro ao remover pergunta:', error);
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
    const data = await response.json();
    const perguntaId = data.questionCategory.map((pergunta) => pergunta._id);
    localStorage.setItem('perguntasId', perguntaId);

    perguntas.value = data.questionCategory.map((pergunta) => pergunta.title);
    descricao.value = data.questionCategory.map((pergunta) => pergunta.announced);

    localStorage.setItem('perguntas', perguntas.value);
    localStorage.setItem('descricao', descricao.value);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>


<template>
  <div class="form">
    <template v-if="isLoading">
      <div class="loading">
        <div class="spinner"></div>
        <p>Carregando perguntas, por favor aguarde...</p>
      </div>
    </template>
    <template v-else>
      <div class="questionario">
        <form action="">
          <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
            <div class="sla">
              <label :for="'pergunta' + index">{{ pergunta }}:</label>
              <p> {{ descricao[index] }}</p>
              <span>Nota:</span>
              <input type="number" :id="'pergunta' + index" :name="'pergunta' + index" min="0" max="10" />
            </div>
            <span>Justificativa:</span>
            <textarea :name="justificativa + index" :id="'justificativa' + index" cols="30" rows="10" />
            <button @click.prevent="removerPergunta(index)" class="btn btn-remover">Excluir</button>
          </div>
        </form>
      </div>
      <div class="botoes">
        <button @click="adicionarPergunta" class="btn btn-adicionar">
          Adicionar questão
        </button>
      </div>
      <div class="botoes">
        <button type="submit" class="btn btn-primary">Enviar Respostas</button>
        <button type="reset" class="btn btn-secondary">Limpar</button>
      </div>
    </template>
  </div>
    <MediaCalculator/>
</template>


<style scoped>
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  width: 100%;
  max-width: 1400px;
  background-color: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.questionario {
  padding: 10px;
  width: auto;
}

.pergunta textarea {
  resize: none;
  width: 50%;
  height: 50px;
  text-align: center;
  padding: 5px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  background-color: #e4e4e4;
  transition: box-shadow 0.3s ease;
}

.titulo h3 {
  text-align: center;
  font-size: 2.5em;
  font-weight: bold;
  color: #333;
}
.pergunta .sla {
  width: 100%;
  gap: 20px;
  align-items: center;
  display: flex;
}

.sla p {
  font-size: 1em;
  text-align: start;
  width: auto;
}
.pergunta {
  width: 100%;
  justify-content: center;
  display: flex;
  gap: 30px;
  align-items: center;
  margin-bottom: 15px;
}

.pergunta label {
  display: block;
  text-align: start;
  width: 100%;
  font-size: 1.1em;
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
  margin-top: 20px;
}

.btn {
  padding: 10px 15px;
  font-size: 1em;
  font-weight: bold;
  border: none;
  border-radius: 8px;
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

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #495057;
  transform: scale(1.05);
}
</style>
