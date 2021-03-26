<template>
  <div :class="['media-item', media.selected ? 'selected' : '']">
    <svg-icon
      icon-class="checked"
      class="icon-checked"
      v-if="media.selected"
    ></svg-icon>
    <span class="duration">{{
      (isMediaTypeVideo ? media.duration : 3000) | msFormat
    }}</span>
    <div class="play flex" v-if="isMediaTypeVideo" @click.stop="play">
      <svg-icon
        :class="playingId !== media.id ? 'icon-play' : 'icon-pause'"
        :icon-class="playingId !== media.id ? 'play' : 'pause'"
      ></svg-icon>
    </div>
    <div class="delete-asset-wrapper">
      <div class="delete-asset flex" @click.stop="deleteAsset">
        <i class="el-icon-delete"></i>
      </div>
    </div>
    <el-image
      class="media-cover"
      ref="image"
      :src="getThumbnailUrl"
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
      videoUrl: "",
      isMediaTypeVideo: this.media.media_type === "video"
    };
  },
  watch: {
    playingId(id) {
      if (id !== this.media.id) return;
      // TODO: fallbackURL To be deleted
      const fallbackURL =
        "https://alieasset.meishesdk.com/video/d91663cf-da3f-49e9-a7cd-64aa202d0660/d91663cf-da3f-49e9-a7cd-64aa202d0660.mp4";
      const mediaURL =
        this.media.low_resolution_video_url || this.media.video_url;
      this.videoUrl = mediaURL || fallbackURL;
    }
  },
  mounted() {},
  computed: {
    getThumbnailUrl() {
      return this.media.thumbnail_url || this.media.coverUrl;
    }
  },
  methods: {
    play() {
      this.$emit(
        "play",
        this.media.id !== this.playingId ? this.media.id : null
      );
    },
    deleteAsset() {
      this.$emit("delete-asset", this.media);
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
  .delete-asset-wrapper {
    position: absolute;
    z-index: 1;
    bottom: 8px;
    right: 0px;
    border-radius: 4px;
    font-size: 14px;
    padding: 4px 8px;
    width: 40%;
    height: 30%;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    opacity: 0;
    .delete-asset {
      width: 24px;
      height: 24px;
      border-radius: 12px;
      color: white;
      background-color: rgba(0, 0, 0, 0.2);
    }
    &:hover {
      opacity: 1;
      .delete-asset:hover {
        background: rgba(0, 0, 0, 0.5);
      }
    }
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
