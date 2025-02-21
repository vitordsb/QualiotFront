<template>
  <header v-if="!isLogin && !isRegister" class="header">
    <div class="container">
      
      <div class="dropdown">
        <button class="dropdown-btn" @click="toggleDropdown">
          <img src="/public/assets/logo/qualiot.png" alt="User Icon" />
          <span>Bem vindo, {{ userName }}!</span>
        </button>
        <div class="dropdown-content" v-if="dropdownVisible">
          <a class="logout" @click="logout">Sair</a>
        </div>
      </div> 

      <nav class="links" :class="{ active: menuVisible }">
        <RouterLink 
          to="/home" 
          :class="{ active: activeLink === '/home' }" 
          @click.native="setActiveLink('/home')"
        >
          Cadastrar produtos
        </RouterLink>

        <!-- Exibe somente se houver produto cadastrado no banco -->
        <RouterLink 
          v-if="temProduto" 
          to="/regras" 
          :class="{ active: activeLink === '/regras' }" 
          @click.native="setActiveLink('/regras')"
        >
          Fazer avaliação
        </RouterLink>
        <RouterLink 
          v-if="temProduto" 
          to="/relatorio" 
          :class="{ active: activeLink === '/relatorio' }" 
          @click.native="setActiveLink('/relatorio')"
        >
          Solicitar relatório
        </RouterLink>

        <RouterLink 
          to="/cadastrados" 
          :class="{ active: activeLink === '/cadastrados' }" 
          @click.native="setActiveLink('/cadastrados')"
        >
          Usuários cadastrados
        </RouterLink>
      </nav>

      <button class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { auth, clearUser } from './states/auth';

const router = useRouter();
const route = useRoute();

const dropdownVisible = ref(false);
const menuVisible = ref(false);
const isLogin = ref(false);
const isRegister = ref(false);
const activeLink = ref(route.path);
const userName = computed(() => auth.userName);

// Ref que indica se há pelo menos um produto no banco de dados
const temProduto = ref(false);

// Função para buscar os produtos no banco de dados
async function verificarProdutos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://qualiotbackend.onrender.com/products', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar produtos');
    }
    //recarrega a pagina uma vez 
    const data = await response.json();
    // Supondo que o backend retorne os produtos em data.product
    temProduto.value = data.product && data.product.length > 0;
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    temProduto.value = false;
  }
}

// Chama a função quando o componente é montado
onMounted(() => {
  verificarProdutos();
});

watch(route, (newRoute) => {
  isLogin.value = newRoute.path === '/';
  isRegister.value = newRoute.path === '/register';
  activeLink.value = newRoute.path;
});

function logout() {
  clearUser();
  router.push('/');
}

function toggleDropdown() {
  dropdownVisible.value = !dropdownVisible.value;
}

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

function setActiveLink(path) {
  activeLink.value = path;
}
</script>

<style scoped>
.header {
  padding: 10px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: #c9c9c986 2px solid;
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
  gap: 10px;
}

.links a.active {
  background-color: #3389CE;
  color: #ffffff;
}

.links a {
  background-color: #bae2fc;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  font-size: 16px;
  font-weight: bold;
  color: #000000;
  transition: .3s;
}

.links a:hover {
  background-color: #3389CE;
  color: #ffffff;
}

.dropdown-btn img {
  height: auto;
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

  .links {
    display: none; 
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
    display: flex
  }

  .hamburger {
    display: flex;
  }
}
</style>
