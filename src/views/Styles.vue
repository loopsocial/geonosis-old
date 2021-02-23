<template>
  <Project />
</template>

<script>
import Project from "../components/styles/Project";
export default {
  components: {
    Project
  },
  data() {
    return {
      active: "styles"
    };
  }
};
</script>

<style lang="scss" scoped></style>
<i18n>
{
  "en": {
    "styles": "Trending Style",
    "none": "None"
  }
}
</i18n>
