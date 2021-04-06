<template>
  <div class="sticker-list infinite-list-wrapper">
    <ul
      class="infinite-list"
      v-infinite-scroll="load"
      :infinite-scroll-disabled="isLoading || isNoMore"
    >
      <li
        v-for="sticker of stickerList"
        :key="sticker.key"
        class="infinite-list-item"
        v-loading="sticker.isInstalling"
      >
        <img :src="stickerImage" alt="" />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
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
      stickerImage: require("@/assets/images/test-sticker-80's.png")
    };
  },
  created() {
    this.getStickers();
  },
  methods: {
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
.sticker-list {
  width: 100%;
  padding: 0 20px;
  overflow-y: auto;
  color: #fff;
  @include scrollBarStyle();
  .infinite-list {
    display: grid;
    padding: 0;
    list-style: none;

    img {
      width: 100%;
    }
  }
  p {
    width: 100%;
    text-align: center;
  }
}

@media screen and (max-width: 3000px) {
  .infinite-list {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  .template-load-more {
    grid-column-start: span 5;
  }
}
@media screen and (max-width: 1600px) {
  .infinite-list {
    grid-template-columns: repeat(5, 1fr);
  }
  .template-load-more {
    grid-column-start: span 4;
  }
}
@media screen and (max-width: 1300px) {
  .infinite-listt {
    grid-template-columns: repeat(4, 1fr);
  }
  .template-load-more {
    grid-column-start: span 3;
  }
}
@media screen and (max-width: 1000px) {
  .infinite-list {
    grid-template-columns: repeat(3, 1fr);
  }
  .template-load-more {
    grid-column-start: span 2;
  }
}
</style>

<i18n>
{
  "en":{
    "loading":"Loading...",
  }
}
</i18n>
