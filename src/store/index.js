import Vue from "vue";
import Vuex from "vuex";
import draggable from "./modules/draggable";
import clip from "./modules/clip";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isFinishNvs: false,
    editBoxStatus: false // 字幕编辑窗是否打开中
  },
  mutations: {
    setNvsStatus(state, isFinish) {
      state.isFinishNvs = isFinish;
    },
    setEditBoxStatus(state, status) {
      state.editBoxStatus = status;
    }
  },
  actions: {
    setNvsStatus({ commit }, isFinish) {
      commit("setNvsStatus", isFinish);
    },
    setEditBoxStatus({ commit }, status) {
      commit("setEditBoxStatus", status);
    }
  },
  modules: {
    draggable,
    clip
  }
});
