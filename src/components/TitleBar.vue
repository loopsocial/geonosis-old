<template>
  <div class="flex" id="title-bar">
    <svg-icon class="logo" icon-class="logo"></svg-icon>
    <div class="btn" v-if="!$route.name === 'Create'">
      <el-button type="text" size="medium">{{ $t("preview") }}</el-button>
      <el-button round class="round-btn" size="medium">{{
        $t("publish")
      }}</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      pathList: ["create", "template", "sceneediting", "post"] // 这个顺序不可改
    };
  },
  computed: {},
  methods: {
    getClasses(i) {
      let { fullPath } = this.$route;
      fullPath = fullPath.toLocaleLowerCase();
      const index = this.pathList.findIndex(path => fullPath.includes(path));
      if (index < i) return "";
      if (index === i) return "current-path";
      return "finish-path";
    }
  }
};
</script>

<style lang="scss">
#title-bar {
  width: 100%;
  justify-content: space-between;
  .logo {
    width: 105px;
    height: 24px;
  }
  .round-btn {
    margin-left: 33px;
  }
  .el-breadcrumb__item {
    height: 15px;
    font-size: 16px;
    .el-breadcrumb__inner {
      color: $border-color;
      cursor: pointer;
      font-weight: 600;
    }
    &.current-path {
      .el-breadcrumb__inner {
        color: white;
      }
    }
    &.finish-path {
      .el-breadcrumb__inner {
        color: $active-color;
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "preview":"Preivew",
    "publish":"Publish",
    "create": "Create",
    "template": "Template",
    "sceneEditing": "Scene Editing",
    "post": "Post",
    "next": "Next"
  }
}
</i18n>
