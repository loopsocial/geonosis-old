<template>
  <div class="preview-box">
    <div
      class="preview-window"
      v-loading="waiting"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        class="preview-window"
        width="540"
        height="960"
        id="preview-window"
      ></canvas>
    </div>
    <div class="footer flex">
      <svg-icon
        :class="[!isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
        :icon-class="!isPlaying ? 'play' : 'pause'"
        @click="play"
      ></svg-icon>
      <div class="play-track" ref="track" @click="mousemove">
        <span
          class="play-dot"
          @mousedown.stop="mousedown"
          :style="seekBarStyle"
        ></span>
        <div
          :class="['play-item', index === activeIndex ? 'active' : '']"
          v-for="(item, index) in clipList"
          :key="item.uuid"
          :style="getStyle(item)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      seekVal: 0,
      waiting: false,
      timelineClass: null,
      isPlaying: false
    };
  },
  props: {
    autoPlay: Boolean
  },
  computed: {
    duration() {
      return this.videos.reduce((res, item) => {
        res += item.splitList.reduce((sum, clip) => {
          sum += clip.captureOut - clip.captureIn;
          return sum;
        }, 0);
        return res;
      }, 0);
    },
    seekBarStyle() {
      return {
        left: (this.seekVal / this.duration) * 100 + "%"
      };
    },
    activeIndex() {
      return this.clipList.findIndex(
        ({ inPoint, duration }) =>
          inPoint <= this.seekVal && this.seekVal < inPoint + duration
      );
    },
    clipList() {
      return this.videos.reduce((res, item) => {
        let inPoint = item.inPoint;
        const clips = item.splitList.map((clip, index) => {
          const c = {
            duration: clip.captureOut - clip.captureIn,
            inPoint: inPoint,
            uuid: item.uuid + `_${index}`
          };
          inPoint += clip.captureOut - clip.captureIn;
          return c;
        });
        res.push(...clips);
        return res;
      }, []);
    }
  },
  mounted() {
    this.$bus.$emit(this.$keys.changeMonitor, "preview-window"); // 切换监视器
    this.$bus.$emit(this.$keys.getTimeline, timelineClass => {
      this.timelineClass = timelineClass;
      this.bindContextEvent();
      if (this.autoPlay) {
        this.$nextTick(() => {
          this.play();
        });
      }
    });
  },
  methods: {
    preview() {
      this.showPreview = true;
    },
    getStyle(item) {
      const width = (item.duration / this.duration) * 100;
      return {
        width: width + "%"
      };
    },
    mousedown() {
      document.body.addEventListener("mousemove", this.mousemove);
      document.body.addEventListener("mouseup", this.mouseup);
    },
    mousemove(e) {
      const trackDom = this.$refs.track;
      const { left, width } = trackDom.getBoundingClientRect();
      const val = Math.round(((e.clientX - left) / width) * this.duration);
      this.seekVal = Math.min(Math.max(0, val), this.duration - 1);
      this.timelineClass.seekTimeline(this.seekVal);
    },
    mouseup() {
      document.body.removeEventListener("mousemove", this.mousemove);
      document.body.removeEventListener("mouseup", this.mouseup);
    },
    play() {
      if (this.isPlaying) {
        this.timelineClass.stop();
      } else {
        this.timelineClass.play();
      }
      this.isPlaying = !this.isPlaying;
    },
    stopEvent(timeline) {
      if (timeline === this.timelineClass.timeline) {
        this.isPlaying = false;
      }
    },
    playingEvent(timeline, pos) {
      if (timeline === this.timelineClass.timeline) {
        this.seekVal = pos;
        this.isPlaying = true;
      }
    },
    bindContextEvent() {
      this.$bus.$on(
        this.$keys.onWebRequestWaitStatusChange,
        this.statusChangeEvent
      );
      this.$bus.$on(this.$keys.onPlaybackTimelinePosition, this.playingEvent);
      this.$bus.$on(this.$keys.onPlaybackStopped, this.stopEvent);
    },
    unbindContextEvent() {
      this.$bus.$off(
        this.$keys.onWebRequestWaitStatusChange,
        this.statusChangeEvent
      );
      this.$bus.$off(this.$keys.onPlaybackTimelinePosition, this.playingEvent);
      this.$bus.$off(this.$keys.onPlaybackStopped, this.stopEvent);
    },
    statusChangeEvent(isVideo, waiting) {
      this.waiting = waiting;
    }
  },
  beforeDestroy() {
    this.unbindContextEvent();
    this.$bus.$emit(this.$keys.changeMonitor); // 切换监视器
  }
};
</script>

<style lang="scss">
.preview-box {
  height: 100%;
  .preview-window {
    height: calc(100% - 40px);
    canvas {
      height: 100%;
      width: auto;
      aspect-ratio: 9/16;
      background-color: rosybrown;
      border-radius: 6px;
    }
  }
  .footer {
    margin-top: 16px;
    padding-right: 8px;
    .play-track {
      flex: 1;
      position: relative;
      margin-left: 12px;
      display: flex;
      .play-item {
        border-radius: 2px;
        background-color: #fff;
        opacity: 0.4;
        height: 4px;
        transition: opacity 0.3s;
        cursor: pointer;
        &.active {
          opacity: 1;
        }
      }
      .play-item + .play-item {
        margin-left: 2px;
      }
    }
    .play-dot {
      border-radius: 50%;
      background-color: #fff;
      width: 12px;
      height: 12px;
      position: absolute;
      top: 50%;
      z-index: 10;
      transform: translate(-50%, -50%);
    }
  }
}
</style>

<i18n>
{
  "en": {
  }
}
</i18n>
