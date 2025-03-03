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
    },
    draggingClip: null
  }),
  mutations: {
    changeDragVisible(state, payload) {
      state.isDragging = payload;
    },
    changeStyle(state, style) {
      state.style = {
        ...state.style,
        ...style
      };
    },
    setDraggingClip(state, clip) {
      state.draggingClip = clip;
    }
  }
};
