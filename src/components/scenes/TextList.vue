<template>
  <div class="text-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      :infinite-scroll-distance="3"
      :infinite-scroll-delay="1000"
      infinite-scroll-immediate
      :infinite-scroll-disabled="disabled"
    >
      <li
        v-for="caption of captionList"
        :key="caption.uuid"
        class="list-item"
        v-loading="caption.isInstalling"
      >
        <img :src="caption.coverUrl" alt="" />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("nomore") }}</p>
    <!-- <p v-else>{{ $t(" ") }}</p> -->
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
export default {
  components: {},
  data() {
    return {
      captionList: [],
      page: 0,
      isLoading: false,
      isNoMore: false,
      captionCount: 0
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
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 3,
          page: this.page,
          pageSize: 20,
          category: 3
        }
      });
      const { materialCount, materialList } = res.data;
      this.captionCount = materialCount;
      for (let i = 0; i < materialList.length; i++) {
        const sticker = {
          ...materialList[i],
          isInstalling: true
        };
        this.captionList.push(sticker);
        installAsset(materialList[i].packageUrl).then(() => {
          sticker.isInstalling = false;
        });
      }
      if (this.captionList.length >= this.captionCount) {
        this.isNoMore = true;
      }
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
