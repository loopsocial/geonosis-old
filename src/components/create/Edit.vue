<template>
  <div class="ln-create-edit">
    <EditMedias :medias="medias"></EditMedias>
    <canvas class="preview-window" width="310" height="540"></canvas>
  </div>
</template>

<script>
import EditMedias from "./EditMedias";
export default {
  components: {
    EditMedias
  },
  props: {
    medias: Array
  }
};
</script>

<style lang="scss" scoped>
.preview-window {
  background-color: black;
}
</style>
