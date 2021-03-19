<template>
  <div class="branding-card">
    <div class="branding-title" v-if="title">
      <div class="brand-title-text" v-text="title"></div>
      <div class="branding-title-operate-wrapper">
        <slot />
      </div>
    </div>
    <slot name="content" />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss">
.branding-card {
  padding: 10px;
  padding-top: 0;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: $white;
  .branding-title {
    display: flex;
    justify-content: space-between;
    height: 36px;
    width: 100%;
    border-bottom: 1px solid #6b6b6b;
    font-size: 14px;
    line-height: 36px;
    font-weight: 500;

    .branding-title-operate-wrapper {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
