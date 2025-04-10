<template>
  <Transition name="fade-horizontal">
    <div class="login-page">
      <div class="image">
        <img src="/public/assets/logo/qualiotsemfundo.png" alt="" />
      </div>
      <div class="formLogin">
        <div class="login-container">
          <h2>Acesse a sua conta</h2>
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="email" placeholder="Digite seu email" required />
            </div>
            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" v-model="password" placeholder="Digite sua senha" required />
            </div>

            <!-- Área dos botões com overlay -->
            <div class="action-buttons">
              <button type="submit" class="login-button" :disabled="isLoading">
                Entrar
              </button>
            </div>
          </form>
          <p class="register-link">
            Não tem uma conta?
            <RouterLink to="/register">Registre-se aqui</RouterLink>
          </p>
          <p :class="['message', messageType]" v-if="message">{{ message }}</p>
          <div v-if="isLoading" class="spinner"></div>
        </div>
          <div v-if="isLoading" class="overlay"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import { setUser } from "../../components/states/auth";

const isLoading = ref(false);
const router = useRouter();
const email = ref("");
const password = ref("");
const message = ref("");
const messageType = ref("");

const handleLogin = async () => {
  try {
    isLoading.value = true;
    const response = await fetch(
      "https://qualiotbackend.onrender.com/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      }
    );
    if (!response.ok) {
      isLoading.value = false;
      const errorData = await response.json();
      message.value =
        errorData.message || "Erro ao fazer login. Verifique suas credenciais.";
      messageType.value = "error";
      return;
    }

    isLoading.value = false;
    const data = await response.json();
    const token = data.userLogin.token;
    const name = data.userLogin.name;

    localStorage.setItem("token", token);
    localStorage.setItem("name", name);
    console.log(data);
    setUser(name);

    message.value = "Login realizado com sucesso!";
    messageType.value = "success";
        setTimeout(() => {
      router.push("/home");
      message.value = "";
    }, 1000);
  } catch (error) {
    isLoading.value = false;
    message.value = "Erro ao conectar com o servidor.";
    messageType.value = "error";
    setTimeout(() => {
      message.value = "";
    }, 2000);
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  gap: 10px;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

img {
  width: 550px;
}

@media (max-width: 700px) {
  .login-page {
    padding: 30px;
    height: auto;
    flex-direction: column;
  }

  img {
    width: 250px;
  }
}

.formLogin {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.image {
  flex-direction: column;
  background-color: #4cb7ff;
  display: flex;
  border-radius: 0px 150px 900px 0px;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.login-container {
  box-shadow: 2px 4px 6px 2px rgba(0, 0, 0, 0.1);
  ;
  width: 100%;
  max-width: 600px;
  padding: 50px;
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
  width: 40%;
  padding: 12px;
  background-color: #007bff;
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
  background-color: #0056b3;
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
  z-index: 2;
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
.action-buttons {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.6);
  z-index: 999;
}

.forgot-password.disabled {
  pointer-events: none;
  opacity: 0.6;
}
</style>
