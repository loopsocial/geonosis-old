import Vue from "vue";
import VueRouter from "vue-router";
import Create from "../views/Create.vue";
import Template from "../views/Template.vue";
import SceneEditing from "../views/SceneEditing.vue";
import Post from "../views/Post.vue";
import Scenes from "../views/Scenes";
Vue.use(VueRouter);

const routes = [
  {
    path: "/"
  },
  {
    path: "/Create",
    name: "Create",
    component: Create
  },
  {
    path: "/Scenes",
    name: "Scenes",
    component: Scenes
  },
  {
    path: "/Template",
    name: "Template",
    component: Template
  },
  {
    path: "/SceneEditing",
    name: "SceneEditing",
    component: SceneEditing
  },
  {
    path: "/Post",
    name: "Post",
    component: Post
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
