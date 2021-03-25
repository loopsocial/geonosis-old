<template>
  <div :class="['project-item']">
    <div class="project-state" v-if="project.state">
      {{ project.state }}
    </div>
    <div class="project-action-items-wrapper">
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        @command="handleCommand"
      >
        <div class="project-action-items flex">
          <i class="el-icon-more"></i>
        </div>
        <el-dropdown-menu slot="dropdown">
          <!-- <el-dropdown-item icon="el-icon-copy-document" command="duplicate">
            Duplicate
          </el-dropdown-item> -->
          <!-- <el-dropdown-item
            v-if="project.state === 'published'"
            icon="el-icon-link"
            command="share"
          >
            Share link
          </el-dropdown-item> -->
          <el-dropdown-item icon="el-icon-delete-solid" command="delete">
            Delete
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div class="project-cover-wrapper" @click="selectProject">
      <el-image
        class="project-cover"
        ref="image"
        :src="project.thumbnail_url"
        fit="cover"
      ></el-image>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    project: Object
  },
  mounted() {},
  methods: {
    handleCommand(command) {
      console.log("handleCommand", command, this.project);
      if (command === "delete") {
        this.$confirm(
          "This will permanently delete the video project. Continue?",
          "",
          {
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            type: "warning"
          }
        )
          .then(async () => {
            await axios.delete(this.$api.videoProjectById(this.project.id));
            this.$message({
              type: "success",
              message: "Delete completed"
            });
            this.$emit("refresh-videoproject");
          })
          .catch(() => {
            this.$message({
              type: "info",
              message: "Delete canceled"
            });
          });
      }
      // if (command === "share") {
      // }
      // if (command === "duplicate") {
      // }
    },
    selectProject() {
      this.$emit("select-project", this.project);
    }
  }
};
</script>

<style lang="scss" scoped>
.project-item {
  position: relative;
  .project-state {
    position: absolute;
    z-index: 10;
    top: 8px;
    left: 7px;
    padding: 4px 8px;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.5);
    text-transform: capitalize;
    font-size: 12px;
    line-height: 14px;
    user-select: none;
  }
  .project-action-items-wrapper {
    position: absolute;
    z-index: 10;
    top: 8px;
    right: 8px;
    .project-action-items {
      cursor: pointer;
      width: 36px;
      height: 36px;
      border-radius: 36px;
      color: white;
      background: rgba(0, 0, 0, 0.5);
      font-size: 20px;
      &:focus {
        outline: none;
      }
    }
  }

  .project-cover-wrapper {
    cursor: pointer;
  }
  .project-cover {
    filter: drop-shadow(0 0 10 rgba(0, 0, 0, 0.3));
    height: auto;
    width: 100%;
    transition: all 0.3s;
    aspect-ratio: 9/16;
    border: 4px solid transparent;
    border-radius: 6px;
    box-sizing: border-box;
  }
}
</style>
