<template>
  <div class="project">
    <DraftList />
    <Preview />
    <Materials />
    <div v-if="isDragging" :style="style"></div>
  </div>
</template>

<script>
import DraftList from "../scenes/DraftList";
import Materials from "../scenes/Materials";
import Preview from "../Preview";
export default {
  components: {
    DraftList,
    Materials,
    Preview
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.project {
  display: flex;
  flex: 1;
  padding: 12px 0 24px 22px;
  .project-icon {
    width: 195px;
    height: 176px;
  }
  .draft-list {
    height: 100%;
  }
  .canvas {
    margin-left: 32px;
  }
  .materials {
    flex: 1;
    margin-left: 54.25px;
  }
}
</style>

<i18n>
{
  "en": {
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
