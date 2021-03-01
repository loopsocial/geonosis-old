const cloneDeep = require("clone-deep");
import Keys from "../utils/EventBusKeys";
import Bus from "../EventBus";
export default class UndoRedoHistory {
  store;
  history = [];
  currentIndex = -1;

  init(store) {
    this.store = store;
  }

  addState(state) {
    // may be we have to remove redo steps
    if (this.currentIndex + 1 < this.history.length) {
      this.history.splice(this.currentIndex + 1);
    }
    this.history.push(state);
    this.currentIndex++;
  }

  undo() {
    const prevState = this.history[this.currentIndex - 1];
    // take a copy of the history state
    // because it would be changed during store mutations
    // what would corrupt the undo-redo-history
    // (same on redo)
    if (!prevState) return;
    console.log("撤销");
    this.store.replaceState(
      cloneDeep({
        ...this.store.state,
        clip: prevState
      })
    );
    this.currentIndex--;
    Bus.$emit(Keys.rebuildTimeline);
    Bus.$emit(Keys.closePanel);
  }

  redo() {
    const nextState = this.history[this.currentIndex + 1];
    if (!nextState) return;
    console.log("恢复");
    this.store.replaceState(
      cloneDeep({
        ...this.store.state,
        clip: nextState
      })
    );
    this.currentIndex++;
    Bus.$emit(Keys.rebuildTimeline);
    Bus.$emit(Keys.closePanel);
  }
}
