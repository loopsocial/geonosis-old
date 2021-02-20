<template>
  <div class="preview-box">
    <svg-icon
      class="preview-close"
      icon-class="close"
      @click="$emit('close')"
    ></svg-icon>
    <div class="preview-window">
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
          v-for="(item, index) in videos"
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
      timelineClass: null,
      isPlaying: false
    };
  },
  computed: {
    duration() {
      return this.videos.reduce((res, item) => {
        res += item.duration;
        return res;
      }, 0);
    },
    seekBarStyle() {
      return {
        left: (this.seekVal / this.duration) * 100 + "%"
      };
    },
    activeIndex() {
      return this.videos.findIndex(
        ({ inPoint, duration }) =>
          inPoint <= this.seekVal && this.seekVal < inPoint + duration
      );
    }
  },
  mounted() {
    this.$bus.$emit(this.$keys.changeMonitor, "preview-window"); // 切换监视器
    this.$bus.$emit(this.$keys.getTimeline, timelineClass => {
      this.timelineClass = timelineClass;
      this.bindContextEvent();
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
      }
    },
    bindContextEvent() {
      window.streamingContext.addEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.addEventListener(
        "onPlaybackTimelinePosition",
        this.playingEvent
      );
    },
    unbindContextEvent() {
      window.streamingContext.removeEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.removeEventListener(
        "onPlaybackTimelinePosition",
        this.playingEvent
      );
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
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 3000;
  background-color: rgba($color: #000000, $alpha: 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 40px 0;
  box-sizing: border-box;
  .preview-close {
    position: absolute;
    right: 22px;
    top: 22px;
    width: 44px;
    height: 44px;
    cursor: pointer;
  }
  .preview-window {
    canvas {
      height: 90vh;
      width: 90vh / 16 * 9;
      background-color: rosybrown;
      border-radius: 6px;
    }
  }
  .footer {
    width: 90vh / 16 * 9;
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
