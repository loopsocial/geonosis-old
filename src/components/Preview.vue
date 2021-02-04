<template>
  <div class="preview">
    <div
      class="live-window-container"
      v-loading="waiting"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        ref="liveWindow"
        class="live-window"
        id="live-window"
        :width="width"
        :height="height"
        :style="{ width: width + 'px', height: height + 'px' }"
      ></canvas>
    </div>
    <div class="controls flex">
      <svg-icon
        :class="[!isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
        :icon-class="!isPlaying ? 'play' : 'pause'"
        @click="play"
      ></svg-icon>
    </div>
  </div>
</template>

<script>
import initSDK from "../utils/NvBase";
import TimelineClass from "../utils/TimelineClass";
import resource from "../mock/resource.json";
import { installAsset } from "../utils/AssetsUtils";
export default {
  data() {
    return {
      width: 0,
      height: null,
      isPlaying: false,
      waiting: false
    };
  },
  props: {
    videoClips: Array
  },
  mounted() {
    console.log("mounted");
    initSDK()
      .then(() => {
        console.log("初始化完成");
        this.createTimeline();
      })
      .catch(e => {
        console.error("初始化失败", e);
      });
    this.resize();
    window.addEventListener("resize", this.resize);
  },
  methods: {
    // 测试数据
    async mockClips() {
      const clips = resource.resourceList;
      let inPoint = 0;
      const res = [];
      for (let i = 0; i < clips.length; i++) {
        const clip = clips[i];
        const m3u8Path = await installAsset(clip.m3u8Url);
        res.push({
          inPoint,
          m3u8Url: clip.m3u8Url,
          url: clip.url,
          trimIn: 0,
          trimOut: clip.duration * 1000,
          orgDuration: clip.duration * 1000,
          m3u8Path
        });
        inPoint += clip.duration * 1000;
      }
      console.log(res);
      return res;
    },
    async createTimeline() {
      const clips = await this.mockClips();
      this.timelineClass = new TimelineClass("live-window", {
        videoTrack: { clips }
      });
      window.timelineClass = this.timelineClass; // 调试用
      await this.timelineClass.buildTimeline();
      this.setContextEvent();
    },
    resize() {
      const liveWindow = this.$refs.liveWindow;
      this.height = liveWindow.offsetHeight;
      this.width = Math.ceil((this.height / 16) * 9);
    },
    play() {
      console.log(this.isPlaying);
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
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin-left: 32px;
  max-width: 100%;
  position: relative;
  &:hover {
    .controls {
      visibility: inherit;
      opacity: 1;
    }
  }
  .live-window-container {
    height: 100%;
    .live-window {
      height: 100%;
      background-color: whitesmoke;
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
}
</style>
