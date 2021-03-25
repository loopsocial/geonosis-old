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
        console.log("保存", this.saving);
        if (this.saving) return false;
        this.saving = true;
        this.$bus.$emit(this.$keys.updateProject, () => {
          this.saving = false;
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
