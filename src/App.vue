<template>
  <el-container id="app">
    <el-header class="app-header flex">
      <TitleBar></TitleBar>
    </el-header>
    <el-main class="app-main">
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
  font-family: "Avenir Next";
  background-color: $main-bgc;
  height: 100vh;
  display: flex;
  > * {
    padding: 0 48px;
  }
  .app {
    &-header {
      height: 56px;
      border-bottom: 1px solid $border-color;
    }
    &-main {
      flex: 1;
    }
  }
}
</style>
