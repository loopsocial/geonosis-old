<template>
  <div class="flex" id="title-bar">
    <svg-icon class="logo" icon-class="logo"></svg-icon>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ name: 'Create' }" :class="getClasses(0)">
        {{ $t("create") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'Template' }" :class="getClasses(1)">
        {{ $t("template") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'SceneEditing' }" :class="getClasses(2)">
        {{ $t("sceneEditing") }}
      </el-breadcrumb-item>
      <el-breadcrumb-item :to="{ name: 'Post' }" :class="getClasses(3)">
        {{ $t("post") }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="btn">
      <el-button round class="round-btn" size="medium">{{ $t("next") }}</el-button>
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
    "create": "Create",
    "template": "Template",
    "sceneEditing": "Scene Editing",
    "post": "Post",
    "next": "Next"
  }
}
</i18n>
