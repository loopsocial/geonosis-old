<template>
  <div class="canvas" ref="canvasContainer">
    <canvas :width="canvasSize.width" :height="canvasSize.height" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      canvasSize: {
        width: 0,
        height: 0
      }
    };
  },
  mounted() {
    this.calcCanvasSize();
    window.addEventListener("resize", this.calcCanvasSize);
  },
  methods: {
    calcCanvasSize() {
      this.canvasSize = {
        height: this.$refs.canvasContainer.offsetHeight,
        width: this.$refs.canvasContainer.offsetHeight * 0.5625
      };
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.calcCanvasSize);
  }
};
</script>

<style lang="scss" scoped>
.canvas {
  height: 100%;
  border-radius: 6px;
  border: 2px solid #fff;
}
</style>

<i18n>
{
  "en": {
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
