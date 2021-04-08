<template>
  <div class="style-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      infinite-scroll-immediate
      :infinite-scroll-distance="5"
      :infinite-scroll-disabled="disabled"
    >
      <li
        class="list-item"
        :class="{ selected: currentModuleId === style.id }"
        v-for="style of compounds"
        :key="style.uuid"
        v-loading="style.isInstalling"
        @click="userModule(style)"
      >
        <svg-icon class="heart-icon" icon-class="heart"></svg-icon>
        <img :src="style.thumbnail_url" alt="" class="content" />
        <img class="cover" :src="coverData" alt="" v-if="coverData" />
      </li>
      <!-- <li class="list-item">
        <svg-icon class="heart-icon" icon-class="heart"></svg-icon>
        <img class="cover" :src="coverData" />
      </li> -->
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
  </div>
</template>

<script>
import SvgIcon from "../SvgIcon.vue";
import videoModules from "@/mock/videoModules";
import { base64ToString } from "@/utils/common";
import { readModuleXml } from "@/utils/XmlUtils";
import { CaptionClip, StickerClip } from "@/utils/ProjectData";

export default {
  components: { SvgIcon },
  props: ["coverData"],
  data() {
    return {
      styleList: videoModules.modules,
      isLoading: false,
      isNoMore: false,
      page: 0,
      compounds: []
    };
  },
  computed: {
    disabled() {
      return this.isLoading || this.isNoMore;
    }
  },
  mounted() {
    this.getStyleList();
  },

  methods: {
    async getStyleList() {
      const { compounds } = await this.axios.get(
        this.$api.videoProjectActionById("compounds", this.$route.query.id)
      );
      this.compounds = compounds;
    },
    async getModule(encodedXml) {
      const string = base64ToString(encodedXml);
      FS.writeFile("module.xml", string);
      console.log("模板xml", string);
      const moduleDate = await readModuleXml("module.xml");
      console.log("模板数据", moduleDate);
      await this.loadModule(moduleDate);
      this.$bus.$emit(this.$keys.rebuildTimeline);
    },
    async loadModule(moduleDate) {
      const videos = this.videos;
      if (!moduleDate) return;
      if (!Array.isArray(moduleDate.scenes)) return;
      let intro;
      let end;
      const defaultScenes = moduleDate.scenes.filter(scene => {
        if (scene.temporal === "end") end = scene;
        else if (scene.temporal === "intro") intro = scene;
        else return true;
      });
      console.log(
        "解析出的模板.片头:",
        intro,
        "中间通用:",
        defaultScenes,
        "片尾：",
        end
      );
      let j = 0;
      const moduleValues = { captions: [], stickers: [], images: [] };

      for (let index = 0; index < videos.length; index++) {
        const video = videos[index];
        for (let i = 0; i < video.splitList.length; i++) {
          const arr = video.splitList;
          const item = video.splitList[i];
          const v = {
            inPoint: video.inPoint,
            duration: item.captureOut - item.captureIn,
            raw: item.raw,
            videoType: video.videoType
          };
          if (j === 0) {
            const { captions, stickers, images } = await this.applyModuleScene(
              v,
              intro || defaultScenes[0]
            );
            moduleValues.captions.push(...captions);
            moduleValues.stickers.push(...stickers);
            moduleValues.images.push(...images);
          } else if (index === videos.length - 1 && arr.length - 1 === i) {
            const index = Math.min(
              j - Number(!!intro),
              defaultScenes.length - 1
            );
            const { captions, stickers, images } = await this.applyModuleScene(
              v,
              end || defaultScenes[index]
            );
            moduleValues.captions.push(...captions);
            moduleValues.stickers.push(...stickers);
            moduleValues.images.push(...images);
          } else {
            const index = Math.min(
              j - Number(!!intro),
              defaultScenes.length - 1
            );
            const { captions, stickers, images } = await this.applyModuleScene(
              v,
              defaultScenes[index]
            );
            moduleValues.captions.push(...captions);
            moduleValues.stickers.push(...stickers);
            moduleValues.images.push(...images);
          }
          j += 1;
        }
      }
      this.addMultipleClipToVuex({
        ...moduleValues,
        videoModule: moduleDate,
        needClear: true
      });
    },
    async applyModuleScene(video, scene) {
      const moduleValues = { captions: [], stickers: [], images: [] };
      if (!scene) return moduleValues;
      const { inPoint, duration } = video;
      const moduleLayer = scene.layers.find(l => l.type === "module");

      // 添加模板字幕
      if (moduleLayer) {
        const { text, image, stickers } = moduleLayer;
        // 添加字幕
        text.map(item => {
          const moduleCaption = new CaptionClip({
            ...item,
            text: item.value || item.text,
            inPoint: inPoint,
            duration: duration || video.duration,
            isModule: true
          });
          moduleValues.captions.push(moduleCaption);
        });
        // 添加贴纸
        Array.isArray(stickers) &&
          stickers.map(sticker => {
            const moduleSticker = new StickerClip({
              ...sticker,
              inPoint,
              duration: duration || video.duration,
              isModule: true
            });
            moduleValues.stickers.push(moduleSticker);
          });
        // 添加图片
        if (image && image.source) {
          const { m3u8Path, src, m3u8Url } = image.source;
          if (!m3u8Path) {
            console.warn("图片添加失败，缺少m3u8Path", image);
            return moduleValues;
          }
          moduleValues.images.push({
            m3u8Path,
            m3u8Url,
            inPoint,
            src,
            duration,
            trimIn: 0,
            trimOut: duration
          });
        }
      }
      return moduleValues;
    },
    load() {},
    async userModule(style) {
      this.$bus.$emit(this.$keys.destroyWorkFlow);
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      try {
        await this.getModule(style.encoded_dom_xml);
        this.currentModuleId = style.id;
      } catch (error) {
        this.$message({
          type: "error",
          message: this.$t("error")
        });
        console.error("模板应用失败", error);
      } finally {
        loading.close();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1400px) {
  .list {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
.style-list {
  height: 100%;
  overflow: auto;
  padding: 0 20px;
  color: $white;
  @include scrollBarStyle();
  .list {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 15px;
    .list-item {
      position: relative;
      border-radius: 6px;
      width: 100%;
      height: auto;
      border: 4px solid transparent;
      transition: color 0.3s;
      aspect-ratio: 9/16;
      position: relative;
      box-sizing: content-box;
      transition: all 0.5s ease;
      &.selected {
        border: 4px solid #fff;
      }
      &.active {
        border-color: $white;
      }
      .heart-icon {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 20;
      }
      .cover {
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      .content {
        width: 100%;
        height: 100%;
        position: absolute;
        z-index: 10;
        object-fit: contain;
      }
    }
  }
  p {
    @include textAlignH();
  }
}
</style>

<i18n>
{
  "en": {
    "error": "Apply Module Failed"
  }
}
</i18n>
