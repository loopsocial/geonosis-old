<template>
  <div class="ln-templates">
    <el-tabs v-model="active" class="ln-tabs-body ln-template-tabs">
      <el-tab-pane :label="$t('styles')" name="styles"></el-tab-pane>
      <el-tab-pane name="likes">
        <svg-icon
          slot="label"
          :icon-class="active === 'likes' ? 'heart-red' : 'heart'"
        ></svg-icon>
      </el-tab-pane>
    </el-tabs>
    <div class="none">
      <svg-icon slot="label" icon-class="none"></svg-icon>
      {{ $t("none") }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: "styles"
    };
  }
};
</script>

<style lang="scss" scoped>
.ln-templates {
  position: relative;
  .none {
    position: absolute;
    top: 10px;
    right: 0;
    color: white;
  }
}
</style>
<i18n>
{
  "en": {
    "styles": "Trending Style",
    "none": "None"
  }
}
</i18n>
