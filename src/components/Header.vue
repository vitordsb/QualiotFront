<template>
  <header v-if="!isLogin && !isRegister" class="header">
    <div class="container">
      <!-- Dropdown para usuário -->
      <div class="dropdown">
        <button class="dropdown-btn" @click="toggleDropdown">
          <img src="/src/assets/svg/user.png" alt="User Icon">
          <span>Bem vindo, {{ userName }}!</span>
        </button>
        <div class="dropdown-content" v-if="dropdownVisible">
          <a class="logout" @click="logout">Logout</a>
        </div>
      </div>


      <!-- Links centralizados -->
      <nav class="links" :class="{ active: menuVisible }">
        <RouterLink to="/home">Cadastrar produtos</RouterLink>
        <RouterLink to="/regras">Fazer avaliação</RouterLink>
        <RouterLink to="/comparacao">Comparar produtos</RouterLink>
        <RouterLink to="/relatorio">Solicitar relatório</RouterLink>
      </nav>

      <!-- Logo à direita -->
      <div class="logo">
        <img src="/src/assets/logo/qualiot.png" alt="Logo">
      </div>
      <!-- Botão Hamburger -->
      <button class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { onMounted } from 'vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const dropdownVisible = ref(false);
const menuVisible = ref(false);
const isLogin = ref(false);
const isRegister = ref(false);
const userName = localStorage.getItem('name') || "User"

watch(route, (newRoute) => {
  isLogin.value = newRoute.path === '/';
  isRegister.value = newRoute.path === '/register';
});

function logout() {
  window.location.replace('/');
  localStorage.removeItem('name')
  localStorage.removeItem('token')
  localStorage.removeItem('produtoParaDarNota')
  localStorage.removeItem('abaSelecionada')
  localStorage.removeItem('indexSelecionado')
}

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value;
}

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}
</script>

<style scoped>

.header {
  background-color: #F0F2F5;
  padding: 10px 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
}

.links {
  display: flex;
  gap: 20px;
}

.links a {
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.links a:hover {
  color: #3389CE;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  @media (max-width: 700px){
      display: none;
  }
}
.logo img {
  height: 50px;
  width: auto;
  border-radius: 50%;
}

.dropdown {
  position: relative;
}

.dropdown-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 22px;
  font-weight: bold;
}

.dropdown-btn img {
  width: 60px;
  margin-right: 10px;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #dee2e6;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  width: 150px;
  display: flex;
  flex-direction: column;
}

.dropdown-content a {
  padding: 10px;
  text-decoration: none;
  color: #000;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.logout {
  cursor: pointer;
}

/* Botão hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 20;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #000;
}

/* Responsividade */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }
  .dropdown-btn {
    font-size: 16px;
  }
  .dropdown-btn img {
    width: 40px;
  }
  .logo img {
    height: 40px;
  }
  .logo h1 {
    font-size: 18px;
  }

  .links {
    display: none; /* Escondido inicialmente no mobile */
    position: absolute;
    top: 100%;
    left: 0;
    flex-direction: column;
    gap: 10px;
    background-color: #bae2fc;
    width: 100%;
    padding: 10px 0;
    z-index: 15;
  }

  .links.active {
    display: flex; /* Exibe o menu ao clicar no botão hamburger */
  }

  .hamburger {
    display: flex;
  }
}
</style>
