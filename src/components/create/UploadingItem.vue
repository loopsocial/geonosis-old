<template>
  <div :class="['uploading-item', 'flex']">
    <div class="upload-progress">
      <el-progress :show-text="false" :percentage="progress"></el-progress>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    progress: Number
  }
};
</script>

<style lang="scss" scoped>
.uploading-item {
  aspect-ratio: 9/16;
  width: 100%;
  cursor: pointer;
  position: relative;
  background-color: #2b2b2b;
  .upload-progress {
    width: 100%;
    padding: 0 7.5%;
  }
}
</style>
