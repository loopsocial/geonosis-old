import KeyMap from "@/utils/KeyMap";
import Mousetrap from "mousetrap";

export default {
  methods: {
    keyBind() {
      Mousetrap.bind(KeyMap.play, this.play);
      Mousetrap.bind(KeyMap.save, () => {
        this.$message({
          type: "success",
          message: "保存成功"
        });
        return false;
      });
      Mousetrap.bind(KeyMap.revoke, () => {
        this.$undoRedoHistory.undo();
      });
      Mousetrap.bind(KeyMap.recovery, () => {
        this.$undoRedoHistory.redo();
      });
    }
  },
  beforeDestroy() {
    Mousetrap.unbind(KeyMap.play);
    Mousetrap.unbind(KeyMap.save);
  }
};
