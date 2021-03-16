const cloneDeep = require("clone-deep");

export default class OperateStack {
  stack = [];
  currentIndex = -1;

  get isOnTop() {
    return this.stack.length - 1 === this.currentIndex;
  }
  get isOnBottom() {
    return this.currentIndex === 0;
  }

  // 添加快照
  pushSnapshot(snapshot) {
    const snapshotCopy = cloneDeep(snapshot);
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(snapshotCopy);
    this.currentIndex += 1;
  }
  // 清空快照
  clearStack() {
    this.currentIndex = -1;
    this.stack = [];
  }
  // 当前指针指向前一个元素
  moveDown() {
    if (!this.stack.length) throw new Error("未设置初始快照");
    if (this.isOnBottom) return;
    this.currentIndex -= 1;
    return cloneDeep(this.stack[this.currentIndex]);
  }
  // 当前指针指向后一个元素
  moveUp() {
    if (!this.stack.length) throw new Error("未设置初始快照");
    if (this.isOnTop) return;
    this.currentIndex += 1;
    return cloneDeep(this.stack[this.currentIndex]);
  }
}
