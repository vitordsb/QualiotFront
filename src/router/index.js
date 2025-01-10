import { createRouter, createWebHistory } from "vue-router";
import LoginView from "../views/pages/LoginView.vue";
import RegisterView from "../views/pages/RegisterView.vue";
import HomeView from "../views/HomeView.vue";
import ProdutoView from "../views/ProdutoView.vue";
import RegrasView from "../views/RegrasView.vue";
import ComparacaoView from "../views/ComparacaoView.vue";
import RelatorioView from "../views/RelatorioView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "login",
      component: LoginView,
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/home",
      component: HomeView,
      meta: {requiresAuth: true},
      children: [
        {
          path: "/home",
          name: "produtos",
          component: ProdutoView,
        },
        {
          path: "/regras",
          name: "regras",
          component: RegrasView,
        },
        {
          path: "/comparacao",
          name: "comparacao",
          component: ComparacaoView,
        },
        {
          path: "/relatorio",
          name: "relatorio",
          component: RelatorioView,
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
