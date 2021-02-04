<template>
  <el-container id="app">
    <el-header class="app-header flex">
      <TitleBar></TitleBar>
    </el-header>
    <el-main class="app-main">
      <el-menu
        default-active="2"
        class="el-menu-vertical"
        @open="handleOpen"
        @close="handleClose"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="2">
          <i class="el-icon-menu"></i>
          <span slot="title">导航二</span>
        </el-menu-item>
        <el-menu-item index="3" disabled>
          <i class="el-icon-document"></i>
          <span slot="title">导航三</span>
        </el-menu-item>
        <el-menu-item index="4">
          <i class="el-icon-setting"></i>
          <span slot="title">导航四</span>
        </el-menu-item>
      </el-menu>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import TitleBar from "./components/TitleBar";
export default {
  name: "app",
  components: {
    TitleBar
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
    width: 8.59%;
    height: 100%;
    background-color: transparent;

    .el-menu-item {
      padding-right: 10.23%;
      padding-left: 15.91%;
      &:focus,
      &:hover {
        background-color: transparent;
      }
    }
    .is-active {
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
