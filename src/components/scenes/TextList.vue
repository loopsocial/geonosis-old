<template>
  <div class="text-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      :infinite-scroll-distance="30"
      :infinite-scroll-disabled="disabled"
    >
      <li
        v-for="sticker of stickerList"
        :key="sticker.key"
        class="list-item"
        v-loading="sticker.isInstalling"
      >
        <img :src="stickerImage" alt="" />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("nomore") }}</p>
    <p v-else>{{ $t(" ") }}</p>
  </div>
</template>

<script>
import { sleep } from "@/utils/common.js";
export default {
  components: {},
  data() {
    return {
      stickerList: [],
      isLoading: false,
      isNoMore: false,
      stickerImage: require("@/assets/images/test-text-sticker-01.png")
    };
  },
  computed: {
    disabled() {
      return this.isLoading || this.isNoMore;
    }
  },
  created() {
    this.getStickers();
  },
  methods: {
    // getImageSrc(textSticker) {
    //   if (!textSticker) return "";
    //   return require("@/assets/images/test-text-sticker-0" + textSticker);
    // },
    async load() {
      this.isLoading = true;
      try {
        await this.getStickers();
      } catch (e) {
        this.$message({ type: "warning", message: e });
      }
      this.isLoading = false;
      // this.$emit('onLoad')
    },
    async getStickers() {
      const res = await this.axios.get(this.$api.materialList);
      await sleep(1000);
      res.data.rows.forEach((item, idx) => {
        res.data.rows[idx].isInstalling = true;
      });
      console.log(res);
      this.stickerList = [...this.stickerList, ...res.data.rows];
      if (!res.data.rows.length) {
        this.isNoMore = true;
      }
      await sleep(1000);
      res.data.rows.forEach((item, idx) => {
        res.data.rows[idx].isInstalling = false;
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.text-list {
  height: 100%;
  padding: 0 20px;
  overflow-y: auto;
  color: #fff;
  @include scrollBarStyle();

  .list {
    display: grid;
    padding: 0;
    list-style: none;
  }
  img {
    width: 100%;
  }
  p {
    width: 100%;
    text-align: center;
  }
  @media screen and (max-width: 3000px) {
    .list {
      grid-template-columns: repeat(6, 1fr);
      gap: 20px;
    }
  }
  @media screen and (max-width: 1800px) {
    .list {
      grid-template-columns: repeat(5, 1fr);
    }
  }
  @media screen and (max-width: 1500px) {
    .list {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  @media screen and (max-width: 1200px) {
    .list {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  @media screen and (max-width: 1000px) {
    .list {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
</style>

<i18n>
{
  "en":{
    "loading":"Loading...",
    "nomore":"No More!"
  }
}
</i18n>
