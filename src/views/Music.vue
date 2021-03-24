<template>
  <div class="styles ln-templates">
    <div class="material">
      <el-tabs v-model="active" class="ln-tabs-body ln-template-tabs">
        <el-tab-pane :label="$t('styles')" name="styles">
          <MusicList />
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
export default {
  components: { Preview, MusicList },
  data() {
    return {
      active: "styles"
    };
  },
  async mounted() {
    // await this.$refs.preview.createTimeline();
  },
  methods: {
    handleNone() {
      if (this.audios.length === 0) {
        // 本来就没有音频 不用清空
        console.log("本就没有音频, 不用清空");
        return;
      }
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
    z-index: 999;
    cursor: pointer;
    &.disabled {
      color: rgba($color: $white, $alpha: 0.5);
      cursor: default;
    }
  }
  .material {
    display: flex;
    padding: 18px 0 0 26px;

    position: relative;
    flex: 1;
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
    "styles": "Trending Style",
    "none": "None"
  }
}
</i18n>
