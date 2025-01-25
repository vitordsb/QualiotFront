import { createRouter, createWebHashHistory } from "vue-router";
const router = createRouter({
  history: createWebHashHistory(),
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
      name: "home",
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
          path: "/relatorio",
          name: "relatorio",
          component: () => import("../views/RelatorioView.vue"),
        },
        {
          path: "/cadastrados",
          name: "cadastrados",
          component: () => import("../views/CadastradosView.vue"),
        }
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = localStorage.getItem("token");
    if (token) {
      next();
    } else {
      next({ name: "login" });
    }
  } else {
    next();
  }
});


export default router;
