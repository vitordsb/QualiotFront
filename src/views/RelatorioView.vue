<script setup>
import { ref, onMounted } from 'vue';
import * as XLSX from 'xlsx';

const produtos = ref([]);
const usuarioNome = ref('');
const usuarioEmail = ref('');

function calcularMediaFinal(medias) {
  const notasValidas = medias.filter((nota) => nota !== null && nota !== '');
  const soma = notasValidas.reduce((acc, nota) => acc + parseFloat(nota), 0);
  return notasValidas.length > 0 ? (soma / notasValidas.length).toFixed(2) : '0.00';
}

onMounted(() => {
  const userData = JSON.parse(localStorage.getItem('userName') || '{}');
  usuarioNome.value = userData.name || 'Usuário';
  usuarioEmail.value = userData.email || 'sem_email@exemplo.com';

  // Recupera os produtos do localStorage e faz o parse do JSON
  const produtosSalvos = JSON.parse(localStorage.getItem('produtos') || '[]');

  produtos.value = produtosSalvos.map((produto) => {
    const medias = JSON.parse(localStorage.getItem('mediaPorAba') || '[]').map((media) =>
      media ? parseFloat(media) : null
    );

    // Recupera as avaliações com justificativas para o produto específico
    const avaliacoes = JSON.parse(localStorage.getItem(`avaliacoes_${produto.nome}`) || '[]');
    const justificativas = avaliacoes.map(avaliacao => avaliacao.justificativa || 'Sem justificativa');

    const mediaFinal = calcularMediaFinal(medias);

    return { ...produto, medias, justificativas, mediaFinal };
  });
});

function exportarParaExcel() {
  const usuarioInfo = [
    { Usuário: usuarioNome.value, Email: usuarioEmail.value }
  ];

  const data = produtos.value.map(produto => {
    const row = {
      Nome: produto.nome,
      Descrição: produto.descricao,
      'Média Final': produto.mediaFinal,
    };
    produto.medias.forEach((media, index) => {
      row[`Categoria ${index + 1} - Nota`] = media !== null ? media : 'Sem avaliação';
      row[`Categoria ${index + 1} - Justificativa`] = produto.justificativas[index] || 'Sem justificativa';
    });
    return row;
  });

  const dadosParaExportar = [...usuarioInfo, {}, ...data];

  const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório de Avaliação');

  XLSX.writeFile(workbook, 'Relatorio_Avaliacao_Produtos.xlsx');
}
</script>



<template>
  <div class="relatorio-container">
    <h1>Relatório de Avaliação dos Produtos</h1>
    <p><strong>Usuário:</strong> {{ usuarioNome }}</p>
    <p><strong>Email:</strong> {{ usuarioEmail }}</p>
    <button @click="exportarParaExcel" class="export-button">Exportar para Excel</button>
    <div v-if="produtos.length">
      <div v-for="(produto, index) in produtos" :key="index" class="produto-relatorio">
        <h2>{{ produto.nome }}</h2>
        <p><strong>Descrição:</strong> {{ produto.descricao }}</p>
        <h3>Médias e Justificativas das Categorias:</h3>
        <ul>
          <li v-for="(media, idx) in produto.medias" :key="idx">
            <strong>Categoria {{ idx + 1 }}:</strong> 
            Nota: {{ media !== null ? media : 'Sem avaliação' }} |
            Justificativa: {{ produto.justificativas[idx] || 'Sem justificativa' }}
          </li>
        </ul>
        <p><strong>Média Final:</strong> {{ produto.mediaFinal }}</p>
      </div>
    </div>
    <p v-else>Nenhum produto cadastrado.</p>
  </div>
</template>

<style scoped>
.relatorio-container {
  padding: 20px;
  height: 92vh;
  max-width: 600px;
  margin: 0 auto;
}

li {
  list-style-type: none;
}

.produto-relatorio {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.export-button {
  margin-bottom: 20px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #4CAF50;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.export-button:hover {
  background-color: #45a049;
}
</style>
