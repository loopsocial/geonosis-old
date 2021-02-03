<template>
  <div class="preview">
    <canvas
      ref="liveWindow"
      class="live-window"
      id="live-window"
      :width="width"
      :style="{ width: width + 'px' }"
    ></canvas>
    <svg-icon
      :class="[isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
      :icon-class="isPlaying ? 'play' : 'pause'"
      @click="play"
    ></svg-icon>
  </div>
</template>

<script>
import initSDK from "../utils/NvBase";
import TimelineClass from "../utils/TimelineClass";
import resource from "../mock/resource.json";

export default {
  data() {
    return {
      width: 0,
      isPlaying: false
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
    mockClips() {
      const clips = JSON.parse(resource);
      let inPoint = 0;
      this.videoClips = clips.map(item => {
        const clip = {
          inPoint,
          m3u8Url: item.m3u8Url,
          url: item.url,
          trimIn: 0,
          trimOut: item.duration,
          orgDuration: item.duration
        };
        inPoint += item.duration;
        return clip;
      });
    },
    createTimeline() {
      this.timelineClass = new TimelineClass("live-window", {
        videoTrack: { clips: this.mockClips() }
      });
      console.log(this.timelineClass);
      this.timelineClass.buildTimeline();
    },
    resize() {
      const liveWindow = this.$refs.liveWindow;
      const height = liveWindow.offsetHeight;
      this.width = Math.ceil((height / 16) * 9);
    },
    play() {
      if (this.isPlaying) {
        this.timelineClass.play();
      } else {
        this.timelineClass.stop();
      }
      this.isPlaying = !this.isPlaying();
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.resize);
  }
};
</script>

<style lang="scss" scoped>
.preview {
  flex: 1;
  max-width: 100%;
  padding: 16px 0;
  .live-window {
    height: 100%;
    background-color: whitesmoke;
  }
}
</style>
