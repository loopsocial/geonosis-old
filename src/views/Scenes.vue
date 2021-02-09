<template>
  <div class="scenes">
    <DraftList :medias="medias"></DraftList>
    <Preview :medias="medias" ref="preview"></Preview>
    <Materials></Materials>
  </div>
</template>

<script>
import DraftList from "../components/scenes/DraftList";
import Materials from "../components/scenes/Materials";
import Preview from "../components/Preview";
import resource from "../mock/resource.json";
import { installAsset } from "../utils/AssetsUtils";

export default {
  components: {
    DraftList,
    Materials,
    Preview
  },
  data() {
    return {
      medias: resource.resourceList // 已选择的素材
    };
  },
  async mounted() {
    console.log("m3u8 开始安装");
    await this.installM3u8();
    console.log("m3u8 安装完成");
    this.$refs.preview.createTimeline();
  },
  methods: {
    async installM3u8() {
      let pos = 0;
      for (let i = 0; i < this.medias.length; i++) {
        const clip = this.medias[i];
        clip.m3u8Path = await installAsset(clip.m3u8Url);
        // todo 以下是测试代码
        clip.inPoint = pos;
        clip.trimIn = 0;
        clip.trimOut = clip.duration * 1000;
        clip.orgDuration = clip.duration * 1000;
        pos += clip.duration * 1000;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.scenes {
  width: 92%;
  display: flex;
  flex: 1;
  padding: 12px 0 24px 22px;
  .project-icon {
    width: 195px;
    height: 176px;
  }
  .draft-list {
    height: 100%;
  }
  .canvas {
    margin-left: 32px;
  }
  .materials {
    flex: 1;
    margin-left: 54.25px;
  }
}
</style>

<i18n>
{
  "en": {
    "pick": "Pick Media"
  }
}
</i18n>
