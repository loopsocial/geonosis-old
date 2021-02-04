<template>
  <div class="scenes">
    <Project></Project>
  </div>
</template>

<script>
import Project from "../components/scenes/Project";

const statusMap = {
  media: "media",
  edit: "edit"
};
export default {
  components: {
    Project
  },
  data() {
    return {
      mediaDialog: false,
      medias: [], // 已选择的素材
      status: statusMap.media,
      statusMap
    };
  },
  methods: {
    openMedia() {
      this.mediaDialog = true;
    },
    cancel() {
      this.mediaDialog = false;
    },
    selectedFinish(list) {
      this.medias = list;
      this.mediaDialog = false;
      this.status = this.statusMap.edit;
    }
  }
};
</script>

<style lang="scss" scoped>
.scenes {
  display: flex;
  width: 92%;
}
</style>

<i18n>
{
  "en": {
    "pick": "Pick Media"
  }
}
</i18n>
