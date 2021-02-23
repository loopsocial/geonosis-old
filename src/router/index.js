import Vue from "vue";
import VueRouter from "vue-router";
// import Template from "../views/Template.vue";
// import SceneEditing from "../views/SceneEditing.vue";
// import Post from "../views/Post.vue";

const Create = () =>
  import(/* webpackChunkName: "Create" */ "../views/Create.vue");
const Scenes = () =>
  import(/* webpackChunkName: "Scenes" */ "../views/Scenes.vue");
const Styles = () =>
  import(/* webpackChunkName: "Styles" */ "../views/Styles.vue");
const Music = () => import(/* webpackChunkName: "Music" */ "../views/Music.vue");
const Branding = () =>
  import(/* webpackChunkName: "Branding" */ "../views/Branding.vue");

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/Scenes"
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
    path: "/Styles",
    name: "Styles",
    component: Styles
  },
  {
    path: "/Music",
    name: "Music",
    component: Music
  },
  {
    path: "/Branding",
    name: "Branding",
    component: Branding
  }
];

const router = new VueRouter({
  routes
});

export default router;
