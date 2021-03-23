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
import { DEFAULT_FONT } from "@/utils/Global";
import { readProjectXml } from "@/utils/XmlUtils";
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
    console.log(this.$route.params);
    const mediaAssets = await this.getMediaAssets();
    console.log("media-assets", mediaAssets);
    await this.applyAssets(mediaAssets);
    this.$refs.preview.createTimeline();
  },
  methods: {
    // 安装字体
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
    },
    // 获取工程的mediaAssets
    async getMediaAssets() {
      let { mediaAssets } = this.$route.params;
      const { id } = this.$route.query;
      if (!Array.isArray(mediaAssets)) {
        // 这不是create跳转过来的，通过id查询mediaAssets
        if (id) {
          const project = await this.axios.get(
            `${this.$api.videoProjects}/${id}`
          );
          mediaAssets = project.media_assets;
        } else {
          mediaAssets = resource.resourceList; // 测试素材
        }
      } else {
        // 没有素材 使用测试素材
        mediaAssets = resource.resourceList; // 测试素材
      }
      return mediaAssets;
    },
    // 安装m3u8 并且更新到vuex
    async applyAssets(mediaAssets) {
      const videoList = [];
      let inPoint = 0;
      for (let i = 0; i < mediaAssets.length; i++) {
        const v = mediaAssets[i];
        const m3u8Path = await installAsset(v[`hls_${v.media_type}_url`]); // 函数内部有处理, 防止重复安装
        const video = new VideoClip({
          m3u8Path,
          inPoint,
          duration: v.media_type === "image" ? 3000000 : v.duration * 1000000,
          videoType: v.media_type,
          coverUrl: v.thumbnail_url,
          url: v[`${v.media_type}_url`],
          m3u8Url: v[`hls_${v.media_type}_url`],
          widht: v.width,
          height: v.height,
          aspectRatio: v.aspect_ratio,
          id: v.id,
          thumbnails: v.thumbnails
        });
        inPoint += video.duration;
        videoList.push(video);
      }
      this.initVuex({ videos: videoList }); // 将选择的video列表更新到vuex
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
