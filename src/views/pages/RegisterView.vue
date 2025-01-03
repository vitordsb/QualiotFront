<template>
  <Transition name="fade-horizontal">
  <div class="register-page">
    <div class="register-container">
      <h2>Registre-se</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Nome</label>
          <input
            type="text"
            id="name"
            v-model="name"
            placeholder="Digite seu nome"
            required
          />
        </div>
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
        <button type="submit" class="register-button">Registrar</button>
      </form>
      <p class="login-link">
        Já tem uma conta? <router-link to="/">Faça login aqui</router-link>
      </p>
      <p :class="['message', messageType]" v-if="message">{{ message }}</p>
    </div>
    <img src="/src/assets/logo/qualiot.png" alt="">
  </div>
</Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');

const handleRegister = async () => {
  try {
    if (!name.value || !email.value || !password.value) {
      message.value = 'Por favor, preencha todos os campos.';
      messageType.value = 'error';
      return;
    }
    const response = await fetch('https://qualiotbackend.onrender.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      message.value = errorData.message || 'Erro ao registrar. Tente novamente.';
      messageType.value = 'error';
      return;
    }
    message.value = 'Registro realizado com sucesso! Redirecionando para o login...';
    messageType.value = 'success';
    setTimeout(() => {
      router.push('/');
    }, 3000);
  } catch (error) {
    message.value = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
    messageType.value = 'error';
  }
};

</script>
<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f2f2f2;
  @media (max-width: 768px) {
    padding: 20px;
    flex-direction: column-reverse;
    height: auto;
    img {
      width: 250px;
    }
  }
}

.register-container {
  width: 100%;
  max-width: 600px;
  padding: 20px;
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
  margin-bottom: 20px;
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

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  font-size: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.register-button {
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  margin-right: auto;
  padding: 10px;
  background-color: #007bff;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: calc(.3s);
}
.register-button:hover {
  background-color: #0056b3;
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
.message {
  margin-top: 10px;
  font-size: 16px;
  text-align: center;
}

.message.success {
  color: green; /* Mensagem de sucesso */
}

.message.error {
  color: red; /* Mensagem de erro */
}
</style>
