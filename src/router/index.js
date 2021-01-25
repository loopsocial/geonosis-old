import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/"
  },
  {
    path: "/test",
    name: "Test",
    component: () => import("../components/Window")
  }
];

const router = new VueRouter({
  routes
});

export default router;
