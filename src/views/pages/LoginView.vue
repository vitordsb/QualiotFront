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
        Não tem uma conta? <RouterLink to="/register">Registre-se aqui</RouterLink>
      </p>
      <p :class="['message', messageType]" v-if="message">{{ message }}</p>
        <div v-if="isLoading" class="spinner"></div>
    </div>
  </div>
    </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { RouterLink } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();
const email = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');

const handleLogin = async () => {
  try {
    isLoading.value = true;
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
      isLoading.value = false;
      const errorData = await response.json();
      message.value = errorData.message || 'Erro ao fazer login. Verifique suas credenciais.';
      messageType.value = 'error';
      return;
    }
    
    const data = await response.json();
    const token = data.userLogin.token;
    const name = data.userLogin.name 
    
    localStorage.setItem('token', token);
    localStorage.setItem('name', name)
    
    message.value = 'Login realizado com sucesso!';
    messageType.value = 'success';

    setTimeout(() => {
      router.push('/home');
      message.value = '';
    }, 1000);

  } catch (error) {
    isLoading.value = false;
    message.value = 'Erro ao conectar com o servidor.';
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
  gap: 50px;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(105deg, #fff, #00c6ff);
  @media (max-width: 700px){
      padding: 30px;
      height: auto;
      flex-direction: column;
  }
}

img {
  width: 450px;
  border-radius: 50%;
  @media (max-width: 700px){
      width: 250px;
  }
}

.login-container {
  width: 100%;
  max-width: 500px;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border-radius: 15px;
  text-align: center;
  transition: transform 0.3s ease;
}

.login-container:hover {
  transform: scale(1.01);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 36px;
  font-family: 'Roboto', sans-serif;
  font-weight: bold;
}

.form-group {
  margin-bottom: 25px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #555;
}

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
  transition: border 0.3s ease, box-shadow 0.3s ease;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  outline: none;
}

.login-button {
  margin-top: 20px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #00c6ff, #0072ff);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  transition: background 0.3s ease, transform 0.2s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-button:hover {
  background: linear-gradient(135deg, #0072ff, #0056b3);
  transform: translateY(-3px);
}

.register-link {
  margin-top: 15px;
  font-size: 16px;
  color: #555;
}

.register-link a {
  color: #007bff;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #0056b3;
}

.message {
  margin-top: 15px;
  font-size: 16px;
  text-align: center;
}

.message.success {
  color: #28a745;
}

.message.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .login-container {
    padding: 30px;
  }

  h2 {
    font-size: 28px;
  }

  input[type="email"],
  input[type="password"] {
    font-size: 16px;
    padding: 10px;
  }

  .login-button {
    font-size: 18px;
    padding: 10px;
  }
}
.spinner {
  margin: 10px auto;
  width: 50px;
  height: 50px;
  border: 5px solid #e1e4e8;
  border-top: 5px solid #348acf;
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
</style>
