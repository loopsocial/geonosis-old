export default {
  namespaced: true,
  state: () => ({
    isDragging: false,
    style: {
      width: 0,
      heigh: 0,
      top: 0,
      left: 0,
      backgroundImage: ""
    }
  }),
  mutations: {
    changeDragVisible(state, payload) {
      state.isDragging = payload;
    },
    changeStyle(state, style) {
      Object.keys(style).forEach(item => {
        state.style[item] = style[item];
      });
    }
  }
};
