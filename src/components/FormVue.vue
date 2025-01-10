<script setup>
import { defineProps, ref, onMounted } from 'vue';
const perguntas = ref([])
const props = defineProps({
  tabIndex: {
    type: Number,
    required: true
  }
})
const buscarPerguntas = async () => {
  try {
    const token = localStorage.getItem('token');
    const abaSelecionada = localStorage.getItem("abaSelecionada");
    const response = await fetch(`https://qualiotbackend.onrender.com/questions/get-by-category/${abaSelecionada}?details=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    perguntas.value = data.questionCategory.map((pergunta) => pergunta.title);
    console.log(perguntas.value);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
  }
} 
onMounted(() => {
  buscarPerguntas();
});
</script>
<template>
  <div class="form">
    <div class="questionario">
      <div class="titulo">
        <h3>Perguntas norteadoras</h3>
      </div>
      <form action="">
        <div class="pergunta" v-for="(pergunta, index) in perguntas" :key="index">
          <label :for="'pergunta' + index">{{ pergunta }}:</label>
          <input type="number" :id="'pergunta' + index" :name="'pergunta' + index" min="0" max="10" />
        </div>
      </form>
    </div>
    <div class="botoes">
      <button type="submit" class="btn btn-primary">Enviar Respostas</button>
      <button type="reset" class="btn btn-secondary">Limpar</button>
    </div>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  margin: 30px auto;
  width: 100%;
  max-width: 1000px;
  background-color: #f9fafc;
  border: 1px solid #e1e4e8;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0;
    margin: 0 auto;
  }
}

.questionario {
  padding: 100px;
  width: 100%;
  @media (max-width: 768px) {
    padding: 0;
    height: auto;
    margin: 0;
  }
}

.titulo h3 {
  text-align: center;
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 50px;
  color: #333;
  @media (max-width: 768px) {
    margin-top: 30px;
    font-size: 1.5em;
  }
}

.pergunta {
  width: 100%;
  justify-content: center;
  display: flex;
  gap: 50px;
  align-items: center;
  margin-bottom: 15px;
  @media (max-width: 768px) {
    padding: 0;
    width: 100%;
    gap: 0;
  }
}

.pergunta label {
  font-size: 2em;
  color: #555;
  margin-bottom: 5px;
  @media (max-width: 768px) {
    font-size: 1em;
  }
}

.pergunta input {
  text-align: center;
  display: flex;
  width: 20%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 2em;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
  @media (max-width: 768px) {
    font-size: 1em;
  }
}

.pergunta input:focus {
  outline: none;
  box-shadow: none;
  border: none;
  border-color: none;
}

.botoes {
  gap: 150px;
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

@media (max-width: 768px) {
  .form {
    width: 95%;
  }

  .botoes {
    flex-direction: column;
    gap: 10px;
  }

  .btn {
    width: 100%;
  }
}
</style>
