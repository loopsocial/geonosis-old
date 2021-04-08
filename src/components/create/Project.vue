<template>
  <div class="project flex">
    <div class="content flex" ref="content">
      <h2 class="title">{{ $t("start") }}</h2>
      <svg-icon icon-class="project" class="project-icon"></svg-icon>
      <span class="message">{{ $t("msg") }}</span>
      <el-button
        round
        class="round-btn lang"
        autofocus
        size="medium"
        @click="$emit('open-media')"
      >
        {{ $t("addMedia") }}
      </el-button>
    </div>
    <div class="content project-list-wrapper">
      <h2 class="title">{{ $t("previous") }}</h2>
      <div
        class="projects-list"
        infinite-list-wrapper
        v-infinite-scroll="loadMoreVideoProjects"
        infinite-scroll-immediate
        :infinite-scroll-distance="5"
        :infinite-scroll-disabled="loading"
      >
        <div
          :class="['project-wrapper']"
          v-for="project in videoProjects"
          :key="project.id"
        >
          <ProjectItem
            :project="project"
            @select-project="selectProject"
            @refresh-videoproject="refreshVideoproject"
          />
          <div class="project-title">
            {{ project.title || "Untitle" }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ProjectItem from "./ProjectItem";
import { mapActions } from "vuex";
export default {
  components: {
    ProjectItem
  },
  props: {
    videoProjects: Array,
    loading: Boolean
  },
  methods: {
    async selectProject(project) {
      const res = await this.axios.get(
        `${this.$api.videoProjects}/${project.id}`
      );
      this.medias = res.media_assets;
      this.$router.push({
        name: "Scenes",
        query: { id: project.id },
        params: {
          mediaAssets: res.media_assets,
          videoProject: res
        }
      });
    },
    refreshVideoproject() {
      this.$emit("refresh-videoproject");
    },
    loadMoreVideoProjects() {
      this.$emit("loadmore-videoproject");
    }
  }
};
</script>

<style lang="scss" scoped>
.project {
  height: 100%;
  position: relative;
  justify-content: space-evenly;
  align-items: center;
  .title {
    color: #fff;
    font-weight: 600;
    font-size: 16px;
  }
  .project-icon {
    width: 195px;
    height: 176px;
  }
  .project-title {
    color: #bdbdbd;
  }
  .content {
    height: 74.2vh;
    width: calc(74.2vh * 0.5625);
    border: 1px dashed #9b9b9b;
    border-radius: 6px;

    flex-direction: column;
    .title {
      position: absolute;
      top: 1.5%;
    }
    .lang {
      padding: 10px 52px;
    }
    .wrapper {
      height: 100%;
    }
  }
  .message {
    padding: 0 40px;
    text-align: center;
    letter-spacing: -0.434118px;
    color: white;
    margin: 30px 0;
  }
  .pre-project {
    height: 100%;
    width: 50%;
    display: flex;
    flex-direction: column;

    .message {
      margin: 32px 18px;
    }
    .what-is-it {
      margin-right: 16px;
      margin-bottom: 10px;
      flex-shrink: 0;
      color: #fff;
      .cover {
        background-color: pink;
        border-radius: 6px;
        padding-top: 161.4%;
      }
      span {
        display: inline-block;
        margin-top: 10px;
      }
    }
    .item-container {
      display: grid;
      height: calc(100% - 90px);
      overflow: auto;
    }
  }

  .content.project-list-wrapper {
    color: white;
    height: 74.2vh;
    width: calc(74.2vh * 1.3625);
    border: none;
    position: relative;
    .title {
      top: -9.5%;
      left: 0;
    }
  }
  .projects-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px 8px;
  }

  @media screen and (max-width: 1600px) {
    .item-container {
      grid-template-columns: repeat(5, 1fr) !important;
    }
  }
  @media screen and (max-width: 1300px) {
    .item-container {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  }
  @media screen and (max-width: 1000px) {
    .item-container {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
}
</style>

<i18n>
{
  "en": {
    "start":"Start from scratch",
    "msg": "Add & arrange video clips and images to build your video",
    "addMedia": "Add Media",
    "previous": "Previous Project",
    "Draft": "Draft"
  }
}
</i18n>
