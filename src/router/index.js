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

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("authToken");
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
  }
  else if(){

  }
  next();
});

export default router;
