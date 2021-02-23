<template>
  <div class="music-list infinite-list-wrapper">
    <ul
      class="list"
      v-infinite-scroll="load"
      infinite-scroll-immediate
      :infinite-scroll-distance="5"
      :infinite-scroll-disabled="disabled"
    >
      <li
        class="list-item"
        v-for="music of musicList"
        :key="music.uuid"
        v-loading="music.isInstalling"
      >
        <div class="cover">
          <img :src="music.coverUrl" alt="" srcset="" v-if="music.coverUrl" />
        </div>
        <div class="info">
          <div class="name">{{ music.name }}</div>
          <div class="singer">Icarus</div>
        </div>
        <div class="btns">
          <el-button type="text">{{ $t("trim") }}</el-button>
          <el-button type="text">{{ $t("use") }}</el-button>
        </div>
        <!-- <img :src="style.coverUrl" alt="" /> -->
      </li>
    </ul>
    <p v-if="isLoading">{{ $t("loading") }}</p>
    <p v-else-if="isNoMore">{{ $t("noMore") }}</p>
    <!-- <p v-else>{{ $t(" ") }}</p> -->
  </div>
</template>

<script>
import { installAsset } from "@/utils/AssetsUtils";
export default {
  data() {
    return {
      musicList: [],
      isLoading: false,
      isNoMore: false,
      musicCount: 0,
      page: 0
    };
  },
  computed: {
    disabled() {
      return this.isLoading || this.isNoMore;
    }
  },
  created() {
    this.getMusic();
  },
  methods: {
    async load() {
      console.log(33);
      this.isLoading = true;
      await this.getMusic();
      this.isLoading = false;
    },
    async getMusic() {
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 7,
          page: this.page,
          pageSize: 40,
          category: 1
        }
      });
      const { materialCount, materialList } = res.data;
      this.musicCount = materialCount;
      for (let i = 0; i < materialList.length; i++) {
        const sticker = {
          ...materialList[i],
          name: materialList[i].displayName,
          isInstalling: true
        };
        this.musicList.push(sticker);
        installAsset(materialList[i].m3u8Url).then(() => {
          sticker.isInstalling = false;
        });
      }
      if (this.musicList.length >= this.musicCount) {
        this.isNoMore = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.music-list {
  height: 100%;
  overflow: auto;
  padding: 0 20px;
  color: #fff;
  @include scrollBarStyle();
  .list {
    .list-item {
      display: flex;
      margin-bottom: 20px;
      height: 63px;
      position: relative;
      border-radius: 6px;
      .cover {
        height: 63px;
        width: 63px;
        background-color: pink;
        border-radius: 6px;
        img {
          height: 100%;
          width: 100%;
        }
      }
      .info {
        margin-left: 7px;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: space-between;
        font-weight: 600;
        .name {
          font-size: 16px;
        }
        .singer {
          font-size: 14px;
          color: #9b9b98;
        }
      }
      .btns {
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
    "trim":"Trim",
    "use":"Use",
    "noMore": "No More"
  }
}
</i18n>
