import KeyMap from "@/utils/KeyMap";
import Mousetrap from "mousetrap";
export default {
  data() {
    return {
      saving: false
    };
  },
  methods: {
    keyBind() {
      Mousetrap.bind(KeyMap.play, this.play);
      Mousetrap.bind(KeyMap.save, () => {
        if (this.saving) return false;
        this.saving = true;
        const savingMsg = this.$message({
          iconClass: "el-icon-loading loading-message",
          duration: 0,
          message: "Saving",
          center: true
        });
        this.$bus.$emit(this.$keys.updateProject, isSuccess => {
          this.saving = false;
          savingMsg.close();
          this.$message({
            type: isSuccess ? "success" : "error",
            message: isSuccess ? "Save Success" : "Save Failed",
            center: true
          });
        });
        return false;
      });
      Mousetrap.bind(KeyMap.revoke, () => {
        this.$undoRedoHistory.undo();
        return false;
      });
      Mousetrap.bind(KeyMap.recovery, () => {
        this.$undoRedoHistory.redo();
        return false;
      });
    }
  },
  beforeDestroy() {
    Mousetrap.unbind(KeyMap.play);
    Mousetrap.unbind(KeyMap.save);
    Mousetrap.unbind(KeyMap.revoke);
    Mousetrap.unbind(KeyMap.recovery);
  }
};
