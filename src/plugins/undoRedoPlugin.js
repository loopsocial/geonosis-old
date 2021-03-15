import UndoRedoHistory from "../utils/UndoRedoHistory";
import Vue from "vue";

const cloneDeep = require("clone-deep");

const undoRedoHistory = new UndoRedoHistory();

Vue.prototype.$undoRedoHistory = undoRedoHistory;

window.undoRedoHistory = undoRedoHistory; // 测试

const undoRedoPlugin = store => {
  // initialize and save the starting stage
  undoRedoHistory.init(store);
  // let firstState = cloneDeep(store.state);
  // undoRedoHistory.addState(firstState);
  const exclude = ["clip/setCurrentVideoUuid", "clip/init"];
  store.subscribe((mutation, state) => {
    // is called AFTER every mutation
    if (/^clip\//.test(mutation.type) && !exclude.includes(mutation.type)) {
      console.warn("添加到撤销栈", state.clip);
      undoRedoHistory.addState(cloneDeep(state.clip));
    }
  });
};
export default undoRedoPlugin;
