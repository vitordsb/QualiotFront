<script setup>
import { defineProps, ref, onMounted } from 'vue';

const props = defineProps({
  tabIndex: {
    type: Number,
    required: true,
  },
});

const justificativa = ref('');
const descricao = ref([]);
const perguntas = ref([]);
const isLoading = ref(true);
const notas = ref([]);
const pesos = ref([]);
const media = ref(0);
const finalGrade = ref(0);
const proeficiencia = ref('não avaliado');

proeficiencia.value = 'não avaliado';

const distribuirPesos = () => {
  const numPerguntas = perguntas.value.length;
  switch (numPerguntas) {
    case 1:
      pesos.value = [4];
      break;
    case 2:
      pesos.value = [4, 3];
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
      const basePeso = 2;
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
  } catch (error) {
    console.error('Erro ao cadastrar pergunta:', error);
    alert('Erro ao cadastrar pergunta. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

const removerPergunta = async (index) => {
  try {
    isLoading.value = true;
    const perguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
    if (!perguntasId) {
      throw new Error('Nenhum ID de pergunta encontrado.');
    }
    const perguntasIdArray = perguntasId.split(',');
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

    perguntasIdArray.splice(index, 1);
    localStorage.setItem(`perguntasId_tab_${props.tabIndex}`, perguntasIdArray.join(','));
    localStorage.setItem(`perguntas_tab_${props.tabIndex}`, perguntas.value);
    localStorage.setItem(`descricao_tab_${props.tabIndex}`, descricao.value);
    localStorage.setItem(`notas_tab_${props.tabIndex}`, notas.value);
    localStorage.setItem(`pesos_tab_${props.tabIndex}`, pesos.value);

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

    distribuirPesos();

    localStorage.setItem(`perguntas_tab_${props.tabIndex}`, perguntas.value);
    localStorage.setItem(`descricao_tab_${props.tabIndex}`, descricao.value);
    localStorage.setItem(`perguntasId_tab_${props.tabIndex}`, perguntaId.join(','));
    localStorage.setItem(`notas_tab_${props.tabIndex}`, notas.value);
    localStorage.setItem(`pesos_tab_${props.tabIndex}`, pesos.value);

    console.log(data);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    alert('Erro ao buscar perguntas. Tente novamente.');
  } finally {
    isLoading.value = false;
    computeFinalGrade();
  }
};

const calcularMediaAba = async () => {
  isLoading.value = true;
  const token = localStorage.getItem('token');
  const perguntasId = localStorage.getItem(`perguntasId_tab_${props.tabIndex}`);
  if (!perguntasId) {
    alert('Nenhuma pergunta encontrada para esta aba.');
    isLoading.value = false;
    return;
  }

  const perguntasIdArray = perguntasId.split(',');

  try {
    let somaPesos = 0;
    let somaPonderada = 0;

    for (let i = 0; i < perguntas.value.length; i++) {
      if (notas.value[i] !== undefined && notas.value[i] !== null) {
        const response = await fetch(`https://qualiotbackend.onrender.com/questions/${perguntasIdArray[i]}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            grade: notas.value[i],
          }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao atualizar nota da pergunta ${perguntas.value[i]}`);
        }

        const peso = pesos.value[i];
        somaPonderada += parseFloat(notas.value[i]) * peso;
        somaPesos += peso;
      }
    }

    const resultadoMedia = somaPesos > 0 ? (somaPonderada / somaPesos).toFixed(2) : 0;
    console.log(`Média ponderada calculada para tabIndex ${props.tabIndex}: ${resultadoMedia}`);
    media.value = Number(resultadoMedia);
    localStorage.setItem(`media_tab_${props.tabIndex}`, resultadoMedia);
  } catch (error) {
    console.error('Erro ao calcular a média ponderada:', error);
    alert('Erro ao calcular a média. Tente novamente.');
  } finally {
    isLoading.value = false;
    computeFinalGrade();
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

  finalGrade.value = contadorMedias > 0 ? (somaMedias / contadorMedias).toFixed(2) : 0;
  console.log(`Média final aritmética simples: ${finalGrade.value}`);

  if (finalGrade.value < 5) {
    proeficiencia.value = 'baixo';
  } else if (finalGrade.value <= 8) {
    proeficiencia.value = 'medio';
  } else {
    proeficiencia.value = 'alto';
  }

  localStorage.setItem('finalGrade', finalGrade.value);
};

onMounted(() => {
  buscarPerguntas();
  const storedMedia = localStorage.getItem(`media_tab_${props.tabIndex}`);
  if (storedMedia !== null) {
    media.value = Number(storedMedia);
  }
  computeFinalGrade();
});
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
        <form @submit.prevent>
          <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
            <div class="sla">
              <label :for="'pergunta' + index">{{ pergunta }}:</label>
              <p> {{ descricao[index] }}</p>
              <span>Nota:</span>
              <input v-model.number="notas[index]" 
                type="number" 
                :id="'pergunta' + index" 
                :name="'pergunta' + index" 
                min="0" 
                max="10" />
            </div>
            <span>Justificativa:</span>
            <textarea 
              v-model="justificativa" 
              :name="'justificativa' + index" 
              :id="'justificativa' + index" 
              cols="30" 
              rows="3">
            </textarea>
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
        <button @click="calcularMediaAba" class="btn btn-primary">
          Calcular média
        </button>
      </div>
    </template>
    <div class="calculos">
      <div class="mediaCalculate">
        <div class="title">
          <h1>Nota da categoria:</h1>
        </div>
        <div class="nota">
          {{ media }}
        </div>
      </div>
      <div class="mediaCalculateFinal">
        <div class="title">
          <h1>Média Final:</h1>
        </div>
        <div class="nota">
          {{ finalGrade }}
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
</template>

<style scoped>
.calculos {
  display: flex;
  margin-top: 10px;
  width: 100%;
  justify-content: space-between;
}

.proeficientContainer {
  width: 100%;
  margin-top: 10px;
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 10px;
  color: white;
}

.proeficientContainer.baixo {
  color: #dc3545;
}

.proeficientContainer.medio {
  color: #ffc107; 
  color: black; 
}

.proeficientContainer.alto {
  color: #28a745;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: end;
  padding: 20px;
  width: 100%;
  max-width: 1500px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.318);
}

.loading {
  color: #555;
  display: flex;
  margin-right: auto ;
  margin-left: auto;
  flex-direction: column;
  font-size: 1.2em;
  align-items: center;
}

.spinner {
  display: flex;
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
  display: flex;
  justify-content: center;
  width: auto;
}

.pergunta textarea {
  resize: none;
  width: 50%;
  height: 60px;
  padding: 5px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  background-color: #e4e4e4;
  transition: box-shadow 0.3s ease;
}

.sla {
  align-items: center;
  gap: 40px;
  width: 100%;
  display: flex;
}

.sla p {
  font-size: 1em;
  text-align: justify;
  width: 400px;
  word-wrap: break-word;
}

.pergunta {
  padding: 10px;
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
  width: 300px;
  font-weight: bold;
  font-size: 1.5em;
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
  padding: 10px 20px;
  font-size: 1.2em;
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
  padding: 10px;
  border-radius: 10px;
  display: flex;
  margin-top: 10px;
}

.mediaCalculateFinal {
  background-color: #6c757d; 
  color: white;
}

.title h1 {
  font-size: 30px;
}

.nota {
  font-weight: bold;
  font-size: 32px;
}
</style>
