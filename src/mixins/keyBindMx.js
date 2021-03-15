import KeyMap from "@/utils/KeyMap";
import { writeXml } from "@/utils/XmlUtils";
import Mousetrap from "mousetrap";
export default {
  methods: {
    keyBind() {
      Mousetrap.bind(KeyMap.play, this.play);
      Mousetrap.bind(KeyMap.save, () => {
        try {
          writeXml("project.xml");
          console.log(FS.readFile("project.xml", { encoding: "utf8" }));
          this.$message({
            type: "success",
            message: "保存成功"
          });
        } catch (error) {
          console.error("保存失败", error);
          this.$message({
            type: "error",
            message: "保存失败"
          });
        }
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
