<template>
  <div class="ln-template">
    <Templates></Templates>
    <div class="realtime-preview">
      <Preview></Preview>
    </div>
  </div>
</template>

<script>
import Templates from "../components/template/Templates";
import Preview from "../components/Preview";
export default {
  components: {
    Preview,
    Templates
  }
};
</script>

<style lang="scss" scoped>
.ln-template {
  display: grid;
  flex: 1;
  grid-template-columns: repeat(2, 1fr);
  height: 100%;
  .realtime-preview {
    border-left: 1px solid $border-color;
    display: flex;
    flex-direction: column;
  }
}
</style>
<i18n>
{
  "en": {
    "preview": "Readltime Preview"
  }
}
</i18n>
