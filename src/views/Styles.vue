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
    <canvas id="p-window"></canvas>
  </div>
</template>

<script>
import TimelineClass from "@/utils/TimelineClass";
import Preview from "../components/Preview";
import StyleList from "../components/styles/StyleList";
import { sleep } from "@/utils/common";
const cloneDeep = require("clone-deep");

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
    // await this.$nextTick();
  },
  methods: {
    clearModule() {
      this.$bus.$emit(this.$keys.destroyWorkFlow);
      if (this.videoModule) {
        this.setVideoModule();
        this.$bus.$emit(this.$keys.rebuildTimeline);
      }
    },
    async onLoaded() {
      this.createTimeline();
    },
    onError() {
      console.log("图片获取失败，直接从canvas拿");
      this.$bus.$emit(this.$keys.seek);
      setTimeout(() => {
        const liveWindow = document.getElementById("p-window");
        this.coverData = liveWindow.toDataURL();
      }, 1000);
    },
    async createTimeline() {
      if (this.$route.name !== "Styles") return;
      await this.$nextTick();
      this.t = new TimelineClass("p-window", { notInit: true });
      await this.t.init();
      const v = cloneDeep(this.videos);
      const captions = cloneDeep(this.captions);
      const stickers = cloneDeep(this.stickers);
      this.t.buildVideoTrack(v);
      captions.map(c => {
        if (c.deleted || c.isModule) return;
        this.t.addCaption({ ...c });
      });
      stickers.map(s => {
        if (s.deleted || s.isModule) return;
        this.t.addSticker({ ...s });
      });
      this.t.seekTimeline();
      await this.t.stopEngin();
      this.$bus.$once(this.$keys.onImageGrabbedArrived, data => {
        const array = new Uint8Array(data);
        var blob = new Blob([array], { type: "image/png" });
        const res = window.URL.createObjectURL(blob);
        const image = new Image();
        image.onload = () => {
          this.coverData = res;
          sleep(100)
            .then(() => {
              return this.t.stopEngin();
            })
            .then(() => {
              this.t.destroy();
            });
        };
        image.onerror = () => {
          this.onError();
          sleep(100)
            .then(() => {
              return this.t.stopEngin();
            })
            .then(() => {
              this.t.destroy();
            });
        };
        image.src = res;
        this.$bus.$emit(this.$keys.seek);
      });
      nvsGetStreamingContextInstance().grabImageFromTimeline(
        this.t.timeline,
        0,
        new NvsRational(1, 1),
        0
      );
    }
  },
  beforeDestroy() {}
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
#p-window {
  position: absolute;
  z-index: -100;
  background: black;
  opacity: 0;
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
