<template>
  <div :class="['upload-item', 'flex']" @click="openUploader">
    <div class="flex flex-column">
      <div class="flex">
        <svg-icon icon-class="upload" class="icon-upload"></svg-icon>
      </div>
      <div class="upload-item-text">
        {{ $t("Upload Media") }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    openUploader() {
      this.$emit("openUploader");
    }
  }
};
</script>

<style lang="scss" scoped>
.upload-item {
  cursor: pointer;
  position: relative;
  background-color: #2b2b2b;
  .icon-upload {
    width: 30%;
    max-height: 100px;
    height: auto;
  }
  .upload-item-text {
    width: 40%;
    text-align: center;
    word-break: break-word;
    color: #bdbdbd;
    font-weight: 500;
    font-size: 16px;
  }
}
</style>
