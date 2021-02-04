<template>
  <div class="sticker-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      :infinite-scroll-distance="3"
      :infinite-scroll-delay="500"
      infinite-scroll-immediate
      :infinite-scroll-disabled="disabled"
    >
      <li
        v-for="sticker of stickerList"
        :key="sticker.uuid"
        class="list-item"
        v-loading="sticker.isInstalling"
      >
        <img :src="sticker.coverUrl" alt="" />
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("nomore") }}</p>
    <p v-else>{{ $t(" ") }}</p>
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
export default {
  components: {},
  data() {
    return {
      stickerList: [],
      isLoading: false,
      isNoMore: false,
      page: 0
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
      if (this.isNoMore) return;
      this.isLoading = true;
      try {
        this.page++;
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
          type: 4,
          page: this.page,
          pageSize: 40,
          category: 1
        }
      });
      const { materialCount, materialList } = res.data;
      this.stickerCount = materialCount;
      for (let i = 0; i < materialList.length; i++) {
        const sticker = {
          ...materialList[i],
          isInstalling: true
        };
        this.stickerList.push(sticker);
        installAsset(materialList[i].packageUrl).then(() => {
          sticker.isInstalling = false;
        });
      }
      if (this.stickerList.length >= this.stickerCount) {
        this.isNoMore = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.sticker-list {
  padding: 0 20px;
  overflow-y: auto;
  color: #fff;
  @include scrollBarStyle();

  .list {
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
  .list {
    grid-template-columns: repeat(6, 1fr);
    gap: 20px;
  }
  .template-load-more {
    grid-column-start: span 5;
  }
}
@media screen and (max-width: 1600px) {
  .list {
    grid-template-columns: repeat(5, 1fr);
  }
  .template-load-more {
    grid-column-start: span 4;
  }
}
@media screen and (max-width: 1400px) {
  .list {
    grid-template-columns: repeat(4, 1fr);
  }
  .template-load-more {
    grid-column-start: span 3;
  }
}
@media screen and (max-width: 1200px) {
  .list {
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
    "nomore":"No More!"
  }
}
</i18n>
