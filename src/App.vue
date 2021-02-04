<template>
  <el-container id="app">
    <el-header class="app-header flex">
      <TitleBar></TitleBar>
    </el-header>
    <el-main class="app-main" v-if="isCreate">
      <Create />
    </el-main>
    <el-main class="app-main" v-else>
      <el-menu
        :default-active="defaultActive"
        class="el-menu-vertical"
        @select="handleSelect"
        router
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
  </el-container>
</template>

<script>
import TitleBar from "./components/TitleBar";
import Create from "./views/Create";
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
    isCreate() {
      return this.$route.name === "Create";
    },
    defaultActive() {
      return this.$route.path.split("/")[1] || "";
    }
  },

  methods: {}
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
    width: 8%;
    height: 100%;
    background-color: transparent;
    border-right: 1px solid #6b6b6b;
    .el-menu-item {
      height: auto;
      // padding-top: 11px;
      margin-top: 12px;
      padding-right: 10.23% !important;
      padding-left: 15.91% !important;
      line-height: 1em;
      &:focus,
      &:hover {
        background-color: transparent;
      }
      .menu-item {
        position: relative;
        padding-top: 100%;
        .menu-icon {
          width: 5vw;
          height: 4vw;
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
