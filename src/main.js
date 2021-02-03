import Vue from "vue";
import "./assets/style/index.scss";
import "./plugins/axios";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./i18n";
import "./plugins/element.js";
import "./icons";
import api from "./api/apiHost";
require("./mock/index");
Vue.config.productionTip = false;
Vue.prototype.$api = api;
// 毫秒格式化
Vue.filter("msFormat", val => {
  const s = parseInt(val / 1000);
  const min = parseInt(s / 60);
  const h = parseInt(min / 60);
  const fix = v => (v > 9 ? v : "0" + v);
  return `${fix(h)}:${fix(min % 60)}:${fix(s % 60)}`;
});
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
