<template>
  <div :class="['project-item']">
    <div class="project-state" v-if="project.state">
      {{ project.state }}
    </div>
    <div class="flex project-action-items" @click="openActionItems(project)">
      <i class="el-icon-more"></i>
    </div>
    <div class="project-cover-wrapper" @click="selectProject">
      <el-image
        class="project-cover"
        ref="image"
        :src="project.thumbnail_url"
        fit="cover"
      ></el-image>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    project: Object
  },
  mounted() {},
  methods: {
    openActionItems() {
      console.log("openActionItems");
    },
    selectProject() {
      this.$emit("selectProject", this.project);
    }
  }
};
</script>

<style lang="scss" scoped>
.project-item {
  position: relative;
  .project-state {
    position: absolute;
    z-index: 10;
    top: 8px;
    left: 7px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5);
    text-transform: capitalize;
    font-size: 12px;
    line-height: 14px;
    user-select: none;
  }
  .project-action-items {
    cursor: pointer;
    position: absolute;
    z-index: 10;
    top: 8px;
    right: 8px;
    width: 36px;
    height: 36px;
    border-radius: 36px;
    background: rgba(0, 0, 0, 0.5);
    font-size: 20px;
  }

  .project-cover-wrapper {
    cursor: pointer;
  }
  .project-cover {
    filter: drop-shadow(0 0 10 rgba(0, 0, 0, 0.3));
    height: auto;
    width: 100%;
    transition: all 0.3s;
    aspect-ratio: 9/16;
    border: 4px solid transparent;
    border-radius: 6px;
    box-sizing: border-box;
  }
}
</style>
