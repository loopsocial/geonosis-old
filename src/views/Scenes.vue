<template>
  <div class="scenes">
    <DraftList ref="draft"></DraftList>
    <Preview ref="preview"></Preview>
    <Materials></Materials>
  </div>
</template>

<script>
import DraftList from "../components/scenes/DraftList";
import Materials from "../components/scenes/Materials";
import Preview from "../components/Preview";
import resource from "../mock/resource.json";
import { installAsset } from "../utils/AssetsUtils";
import { VideoClip } from "@/utils/ProjectData";
import { CLIP_TYPES, DEFAULT_FONT } from "@/utils/Global";

export default {
  components: {
    DraftList,
    Materials,
    Preview
  },
  data() {
    return {};
  },
  async created() {
    await this.installFont();
    await this.installM3u8();
    this.$refs.preview.createTimeline();
  },
  methods: {
    // todo 以下是测试代码
    async installM3u8() {
      let pos = 0;
      const defaultDuration = 3000000;
      const clips = [];
      for (let i = 0; i < resource.resourceList.length; i++) {
        const clip = resource.resourceList[i];
        if (!clip.m3u8Path) {
          clip.m3u8Path = await installAsset(clip.m3u8Url);
        }
        const videoClip = new VideoClip({
          ...clip,
          inPoint: pos,
          trimIn: 0,
          trimOut: clip.duration * 1000 || defaultDuration,
          orgDuration: clip.duration * 1000 || defaultDuration,
          duration: clip.duration * 1000 || defaultDuration
        });
        clips.push(videoClip);
        pos += clip.duration * 1000 || defaultDuration;
      }
      this.addClipToVuex(clips);
    },
    async installFont() {
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 6,
          page: 0,
          pageSize: 20
        }
      });
      const fonts = res.data.materialList;
      const font = fonts.find(item => item.stringValue === DEFAULT_FONT);
      await installAsset(font.packageUrl);
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
