<template>
  <div class="create">
    <Project @open-media="openMedia"></Project>
    <el-dialog
      :title="$t('pick')"
      top="0"
      custom-class="ln-dialog"
      width="70%"
      center
      :visible.sync="mediaDialog"
    >
      <Medias @cancel="cancel"></Medias>
    </el-dialog>
  </div>
</template>

<script>
import Project from "../components/create/Project";
import Medias from "../components/create/Medias";
export default {
  components: {
    Project,
    Medias
  },
  data() {
    return {
      mediaDialog: false
    };
  },
  methods: {
    openMedia() {
      this.mediaDialog = true;
    },
    cancel() {
      this.mediaDialog = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.create {
  height: 100%;
}
</style>

<i18n>
{
  "en": {
    "pick": "Pick Media"
  }
}
</i18n>
