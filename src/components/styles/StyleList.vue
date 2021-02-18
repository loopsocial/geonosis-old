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
        v-for="style of styleList"
        :key="style.uuid"
        v-loading="style.isInstalling"
      >
        <svg-icon class="heart-icon" icon-class="heart"></svg-icon>
        <img class="cover" :src="coverData" alt="" v-if="coverData" />
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
  props: {
    coverData: String
  },
  data() {
    return {
      styleList: [1, 2, 2, 2, 2, 22, 21, 132, 312, 123, 312, 2],
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
      this.isLoading = true;
      setTimeout(() => {
        this.styleList.push(1, 2, 3);

        this.isLoading = false;
      }, 1999);
    }
  }
};
</script>

<style lang="scss" scoped>
.style-list {
  height: 100%;
  overflow: auto;
  padding: 0 20px;
  color: #fff;
  @include scrollBarStyle();
  .list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    .list-item {
      position: relative;
      padding-top: 178%;
      position: relative;
      border: 2px solid #fff;
      border-radius: 6px;
      .heart-icon {
        position: absolute;
        left: 10px;
        top: 10px;
        z-index: 10;
      }
      .cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    }
  }
  p {
    @include textAlignH();
  }
}
</style>
