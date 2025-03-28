<template>
  <Transition name="fade-horizontal">
    <div class="register-page">
      <div class="containerRegister">
        <div class="register-container">
          <h2>Crie seu registro!</h2>
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
            Já tem uma conta? <RouterLink to="/">Faça login aqui</RouterLink>
          </p>
          <p :class="['message', messageType]" v-if="message">{{ message }}</p>
          <div v-if="isLoading" class="spinner"></div>
        </div>
      </div>
      <div class="imageRegister">
        <img src="/public/assets/logo/qualiotsemfundo.png" alt="" />
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RouterLink } from "vue-router";

const isLoading = ref(false);
const router = useRouter();
const name = ref("");
const email = ref("");
const password = ref("");
const message = ref("");
const messageType = ref("");

const handleRegister = async () => {
  try {
    isLoading.value = true;
    const response = await fetch("https://qualiotbackend.onrender.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    });
    isLoading.value = false;
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      isLoading.value = false;
      const errorData = await response.json();
      message.value =
        errorData.message || "Erro ao registrar. Verifique suas credenciais.";
      messageType.value = "error";
      return;
    }
    message.value =
      "Cadastro realizado com sucesso! Redirecionando para o login...";
    messageType.value = "success";

    setTimeout(() => {
      message.value = "";
      router.push("/");
    }, 2000);
  } catch (error) {
    isLoading.value = false;
    console.error("Erro ao registrar:", error);
    message.value = "Erro ao registrar. Verifique suas credenciais.";
    messageType.value = "error";
    setTimeout(() => {
      message.value = "";
    }, 3000);
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  @media (max-width: 700px) {
    padding: 30px;
    height: auto;
    flex-direction: column-reverse;
  }
}

.containerRegister {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.imageRegister {
  flex-direction: column;
  background-color: #4cb7ff;
  display: flex;
  border-radius: 150px 0px 0px 900px;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

img {
  width: 800px;
}

.register-container {
  width: 100%;
  max-width: 600px;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 2px 4px 6px 2px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease;
}

.register-container:hover {
  transform: scale(1.01);
}

h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 36px;
  font-family: "Roboto", sans-serif;
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

input[type="text"],
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

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  outline: none;
}

.register-button {
  margin-top: 10px;
  width: 50%;
  padding: 12px;
  background-color: #4CB7FF;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 20px;
  font-weight: bold;
  transition: background 0.3s ease, transform 0.2s ease;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-button:hover {
  background-color: #3997fd;
  transform: translateY(-3px);
}

.login-link {
  margin-top: 15px;
  font-size: 16px;
  color: #555;
}

.login-link a {
  color: #007bff;
  font-weight: bold;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-link a:hover {
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
  .register-container {
    padding: 30px;
  }

  h2 {
    font-size: 28px;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"] {
    font-size: 16px;
    padding: 10px;
  }

  .register-button {
    font-size: 18px;
    padding: 10px;
  }

  img {
    width: 100px;
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
