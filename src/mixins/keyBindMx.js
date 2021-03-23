import KeyMap from "@/utils/KeyMap";
import { writeXml } from "@/utils/XmlUtils";
import Mousetrap from "mousetrap";
import { uploadToMS } from "@/utils/Uploader";
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
        if (this.saving) return;
        try {
          this.saving = true;
          writeXml("project.xml");
          const file = FS.readFile("project.xml", { encoding: "utf8" });
          console.log(file);
          uploadToMS(file)
            .then(url => {
              localStorage.projectUrl = url;
              this.$message({
                type: "success",
                message: "保存成功"
              });
            })
            .finally(() => {
              this.saving = false;
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
