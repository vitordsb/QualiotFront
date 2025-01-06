<template>
  <Transition name="fade-horizontal">
  <div class="login-page">
    <img src="/src/assets/logo/qualiot.png" alt="">
    <div class="login-container">
      <h2>Login</h2>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Digite seu email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input
            type="password"
            id="password"
            v-model="password"
            placeholder="Digite sua senha"
            required
          />
        </div>
        <button type="submit" class="login-button">Entrar</button>
      </form>
      <p class="register-link">
        Não tem uma conta? <router-link to="/register">Registre-se aqui</router-link>
      </p>
      <p :class="['message', messageType]" v-if="message">{{ message }}</p>
    </div>
  </div>
    </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();
const email = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');

const handleLogin = async () => {
  try {
    const response = await fetch('https://qualiotbackend.onrender.com/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      message.value = errorData.message || 'Erro ao fazer login. Verifique suas credenciais.';
      messageType.value = 'error';
      return;
    }
    
    const data = await response.json();
    const token = data.userLogin.token;
    
    localStorage.setItem('token', token);

    message.value = 'Login realizado com sucesso!';
    messageType.value = 'success';

    setTimeout(() => {
      router.push('/home');
      message.value = '';
    }, 1200);

  } catch (error) {
    message.value = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
    messageType.value = 'error';
    setTimeout(() => {
      message.value = '';
    }, 2000);
  }
};
</script>


<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #c2eeff;
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
    img {
      width: 250px;
    }
  }
}

.login-container {
  width: 100%;
  max-width: 600px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 500px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  color: #333;
  font-size: 40px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: 20px;
  color: #333;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  font-size: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-button {
  margin-bottom: 30px ;
  display: flex;
  justify-content: center;
  width: 50%;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
  background-color: #007bff;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 18px;
  transition: calc(.3s);
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}
.message {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
}

.message.success {
  color: green; /* Estilo para mensagens de sucesso */
}

.message.error {
  color: red; /* Estilo para mensagens de erro */
}
.fade-horizontal-enter-active, .fade-horizontal-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-horizontal-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-horizontal-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.fade-horizontal-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.fade-horizontal-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
