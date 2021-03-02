import { clone } from "@/utils/common";
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
  pushSnapshot(splitListSnapshot) {
    const snapshot = clone(splitListSnapshot);
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(snapshot);
    this.currentIndex += 1;
  }
  // 清空快照
  clearStack() {
    this.currentIndex = -1;
    this.stack = [];
  }
  // 当前指针指向前一个元素
  moveDown() {
    if (this.isOnBottom) return;
    this.currentIndex -= 1;
    return clone(this.stack[this.currentIndex]);
  }
  // 当前指针指向后一个元素
  moveUp() {
    if (this.isOnTop) return;
    this.currentIndex += 1;
    return clone(this.stack[this.currentIndex]);
  }
}
