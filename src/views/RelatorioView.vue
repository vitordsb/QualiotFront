<template>
  <div class="relatorio-view">
    <h1>Relatório Geral</h1>
    <button @click="gerarRelatorio" class="btn-exportar">
      Exportar Relatório como Planilha
    </button>
    <div v-if="isLoading" class="loading">
      <p>Carregando dados...</p>
    </div>
    <div v-else>
      <h2>Dados do Relatório</h2>
      <pre>{{ relatorio }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as XLSX from "xlsx";

const relatorio = ref({});
const isLoading = ref(true);

const carregarRelatorioLocal = () => {
  try {
    isLoading.value = true;

    // Simula os dados armazenados no localStorage
    const usuario = JSON.parse(localStorage.getItem("user")) || {
      name: "name",
      email: "usuario@exemplo.com",
    };

    const produto = JSON.parse(localStorage.getItem("produto")) || {
      name: "Produto Exemplo",
      description: "Descrição do Produto Exemplo",
    };

    const categorias = JSON.parse(localStorage.getItem("categorias")) || [
      {
        name: "Categoria 1",
        perguntas: [
          {
            title: "Pergunta 1",
            nota: 8,
            justificativa: "Justificativa para a Pergunta 1",
          },
          {
            title: "Pergunta 2",
            nota: 7,
            justificativa: "Justificativa para a Pergunta 2",
          },
        ],
      },
      {
        name: "Categoria 2",
        perguntas: [
          {
            title: "Pergunta 3",
            nota: 9,
            justificativa: "Justificativa para a Pergunta 3",
          },
        ],
      },
    ];

    const mediaFinal =
      localStorage.getItem("mediaFinal") ||
      categorias.reduce((acc, categoria) => {
        const mediaCategoria =
          categoria.perguntas.reduce(
            (sum, pergunta) => sum + (pergunta.nota || 0),
            0
          ) / categoria.perguntas.length;
        return acc + mediaCategoria;
      }, 0) / categorias.length;

    relatorio.value = { usuario, produto, categorias, mediaFinal: mediaFinal.toFixed(2) };
  } catch (error) {
    console.error("Erro ao carregar o relatório:", error);
  } finally {
    isLoading.value = false;
  }
};

const gerarRelatorio = () => {
  try {
    const dados = relatorio.value;

    const planilha = [];

    planilha.push(["Usuário"]);
    planilha.push(["Nome", dados.usuario.name]);
    planilha.push(["Email", dados.usuario.email]);

    planilha.push([]);
    planilha.push(["Produto"]);
    planilha.push(["Nome", dados.produto.name]);
    planilha.push(["Descrição", dados.produto.description]);

    dados.categorias.forEach((categoria) => {
      planilha.push([]);
      planilha.push([`Categoria: ${categoria.name}`]);
      planilha.push(["Pergunta", "Nota", "Justificativa"]);

      categoria.perguntas.forEach((pergunta) => {
        planilha.push([
          pergunta.title,
          pergunta.nota || "Não informada",
          pergunta.justificativa || "Não informada",
        ]);
      });
    });

    planilha.push([]);
    planilha.push(["Média Final"]);
    planilha.push(["", dados.mediaFinal]);
    const ws = XLSX.utils.aoa_to_sheet(planilha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");
    XLSX.writeFile(wb, "Relatorio_Geral.xlsx");
    alert("Relatório exportado com sucesso!");
  } catch (error) {
    console.error("Erro ao gerar o relatório:", error);
    alert("Erro ao gerar o relatório.");
  }
};

onMounted(() => {
  carregarRelatorioLocal();
});
</script>

<style scoped>
.relatorio-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.btn-exportar {
  padding: 10px 15px;
  font-size: 16px;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-exportar:hover {
  background-color: #0056b3;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #555;
}
</style>
