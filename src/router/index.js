import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: () => import("../views/pages/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/pages/RegisterView.vue"),
    },
    {
      path: "/home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "/home",
          name: "produtos",
          component: () => import("../views/ProdutoView.vue"),
        },
        {
          path: "/regras",
          name: "regras",
          component: () => import("../views/RegrasView.vue"),
        },
        {
          path: "/comparacao",
          name: "comparacao",
          component: () => import("../views/ComparacaoView.vue"),
        },
        {
          path: "/relatorio",
          name: "relatorio",
          component: () => import("../views/RelatorioView.vue"),
        }
      ],
    },
  ],
});

// Verifica a autenticação antes de acessar rotas protegidas
router.beforeEach((to, from, next) => {
  // Verifica se a rota requer autenticação e se o usuário não está autenticado
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"; // Checa se o usuário está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/"); // Redireciona para a página de login se não estiver autenticado
  } else {
    next(); // Caso contrário, permite o acesso à rota
  }
});

export default router;
