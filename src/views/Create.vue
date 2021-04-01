<template>
  <div class="create">
    <Project
      @open-media="openMedia"
      :videoProjects="videoProjects"
      v-if="status === statusMap.media"
      @refresh-videoproject="refreshVideoproject"
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
import { mapActions } from "vuex";

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
      videoProjects: [],
      mediaDialog: false,
      loading: false,
      medias: [], // 已选择的素材
      status: statusMap.media,
      statusMap
    };
  },
  async created() {
    if (this.$route.query.access_token) {
      this.$router.replace({});
    }
    await this.getMediaLibrary();
    this.$store.commit("clip/init", {});
    this.$store.commit("clip/changeLoaded", false);
  },
  methods: {
    ...mapActions({
      setNvsStatus: "setNvsStatus",
      setProjectStatus: "setProjectStatus"
    }),
    openMedia() {
      this.mediaDialog = true;
    },
    cancel() {
      this.mediaDialog = false;
    },
    selectedFinish(videoProject) {
      this.mediaDialog = false;
      this.status = this.statusMap.edit;
      this.medias = videoProject.media_assets;
      this.resetLoaded();
      this.setNvsStatus(false);
      this.setProjectStatus(false);
      this.$router.push({
        name: "Scenes",
        query: { id: videoProject.id }
      });
    },
    getMediaLibrary() {
      if (this.loading) return;
      this.loading = true;
      return this.axios
        .get(this.$api.videoProjects)
        .then(res => {
          this.loading = false;
          const { video_projects } = res;
          this.videoProjects = video_projects;
        })
        .catch(err => {
          console.error(err);
          this.$router.push({ name: "Login" });
        });
    },
    refreshVideoproject() {
      this.getMediaLibrary();
    }
  }
};
</script>

<style lang="scss" scoped>
.create {
  height: 100%;
  width: 100%;
}
</style>

<i18n>
{
  "en": {
    "pick": "Pick Media"
  }
}
</i18n>
