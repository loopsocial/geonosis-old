<template>
  <div :class="['media-item', media.selected ? 'selected' : '']">
    <svg-icon
      icon-class="checked"
      class="icon-checked"
      v-if="media.selected"
    ></svg-icon>
    <span class="duration">{{
      (media.type === "video" ? media.duration / 1000 : 3000) | msFormat
    }}</span>
    <div class="play flex" v-if="media.type === 'video'" @click.stop="play">
      <svg-icon
        :class="playingId !== media.id ? 'icon-play' : 'icon-pause'"
        :icon-class="playingId !== media.id ? 'play' : 'pause'"
      ></svg-icon>
    </div>
    <el-image
      class="media-cover"
      ref="image"
      :src="media.coverUrl"
      fit="cover"
      v-if="playingId !== media.id"
    ></el-image>
    <video :src="videoUrl" class="preview-video" autoplay v-else></video>
  </div>
</template>

<script>
export default {
  props: {
    media: Object,
    playingId: [String, Number]
  },
  data() {
    return {
      videoUrl: ""
    };
  },
  watch: {
    playingId(id) {
      if (id === this.media.id) {
        this.videoUrl =
          this.media.videoUrl ||
          "https://alieasset.meishesdk.com/video/d91663cf-da3f-49e9-a7cd-64aa202d0660/d91663cf-da3f-49e9-a7cd-64aa202d0660.mp4";
      }
    }
  },
  mounted() {},
  methods: {
    play() {
      this.$emit(
        "play",
        this.media.id !== this.playingId ? this.media.id : null
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.media-item {
  position: relative;
  &.selected {
    .media-cover,
    .preview-video {
      border-color: white;
    }
  }
  .icon-checked {
    position: absolute;
    z-index: 10;
    width: 24px;
    height: 24px;
    top: 8px;
    left: 8px;
  }
  .duration {
    position: absolute;
    top: 8px;
    right: 8px;
    border-radius: 4px;
    font-size: 14px;
    padding: 4px 8px;
  }
  .play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.2);
    z-index: 10;
    width: 38px;
    height: 38px;
    cursor: pointer;
    visibility: hidden;
    opacity: 0;
    transition: all 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  &:hover {
    .play {
      opacity: 1;
      visibility: inherit;
    }
  }
  .media-cover,
  .preview-video {
    filter: drop-shadow(0 0 10 rgba(0, 0, 0, 0.3));
    height: auto;
    width: 100%;
    transition: all 0.3s;
    aspect-ratio: 9/16;
    border: 4px solid transparent;
    border-radius: 6px;
    box-sizing: border-box;
  }
}
</style>
