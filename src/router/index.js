import Vue from "vue";
import VueRouter from "vue-router";
import token from "../utils/Token";
import cookies from "../utils/Cookie";
import qs from "qs";

const Create = () =>
  import(/* webpackChunkName: "Create" */ "../views/Create.vue");
const Scenes = () =>
  import(/* webpackChunkName: "Scenes" */ "../views/Scenes.vue");
const Styles = () =>
  import(/* webpackChunkName: "Styles" */ "../views/Styles.vue");
const Music = () =>
  import(/* webpackChunkName: "Music" */ "../views/Music.vue");
const Branding = () =>
  import(/* webpackChunkName: "Branding" */ "../views/Branding.vue");
const Upload = () => import("../views/Upload.vue");

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function replace(location) {
  return originalPush.call(this, location).catch(err => err);
};

Vue.use(VueRouter);

const routes = [
  {
    path: "/Create",
    name: "Create",
    component: Create
  },
  {
    path: "/Upload",
    name: "Upload",
    component: Upload
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
  },
  {
    path: "/Login",
    name: "Login",
    meta: {
      isLoginPage: true
    }
  },
  {
    path: "/Token",
    name: "Token",
    meta: {
      isLoginPage: true
    }
  },
  {
    path: "/",
    redirect: "/Create"
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  // Check if token exist
  if (!token.hasUserToken()) {
    const hashToken = qs.parse(window.location.hash)["#/token"];
    if (hashToken) {
      token.setToken(hashToken);
      window.location.hash = "";
    }
    const { access_token } = to.query;
    if (access_token) {
      // Remove businessId and channel Id
      token.setToken(access_token);
      cookies.remove("businessId");
      cookies.remove("channelId");
    }
    if (hashToken || access_token) {
      return next({ path: "/Create" });
    }
  }
  // Check if login
  if (to.matched.some(record => record.meta.isLoginPage)) {
    // Check businessId channelId
    const { businessId, channelId } = to.query;
    if (businessId && channelId) {
      cookies.set("businessId", businessId);
      cookies.set("channelId", channelId);
    }

    // Redirect
    if (token.hasUserToken()) return token.setTokenAndNext(next, "/Create");
    return next();
  } else {
    if (!token.hasUserToken()) return next({ path: "/Login" });
    return token.setTokenAndNext(next);
  }
});

export const parseQueryParams = params => {
  if (!params) return {};
  const idx = params.indexOf("?");
  return idx !== -1 ? qs.parse(params.slice(idx + 1)) : qs.parse(params);
};

export default router;
