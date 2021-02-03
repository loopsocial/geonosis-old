<template>
  <div class="edit-medias">
    <div
      v-for="(item, index) in medias"
      :key="item.id"
      :class="['media-item', selectedId === item.id ? 'active-meida' : '']"
    >
      <span class="index">{{ index + 1 }}</span>
      <span class="duration"></span>
      <svg-icon class="cut" icon-class="cut"></svg-icon>
      <svg-icon class="delete" icon-class="delete"></svg-icon>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    medias: Array
  },
  data() {
    return {
      selectedId: null
    };
  }
};
</script>

<style lang="scss" scoped>
.edit-medias {
  background-color: $btn-bgc;
  border-radius: 12px;
  .media-item {
    position: relative;
    border-radius: 12px;
    width: 130px;
    height: 232px;
    border: 2px solid transparent;
    &.active-media {
      border-color: white;
    }
  }
}
</style>
