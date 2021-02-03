<template>
  <div class="create">
    <Project
      @open-media="openMedia"
      v-if="status === statusMap.media"
    ></Project>
    <Edit
      v-if="status === statusMap.edit"
      :medias="medias"
      @add-media="mediaDialog = true"
    ></Edit>

    <el-dialog
      :title="$t('pick')"
      top="0"
      custom-class="ln-dialog"
      width="70%"
      center
      :visible.sync="mediaDialog"
    >
      <Medias @cancel="cancel" @selected-finish="selectedFinish"></Medias>
    </el-dialog>
  </div>
</template>

<script>
import Project from "../components/create/Project";
import Medias from "../components/create/Medias";
import Edit from "../components/create/Edit";
const statusMap = {
  media: "media",
  edit: "edit"
};
export default {
  components: {
    Project,
    Medias,
    Edit
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
