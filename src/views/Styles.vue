<template>
  <div class="styles ln-templates">
    <div class="material">
      <el-tabs v-model="active" class="ln-tabs-body ln-template-tabs">
        <el-tab-pane :label="$t('styles')" name="styles">
          <StyleList :cover-data="coverData" />
        </el-tab-pane>
        <el-tab-pane name="likes">
          <svg-icon
            slot="label"
            :icon-class="active === 'likes' ? 'heart-red' : 'heart'"
          ></svg-icon>
        </el-tab-pane>
      </el-tabs>
      <div :class="{ none: true, disabled: !videoModule }" @click="clearModule">
        <svg-icon
          slot="label"
          :icon-class="videoModule ? 'none' : 'none-disabled'"
        ></svg-icon>
        {{ $t("none") }}
      </div>
    </div>
    <Preview ref="preview" @on-loaded="onLoaded" />
  </div>
</template>

<script>
import Preview from "../components/Preview";
import StyleList from "../components/styles/StyleList";
export default {
  components: { Preview, StyleList },
  data() {
    return {
      active: "styles",
      coverData: ""
    };
  },
  async mounted() {
    // await this.$refs.preview.createTimeline();
    await this.$nextTick();
  },
  methods: {
    clearModule() {
      if (this.videoModule) {
        this.setVideoModule();
        this.$bus.$emit(this.$keys.rebuildTimeline);
      }
    },
    async onLoaded() {
      // 工程加载完成后，再获取封面
      this.coverData = await this.$refs.preview.getImgFromTimeline();
      console.log("获取封面", this.coverData);
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
  }
  .preview {
    margin: 20px 9% 20px 7%;
    height: auto;
    ::v-deep .live-window-container {
      border-radius: 6px;
      overflow: hidden;
    }
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
      color: #fff;
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
