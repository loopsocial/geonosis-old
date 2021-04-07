<template>
  <div class="volume-slider">
    <svg-icon
      class="sound"
      @click="handleMute"
      :icon-class="value === 0 ? 'sound-mute' : 'sound'"
    ></svg-icon>
    <el-slider
      @input="handleVolumeChange"
      :value="value"
      :max="2"
      :step="0.01"
      :show-tooltip="false"
    ></el-slider>
  </div>
</template>

<script>
export default {
  data() {
    return { lastVolume: 0 };
  },
  props: {
    value: {
      type: Number,
      default: 1
    },
    clip: Object
  },
  methods: {
    handleVolumeChange(value) {
      console.log(value)
      this.$emit("input", value);

      this.$emit("volume-change", value);
    },
    handleMute() {
      if (this.value !== 0) {
        this.lastVolume = this.value;
        this.$emit("input", 0);
      } else {
        this.$emit("input", this.lastVolume);
      }
      this.$emit("volume-change", this.value);
    }
  }
};
</script>

<style lang="scss" scoped>
.volume-slider {
  width: 200px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  .sound {
    width: 30px;
    height: 30px;
    cursor: pointer;
  }
  .el-slider {
    width: 100px;
    ::v-deep {
      .el-slider__runway {
        height: 2px;
        background-color: rgba(255, 255, 255, 0.3);
        .el-slider__bar {
          height: 2px;
          background-color: #fff;
        }
      }
      .el-slider__button {
        width: 12px;
        height: 12px;
        border: none;
      }
      .el-slider__button-wrapper {
        top: -17px;
      }
    }
  }
}
</style>
