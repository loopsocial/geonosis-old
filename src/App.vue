<template>
  <el-container id="app" v-loading="isLoading">
    <el-header class="app-header flex">
      <TitleBar></TitleBar>
    </el-header>
    <el-main class="app-main" v-if="isCreate">
      <Create />
    </el-main>
    <el-main class="app-main" v-if="isEditPages && !isCreate">
      <el-menu
        :default-active="defaultActive"
        class="el-menu-vertical"
        @select="selectRouter"
        :collapse-transition="false"
      >
        <el-menu-item index="Scenes">
          <div class="menu-item">
            <svg-icon class="menu-icon" icon-class="scene"></svg-icon>
            <span slot="title">{{ $t("scenes") }}</span>
          </div>
        </el-menu-item>
        <el-menu-item index="Styles">
          <div class="menu-item">
            <svg-icon class="menu-icon" icon-class="styles"></svg-icon>
            <span slot="title">{{ $t("styles") }}</span>
          </div>
        </el-menu-item>
        <el-menu-item index="Music">
          <div class="menu-item">
            <svg-icon class="menu-icon" icon-class="music"></svg-icon>
            <span slot="title">{{ $t("music") }}</span>
          </div>
        </el-menu-item>
        <el-menu-item index="Branding">
          <div class="menu-item">
            <svg-icon class="menu-icon" icon-class="brand"></svg-icon>
            <span slot="title">{{ $t("branding") }}</span>
          </div>
        </el-menu-item>
      </el-menu>
      <router-view></router-view>
    </el-main>
    <div class="drag-item" v-show="dragDivVisible" :style="dragDivStyle"></div>
  </el-container>
</template>

<script>
import TitleBar from "./components/TitleBar";
import Create from "./views/Create";
import { mapState } from "vuex";

export default {
  name: "app",
  components: {
    TitleBar,
    Create
  },
  data() {
    return {};
  },
  computed: {
    ...mapState({
      isFinishNvs: state => state.isFinishNvs,
      isFinishProject: state => state.isFinishProject
    }),
    isCreate() {
      return this.$route.name === "Create";
    },
    defaultActive() {
      return this.$route.name || "";
    },
    dragDivStyle() {
      return this.$store.state.draggable.style;
    },
    dragDivVisible() {
      return this.$store.state.draggable.isDragging;
    },
    isLoading() {
      if (["Branding", "Create"].includes(this.$route.name)) return false;
      return !(this.isFinishNvs && this.isFinishProject) && this.isEditPages;
    },
    isEditPages() {
      const pages = ["Branding", "Music", "Scenes", "Styles"];
      return pages.includes(this.$route.name);
    }
  },
  methods: {
    selectRouter(name) {
      const { id } = this.$route.query;
      const r = {
        name,
        query: { id }
      };
      this.$router.push(r);
    }
  }
};
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}
#app {
  background-color: $main-bgc;
  height: 100vh;
  display: flex;
  // > * {
  //   padding: 0 48px;
  // }
  *:not(i) {
    font-family: "Avenir Next" !important;
  }
  .el-menu-vertical {
    overflow-y: scroll;
    padding-top: 10px;
    flex-shrink: 0;
    width: 100px;
    height: calc(100% - 10px);
    background-color: transparent;
    border-right: 1px solid #6b6b6b;
    &::-webkit-scrollbar {
      display: none !important;
    }
    .el-menu-item {
      height: auto;
      // padding-top: 11px;
      margin-bottom: 12px;
      padding-right: 9px !important;
      padding-left: 9px !important;
      line-height: 1em;
      &:focus,
      &:hover {
        background-color: transparent;
      }
      .menu-item {
        position: relative;
        padding-top: 100%;
        .menu-icon {
          width: 70px;
          height: 60px;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          position: absolute;
        }

        span {
          position: absolute;
          /* bottom: -20%; */
          top: 70%;
          left: 0;
          right: 0;
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
        }
      }
    }
    .is-active .menu-item {
      width: 100%;
      border-radius: 6px;
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
  .app {
    &-header {
      height: 56px;
      border-bottom: 1px solid $border-color;
    }
    &-main {
      display: flex;
      flex: 1;
      padding: 0;
    }
  }

  .drag-item {
    position: absolute;
    background-size: contain;
    background-position: center;
    transform: translate(-50%, -50%);
  }
}
</style>
<i18n>
{
  "en":{
    "scenes":"Scenes",
    "styles":"Styles",
    "music":"Music",
    "branding":"Branding"
  }
}
</i18n>
