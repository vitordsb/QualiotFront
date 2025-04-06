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
          component: () => import("../views/pages/ProdutoView.vue"),
        },
        {
          path: "/regras",
          name: "regras",
          component: () => import("../views/pages/RegrasView.vue"),
          meta: { requiresAuth: true, requiresProduct: true },
        },
        {
          path: "/relatorio",
          name: "relatorio",
          component: () => import("../views/pages/RelatorioView.vue"),
          meta: { requiresAuth: true, requiresProduct: true },
        },
        {
          path: "/cadastrados",
          name: "cadastrados",
          component: () => import("../views/pages/CadastradosView.vue"),
          meta: { requiresAuth: true, requiresProduct: true, isAdmin: true },
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    const token = localStorage.getItem("token");
    if (!token) {
      return next({ name: "login" });
    }
  }
  if (to.matched.some((record) => record.meta.isAdmin)) {
    const email = localStorage.getItem("email")
    if (email === "vitordsb2019@gmail.com" ) {
      alert("Você não tem permissão para acessar esta rota.");
      return next({ name: "produtos" });
    }
  }

  if (to.matched.some((record) => record.meta.requiresProduct)) {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "https://qualiotbackend.onrender.com/products",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
      }
      const data = await response.json();

      if (data.product && data.product.length > 0) {
        return next();
      } else {
        alert(
          "Você precisa ter ao menos um produto cadastrado para acessar esta rota."
        );
        return next({ name: "produtos" });
      }
    } catch (error) {
      console.error("Erro ao verificar produtos:", error);
      alert("Erro ao verificar produtos. Tente novamente.");
      return next({ name: "produtos" });
    }
  }
  next();
});

export default router;
