import { FX_DESC, FX_TYPES, PARAMS_TYPES } from "@/utils/Global";
import { VideoFx, FxParam } from "@/utils/ProjectData";

export default {
  methods: {
    addVideoFx() {
      let fx = this.activeClip.videoFxs.find(
        fx => fx.desc === FX_DESC.TRANSFORM2D
      );
      if (!fx) {
        fx = new VideoFx(FX_DESC.TRANSFORM2D, FX_TYPES.BUILTIN);
      }
      fx.push(new FxParam(PARAMS_TYPES.STRING, "Anchor X", 10));
    }
  }
};
