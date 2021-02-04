import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isFinishNvs: false
  },
  mutations: {
    setNvsStatus(state, isFinish) {
      state.isFinishNvs = isFinish;
    }
  },
  actions: {
    setNvsStatus({ commit }, isFinish) {
      commit("setNvsStatus", isFinish);
    }
  },
  modules: {}
});
