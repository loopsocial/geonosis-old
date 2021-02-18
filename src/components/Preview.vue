<template>
  <div class="preview">
    <div
      class="live-window-container"
      v-loading="waiting"
      :style="{ width: width + 'px' }"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        ref="liveWindow"
        class="live-window"
        id="live-window"
        :width="width"
        :height="height"
        :style="{ width: width + 'px' }"
      ></canvas>
    </div>
    <div class="controls flex">
      <svg-icon
        :class="[!isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
        :icon-class="!isPlaying ? 'play' : 'pause'"
        @click="play"
      ></svg-icon>
    </div>
    <div class="preview-mask"></div>
  </div>
</template>

<script>
import initSDK from "../utils/NvBase";
import TimelineClass from "../utils/TimelineClass";
import { mapActions } from "vuex";
import { CLIP_TYPES } from "@/utils/Global";
import { CaptionClip, StickerClip } from "@/utils/ProjectData";
import dragMixin from "@/mixins/dragMixin";

export default {
  mixins: [dragMixin],
  props: {},
  data() {
    return {
      width: 0,
      height: null,
      isPlaying: false,
      waiting: false,
      timelineClass: null
    };
  },
  async mounted() {
    console.log("mounted");
    this.resize();
    window.addEventListener("resize", this.resize);
    try {
      await initSDK();
      this.setNvsStatus(true); // 设置状态. 表示SDK已加载完成
      console.log("SDK 初始化完成");
    } catch (error) {
      console.error("初始化失败", error);
      this.$message({
        type: "error",
        message: this.$t("loadModulesFailed")
      });
    }
  },
  methods: {
    setEventBus() {
      this.$bus.$on(this.$keys.deleteClip, this.deleteClip);
      this.$bus.$on(this.$keys.editClip, this.editClip);

      this.$once("hook:beforeDestroy", () => {
        this.$bus.$off(this.$keys.deleteClip, this.deleteClip);
        this.$bus.$off(this.$keys.editClip, this.editClip);
      });
    },
    async editClip(e, option) {
      const { type, target, raw } = option;
      if (!raw && !target) return;
      await this.timelineClass.stopEngin();
      if (raw) {
        // 修改原有的clip
      } else {
        const container = document.getElementById("live-window");
        const { x, y, width, height } = container.getBoundingClientRect();
        const translationX = e.clientX - x - width / 2;
        const translationY = y + height / 2 - e.clientY;
        let result;
        if (type === CLIP_TYPES.STICKER) {
          const sticker = new StickerClip({
            ...target,
            inPoint: this.timelineClass.getCurrentPosition(),
            desc: target.id,
            translationX,
            translationY
          });
          result = this.timelineClass.addSticker(sticker);
        } else if (type === CLIP_TYPES.CAPTION) {
          const caption = new CaptionClip({
            ...target,
            inPoint: this.timelineClass.getCurrentPosition(),
            translationX,
            translationY
          });
          result = this.timelineClass.addCaption(caption);
        }
        if (result) {
          this.draggingClip = null;
        }
      }
      this.timelineClass.seekTimeline();
    },
    async deleteClip(type, index) {
      const { VIDEO, AUDIO } = CLIP_TYPES;
      await this.timelineClass.stopEngin();
      if ([VIDEO, AUDIO].includes(type)) {
        this.timelineClass.deleteClipByIndex(type, index);
      }
      this.timelineClass.seekTimeline();
    },
    ...mapActions({
      setNvsStatus: "setNvsStatus"
    }),
    async createTimeline() {
      this.timelineClass = new TimelineClass("live-window", {
        videoTrack: { clips: this.videos },
        audioTrack: { clips: this.audios },
        captions: this.captions,
        stickers: this.stickers
      });
      window.timelineClass = this.timelineClass; // 调试用
      await this.timelineClass.buildTimeline();
      this.setContextEvent(); // 绑定SDK相关事件
      this.setEventBus(); // 绑定eventBus相关事件
      this.timelineClass.seekTimeline();
      console.log("时间线创建完成", this.timelineClass);
    },
    resize() {
      const liveWindow = this.$refs.liveWindow;
      this.height = liveWindow.offsetHeight;
      this.width = parseInt((this.height / 16) * 9);
    },
    play() {
      if (this.isPlaying) {
        this.timelineClass.stop();
      } else {
        this.timelineClass.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    playingEvent(timeline, position) {
      // console.log("播放中", position);
    },
    stopEvent(timeline) {
      this.isPlaying = false;
    },
    statusChangeEvent(isVideo, waiting) {
      this.waiting = waiting;
    },
    // 设置context回调事件
    setContextEvent() {
      window.streamingContext.addEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.addEventListener(
        "onPlaybackTimelinePosition",
        this.playingEvent
      );
      window.streamingContext.addEventListener(
        "onWebRequestWaitStatusChange",
        this.statusChangeEvent
      );
      this.$once("hook:beforeDestroy", () => {
        window.streamingContext.removeEventListener(
          "onPlaybackStopped",
          this.stopEvent
        );
        window.streamingContext.removeEventListener(
          "onPlaybackTimelinePosition",
          this.playingEvent
        );
        window.streamingContext.removeEventListener(
          "onWebRequestWaitStatusChange",
          this.statusChangeEvent
        );
      });
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
    if (this.timelineClass) {
      this.timelineClass.stopEngin().then(() => {
        this.timelineClass.destroy();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin-left: 32px;
  max-width: 100%;
  height: 100%;
  position: relative;
  &:hover {
    .controls {
      visibility: inherit;
      opacity: 1;
    }
  }
  .live-window-container {
    height: 100%;
    position: relative;
    border-radius: 6px;
    border: 2px solid white;
    .live-window {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
    }
  }
  .controls {
    bottom: 10px;
    left: 10px;
    position: absolute;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 2010;
    width: 38px;
    height: 38px;
    cursor: pointer;
    visibility: hidden;
    opacity: 0;
    transition: all 0.2s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
    .icon-pause {
      width: 24px;
      height: 24px;
    }
  }
  .preview-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 999;
  }
}
</style>

<i18n>
{
  "en": {
    "loadModulesFailed": "Loading Failed"
  }
}
</i18n>
