<template>
  <div class="preview" @drop.prevent="drop" @dragover.prevent>
    <div
      class="live-window-container"
      v-loading="waiting"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        ref="liveWindow"
        class="live-window"
        id="live-window"
        width="540"
        height="960"
      ></canvas>
      <div id="work-flow" @click="clickLiveWindow"></div>
    </div>
    <div class="controls flex" @click="play">
      <svg-icon
        :class="[!isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
        :icon-class="!isPlaying ? 'play' : 'pause'"
      ></svg-icon>
    </div>
  </div>
</template>

<script>
import initSDK from "@/utils/NvBase";
import TimelineClass from "@/utils/TimelineClass";
import { CLIP_TYPES } from "@/utils/Global";
import { vectorRotate } from "@/utils/common";
import { CaptionClip, StickerClip, AudioClip } from "@/utils/ProjectData";
import dragMixin from "@/mixins/dragMixin";
import WorkFlow from "@/utils/WorkFlow";
import { mapActions, mapState } from "vuex";
export default {
  mixins: [dragMixin],
  props: {},
  data() {
    return {
      width: 0,
      height: null,
      isPlaying: false,
      waiting: false,
      timelineClass: null,
      seekVal: 0,
      flow: null
    };
  },
  async mounted() {
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
    document.body.addEventListener("mouseup", this.statusEvent);
  },
  computed: {
    ...mapState({
      editBoxStatus: "editBoxStatus"
    })
  },
  methods: {
    statusEvent() {
      setTimeout(() => {
        this.setEditBoxstatus(false);
      });
    },
    // 点击livewindow, 是否显示操作转换框
    clickLiveWindow(e) {
      if (this.editBoxStatus) return; // 调整框
      if (this.flow && this.flow.isInRect({ x: e.offsetX, y: e.offsetY })) {
        // 点击的位置就是在编辑框内
        return;
      }
      const target = this.findClipAtNowPoint(e);
      if (target) {
        this.flow = new WorkFlow({
          containerId: "work-flow",
          clip: target,
          timelineClass: this.timelineClass
        });
      } else {
        if (this.flow) {
          this.flow.destroy();
          this.flow = null;
        }
      }
    },
    // 查找当前时刻点击位置是否有字幕/贴纸
    findClipAtNowPoint(e) {
      let { offsetX, offsetY } = e;
      const captions = this.captions.filter(
        ({ inPoint, duration }) =>
          this.seekVal >= inPoint && this.seekVal <= inPoint + duration
      );
      const stickers = this.stickers.filter(
        ({ inPoint, duration }) =>
          this.seekVal >= inPoint && this.seekVal <= inPoint + duration
      );
      if (captions.length || stickers.length) {
        return [...captions, ...stickers].find(item => {
          const point = WorkFlow.getCoordinateFromPoint(
            item,
            this.timelineClass.liveWindow
          );
          const { x, y, height, width } = point;
          if (item.rotation) {
            const p = { x: offsetX, y: offsetY };
            const origin = {
              x: x + width / 2,
              y: y + height / 2
            };
            let { x: newX, y: newY } = vectorRotate(
              p,
              (item.rotation / 180) * Math.PI,
              origin
            );
            offsetX = newX;
            offsetY = newY;
          }
          return (
            offsetX >= x &&
            offsetX <= x + width &&
            offsetY >= y &&
            offsetY <= y + height
          );
        });
      }
    },
    // eventBus事件绑定/解绑
    setEventBus() {
      this.$bus.$on(this.$keys.deleteClip, this.deleteClip);
      this.$bus.$on(this.$keys.editClip, this.editClip);
      this.$bus.$on(this.$keys.changeMonitor, this.changeMonitor); // 切换监视器
      this.$bus.$on(this.$keys.getTimeline, this.getTimeline); // 切换监视器
      this.$bus.$on(this.$keys.afreshVideoClip, this.afreshVideoClip); // 重新添加clip, 用于修改trim
      this.$bus.$on(this.$keys.addAudioClip, this.addAudioClip); // music页，添加audio
      this.$bus.$on(this.$keys.clearAudioTrack, this.clearAudioTrack); // music页，清空音频
      this.$bus.$on(this.$keys.delCaptionSticker, this.delCaptionSticker); // music页，清空音频
    },
    async delCaptionSticker(clip) {
      await this.timelineClass.stopEngin();
      let index = -1;
      if (clip.type === CLIP_TYPES.CAPTION) {
        this.timelineClass.timeline.removeCaption(clip.raw);
        index = this.captions.findIndex(i => i.uuid === clip.uuid);
      } else if (clip.type === CLIP_TYPES.STICKER) {
        this.timelineClass.timeline.removeAnimatedSticker(clip.raw);
        index = this.stickers.findIndex(i => i.uuid === clip.uuid);
      }
      this.timelineClass.seekTimeline();
      this.deleteClipToVuex({ type: clip.type, index });
    },
    drop(e) {
      const data = JSON.parse(e.dataTransfer.getData("Text"));
      this.editClip(e, data);
    },
    async clearAudioTrack() {
      await this.timelineClass.stopEngin();
      this.timelineClass.clearAudioTrack();
      this.timelineClass.seekTimeline(0);
    },
    async addAudioClip(clip) {
      let durationCumulate = 0;
      const clipOptions = { ...clip };
      const duration = clipOptions.trimOut - clipOptions.trimIn;
      const count = Math.ceil(
        this.timelineClass.timeline.getDuration() / duration
      );

      for (let index = 0; index < count; index++) {
        durationCumulate += duration;
        clipOptions.inPoint = index * duration;
        if (durationCumulate > this.timelineClass.timeline.getDuration()) {
          clipOptions.trimOut =
            duration -
            (durationCumulate - this.timelineClass.timeline.getDuration());
        }

        this.addClipToVuex({
          type: CLIP_TYPES.AUDIO,
          clip: new AudioClip(clipOptions)
        });
      }

      await this.timelineClass.stopEngin();
      this.timelineClass.buildAudioTrack();
      this.timelineClass.seekTimeline();
    },
    async editClip(e, option) {
      const { type, target, raw } = option;
      if (!raw && !target) return;
      await this.timelineClass.stopEngin();
      if (raw) {
        // 修改原有的clip
      } else {
        const container = document.getElementById("live-window");
        const { x, y } = container.getBoundingClientRect();
        let translationX;
        let translationY;
        if (e) {
          translationX = e.clientX - x;
          translationY = e.clientY - y;
        }
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
          console.log(caption);
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
      setNvsStatus: "setNvsStatus",
      setEditBoxstatus: "setEditBoxStatus"
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
    changeMonitor(canvasId) {
      canvasId = canvasId || "live-window";
      this.timelineClass.connectLiveWindow(canvasId);
      this.$nextTick(() => {
        this.timelineClass.seekTimeline(0);
      });
    },
    getTimeline(callback) {
      if (callback) {
        callback(this.timelineClass);
      }
    },
    async afreshVideoClip(clip) {
      await this.timelineClass.stopEngin();
      this.timelineClass.afreshVideoClip(clip);
      this.timelineClass.seekTimeline();
    },
    play() {
      if (this.isPlaying) {
        this.timelineClass.stop();
      } else {
        this.timelineClass.play();
      }
      this.isPlaying = !this.isPlaying;
      if (this.flow) {
        this.flow.destroy();
        this.flow = null;
      }
    },
    playingEvent(timeline, position) {
      if (timeline === this.timelineClass.timeline) {
        this.seekVal = position;
      }
    },
    stopEvent(timeline) {
      if (timeline === this.timelineClass.timeline) {
        this.isPlaying = false;
      }
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
    },
    getImgFromTimeline(t) {
      return new Promise((resolve, reject) => {
        this.timelineClass
          .getImgFromTimeline(t)
          .then(data => {
            const array = new Uint8Array(data);
            const str = String.fromCharCode(...array);
            resolve(`data:image/jpeg;base64,${window.btoa(str)}`);
          })
          .catch(reject);
      });
    }
  },
  beforeDestroy() {
    if (this.timelineClass) {
      this.timelineClass.stopEngin().then(() => {
        this.timelineClass.destroy();
      });
    }
    if (this.flow) {
      this.flow.destroy();
      this.flow = null;
    }
    this.setNvsStatus(false);
    document.body.removeEventListener("mouseup", this.statusEvent);
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
    this.$bus.$off(this.$keys.editClip, this.editClip);
    this.$bus.$off(this.$keys.changeMonitor, this.changeMonitor);
    this.$bus.$off(this.$keys.getTimeline, this.getTimeline);
    this.$bus.$off(this.$keys.afreshVideoClip, this.afreshVideoClip);
    this.$bus.$off(this.$keys.deleteClip, this.deleteClip);
    this.$bus.$off(this.$keys.addAudioClip, this.addAudioClip);
    this.$bus.$off(this.$keys.clearAudioTrack, this.clearAudioTrack);
    this.$bus.$off(this.$keys.delCaptionSticker, this.delCaptionSticker);
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin-left: 32px;
  max-width: 100%;
  height: 100%;
  aspect-ratio: 9/16;
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
    width: auto;
    aspect-ratio: 9/16;
    .live-window {
      border-radius: 6px;
      border: 2px solid white;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }
    #work-flow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
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
