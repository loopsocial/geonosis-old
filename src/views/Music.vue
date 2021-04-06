<template>
  <div class="styles ln-templates">
    <div class="material">
      <el-tabs v-model="active" class="ln-tabs-body ln-template-tabs">
        <el-tab-pane :label="$t('styles')" name="styles">
          <div class="search-bar">
            <svg-icon class="search-icon" icon-class="search"></svg-icon>
            <el-input
              v-model="searchKeywords"
              @keypress.enter.native="handleSearch"
              placeholder="Search"
            >
            </el-input>
          </div>

          <hr />
          <div class="using-music" v-if="usingMusic.isShow">
            <span class="name">{{ usingMusic.name }}</span>
            <span class="artist">{{ usingMusic.artist }}</span>
            <svg-icon
              class="close"
              icon-class="close"
              @click="handleNone"
            ></svg-icon>
          </div>
          <VolumeSlider
            v-model="usingMusic.volume"
            @volumeChange="handleVolumeChange"
            v-if="usingMusic.isShow"
          />
          <MusicList
            ref="musicList"
            @useMusic="handleUse"
            @clearAudio="handleNone"
          />
        </el-tab-pane>
        <el-tab-pane name="likes">
          <svg-icon
            slot="label"
            :icon-class="active === 'likes' ? 'heart-red' : 'heart'"
          ></svg-icon>
        </el-tab-pane>
      </el-tabs>
      <div
        :class="['none', this.audios.length ? '' : 'disabled']"
        @click="handleNone"
      >
        <svg-icon
          slot="label"
          :icon-class="this.audios.length ? 'none' : 'none-disabled'"
        ></svg-icon>
        {{ $t("none") }}
      </div>
    </div>
    <Preview ref="preview" />
  </div>
</template>

<script>
import Preview from "../components/Preview";
import MusicList from "../components/music/MusicList";
import { CLIP_TYPES } from "../utils/Global";
import VolumeSlider from "@/components/VolumeSlider.vue";

export default {
  components: { Preview, MusicList, VolumeSlider },
  data() {
    return {
      active: "styles",
      searchKeywords: "",
      lastVolume: 0,
      usingMusic: {
        name: "",
        artist: "",
        volume: 1,
        isShow: false
      }
    };
  },
  async mounted() {
    // await this.$refs.preview.createTimeline();
  },
  computed: {},
  methods: {
    handleVolumeChange(e) {
      const clip = this.audios[0];
      clip.volume = e;
      if (!clip.raw) return null;
      clip.raw.setVolumeGain(e, e);
    },
    handleUse(music) {
      music.volume = parseFloat(music.volume);
      this.usingMusic = music;
    },
    async handleSearch() {
      this.searchKeywords = this.searchKeywords.trim();
      this.$refs.musicList.getMusic({ q: this.searchKeywords });
    },
    handleNone() {
      if (this.audios.length === 0) {
        // 本来就没有音频 不用清空
        console.log("本就没有音频, 不用清空");
        return;
      }
      this.usingMusic.isShow = false;
      this.$bus.$emit(this.$keys.clearAudioTrack);
      this.resetClips({ type: CLIP_TYPES.AUDIO, clips: [] });
    }
  }
};
</script>

<style lang="scss" scoped>
.ln-templates {
  position: relative;
  display: flex;
  width: 92%;
  .none {
    position: absolute;
    top: 30px;
    right: 0;
    color: $white;
    border-radius: 20px;
    padding: 8px 16px;
    z-index: 10;
    transition: all 0.3s;
    cursor: pointer;
    &.disabled {
      color: rgba($color: $white, $alpha: 0.5);
      cursor: default;
    }
    &:not(.disabled) {
      &:hover {
        background-color: rgba($color: $white, $alpha: 0.1);
      }
    }
  }
  .material {
    display: flex;
    padding: 18px 0 0 26px;

    position: relative;
    flex: 1;

    hr {
      clear: both;
      border-bottom: 1px;
    }
    .search-bar {
      margin-bottom: 8px;
      float: left;
      display: flex;
      width: 40%;
      height: 36px;
      background-color: #4a4a4a;
      border-radius: 18px;
      .search-icon {
        margin: 0 10px;
        height: 36px;
        width: 20px;
      }
      .el-input {
        ::v-deep .el-input__inner {
          height: 36px;
          padding-left: 0;
          background-color: transparent;
          border: none;
          color: #fff;
        }
      }
    }

    .using-music {
      float: left;
      width: 40%;
      line-height: 36px;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .name {
        font-weight: 600;
        font-size: 16px;
      }
      .artist {
        font-size: 14px;
        color: #9b9b98;
      }
      .close {
        cursor: pointer;
      }
    }
    .volume-slider {
      float: right;
    }
    .music-list {
      clear: both;
    }
  }
  .preview {
    margin: 20px 9% 20px 7%;
    height: auto;
  }
  ::v-deep {
    .el-tab-pane {
      height: 100%;
    }
    .el-tabs__nav {
      width: 100%;
    }
    .el-tabs__item {
      font-size: 16px;
      color: $white;
    }
    .el-tabs__content {
      height: calc(100% - 75px);
    }
  }
}
</style>
<i18n>
{
  "en": {
    "styles": "Music Library",
    "none": "None"
  }
}
</i18n>
