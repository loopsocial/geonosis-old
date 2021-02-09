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
        <div class="cover"></div>
        <div class="info">
          <div class="name">Lofi hiphop music</div>
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
    <p v-else-if="isNoMore">{{ $t("nomore") }}</p>
    <p v-else>{{ $t(" ") }}</p>
  </div>
</template>

<script>
import SvgIcon from "../SvgIcon.vue";
export default {
  components: { SvgIcon },
  data() {
    return {
      musicList: [1, 2, 2, 2, 2, 22, 21, 132, 312, 123, 312, 2],
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
  methods: {
    load() {
      console.log(33);
      this.isLoading = true;
      setTimeout(() => {
        this.musicList.push(1, 2, 3);

        this.isLoading = false;
      }, 1999);
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
    "trim":"Trim",
    "use":"Use"
}
</i18n>
