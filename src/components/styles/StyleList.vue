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
        :class="{ selected: isCurrentSelected(style) }"
        v-for="style of compounds"
        :key="style.uuid"
        v-loading="style.isInstalling"
        @click="userModule(style)"
      >
        <svg-icon class="heart-icon" icon-class="heart"></svg-icon>
        <img :src="style.thumbnail_url" alt="" class="content" />
        <img class="cover" :src="coverData" alt="" v-if="coverData" />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("nomore") }}</p>
  </div>
</template>

<script>
import SvgIcon from "../SvgIcon.vue";
import videoModules from "@/mock/videoModules";
import { base64ToString } from "@/utils/common";
import { readModuleXml } from "@/utils/XmlUtils";

export default {
  components: { SvgIcon },
  props: {
    coverData: String
  },
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
    isCurrentSelected(style) {
      return this.$store.state.clip.videoModule?.alias === style.alias;
    },
    async getStyleList() {
      const { compounds } = await this.axios.get(
        this.$api.compounds(this.$route.query.id || "ao08xo")
      );
      this.compounds = compounds;
    },
    async getModule(encodedXml) {
      const string = base64ToString(encodedXml);
      FS.writeFile("module.xml", string);
      console.log("模板xml", string);
      const moduleDate = await readModuleXml("module.xml");
      console.log("模板数据", moduleDate);
      this.setVideoModule(moduleDate);
      this.$bus.$emit(this.$keys.rebuildTimeline);
    },
    load() {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 1999);
    },
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
