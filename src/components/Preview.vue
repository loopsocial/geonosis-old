<template>
  <div class="preview">
    <canvas
      ref="liveWindow"
      class="live-window"
      id="live-window"
      :width="width"
      :style="{ width: width + 'px' }"
    ></canvas>
  </div>
</template>

<script>
import initSDK from "../utils/NvBase";
import TimelineClass from "../utils/TimelineClass";
export default {
  data() {
    return {
      width: 0,
      streamingContext: null
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
        this.streamingContext = nvsGetStreamingContextInstance();
        this.createTimeline();
      })
      .catch(e => {
        console.error("初始化失败", e);
      });
    this.resize();
    window.addEventListener("resize", this.resize);
  },
  methods: {
    createTimeline() {
      this.timelineClass = new TimelineClass(
        this.streamingContext,
        "live-window",
        {
          videoTrack: { clips: this.videoClips }
        }
      );
    },
    resize() {
      const liveWindow = this.$refs.liveWindow;
      const height = liveWindow.offsetHeight;
      this.width = Math.ceil((height / 16) * 9);
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
