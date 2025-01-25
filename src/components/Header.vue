<template>
  <header v-if="!isLogin && !isRegister" class="header">
    <div class="container">
      
      <div class="dropdown">
        <button class="dropdown-btn" @click="toggleDropdown">
          <img src="/src/assets/logo/qualiot.png" alt="User Icon">
          <span>Bem vindo, {{ userName }}!</span>
        </button>
        <div class="dropdown-content" v-if="dropdownVisible">
          <a class="logout" @click="logout">Sair</a>
        </div>
      </div> <

      <nav class="links" :class="{ active: menuVisible }">
        <RouterLink 
          to="/home" 
          :class="{ active: activeLink === '/home' }" 
          @click.native="setActiveLink('/home')"
        >
          Cadastrar produtos
        </RouterLink>
        <RouterLink 
          to="/regras" 
          :class="{ active: activeLink === '/regras' }" 
          @click.native="setActiveLink('/regras')"
        >
          Fazer avaliação
        </RouterLink>
        <RouterLink 
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
          Ver cadastrados
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
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';
import { auth, clearUser } from './states/auth';

const router = useRouter();
const route = useRoute();

const dropdownVisible = ref(false);
const menuVisible = ref(false);
const isLogin = ref(false);
const isRegister = ref(false);
const activeLink = ref(route.path);
const userName = computed(() => auth.userName);

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
  background-color: transparent;
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

.links a.active {
  background-color: #3389CE;
  color: #ffffff;
}

.links a {
  background-color: #bae2fc;
  padding: 15px;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.53);
  border-radius: 10px;
  cursor: pointer;
  text-decoration: none;
  font-size: 18px;
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
