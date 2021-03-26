<template>
  <div
    class="selected-media"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <el-image :src="getThumbnailUrl(item)" fit="cover" class="thumb">
    </el-image>
    <div
      class="remove-from-scene"
      v-if="hover"
      @mouseenter="isIconHover = true"
      @mouseleave="isIconHover = false"
    >
      <div class="icon-background">
        <i
          :class="[isIconHover ? 'el-icon-error' : 'el-icon-circle-close']"
        ></i>
      </div>
      <i
        :class="[!isIconHover ? 'el-icon-error' : 'el-icon-circle-close']"
        @click="removeMedia"
      ></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: Object
  },
  data() {
    return {
      hover: false,
      isIconHover: false
    };
  },
  methods: {
    removeMedia() {
      this.$emit("remove-media", this.item);
    },
    getThumbnailUrl(item) {
      return item.thumbnail_url || item.coverUrl;
    }
  }
};
</script>

<style lang="scss" scoped>
.selected-media {
  position: relative;
  display: inline-block;
  padding: 10px 8px 10px 0;
  .thumb {
    height: 100%;
    width: 42px;
    height: 42px;
    border-radius: 4px;
  }
  &:first-child {
    padding-left: 0px;
  }
}
.remove-from-scene {
  position: absolute;
  top: 4px;
  right: 4px;
  .icon-background {
    position: absolute;
    i {
      color: black;
      z-index: 1;
    }
  }
  > i {
    position: relative;
    z-index: 2;
  }
}
</style>
