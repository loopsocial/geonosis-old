<template>
  <div class="flex" id="title-bar">
    <router-link to="/Create">
      <svg-icon class="logo" icon-class="logo"></svg-icon>
    </router-link>
    {{ isEditPages }}
    <div class="btn" v-if="isEditPages">
      <el-button type="text" size="medium" @click="preview">
        {{ $t("preview") }}
      </el-button>
      <el-button
        round
        class="round-btn"
        size="medium"
        @click="openDiablog"
        :disabled="isProjectNotPublishable"
      >
        {{ $t("publish") }}
      </el-button>
    </div>

    <transition name="el-fade-in">
      <div class="full-preview" v-if="showPreview">
        <FullPreview :auto-play="showPreview" class="preview-box"></FullPreview>
        <svg-icon
          class="preview-close"
          icon-class="close"
          @click="close"
        ></svg-icon>
      </div>
    </transition>

    <transition name="el-fade-in">
      <div class="publish-dialog" v-if="dialogVisible">
        <div class="publish-content">
          <FullPreview class="preview-box"></FullPreview>
          <el-form
            :model="infoForm"
            class="ln-form publish-form"
            :rules="rules"
            ref="infoForm"
          >
            <el-alert
              v-if="this.duration <= this.minVideoDuration"
              class="publish-warning"
              :closable="false"
              type="warning"
              :title="
                `Minimum video duration is ${this.minVideoDuration} seconds. Right now is ${this.duration} seconds.`
              "
            ></el-alert>
            <el-form-item :label="$t('caption')" prop="caption" required>
              <el-input v-model="infoForm.caption" class="ln-input"></el-input>
            </el-form-item>
            <el-form-item :label="$t('hashtags')" prop="hashtags">
              <el-input
                v-model="infoForm.hashtags"
                class="ln-input"
                @blur="handleBlur"
              ></el-input>
              <span class="minor">{{ $t("hashtagHint") }}</span>
            </el-form-item>
            <el-form-item
              :label="$t('posters')"
              prop="posters"
              class="form-poster"
            >
              <div class="posters flex" @click="getCover">
                <img
                  class="media-cover"
                  ref="image"
                  :src="infoForm.coverData"
                  fit="cover"
                  v-if="infoForm.coverData"
                />
                <template v-else>
                  {{ $t("posterMsg") }}
                  <i class="el-icon-circle-plus"></i>
                </template>
              </div>
            </el-form-item>
            <el-form-item :label="$t('postTo')" prop="access">
              <el-radio-group v-model="infoForm.access" class="ln-radio-group">
                <el-radio class="ln-radio" label="public" value="public">{{
                  $t("global")
                }}</el-radio>
                <el-radio class="ln-radio" label="private" value="private">{{
                  $t("private")
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="publish-form-item">
              <el-button
                round
                class="round-btn cancal"
                size="medium"
                @click="cancalPublish"
              >
                {{ $t("cancal") }}
              </el-button>
              <el-button
                round
                class="round-btn"
                size="medium"
                :loading="commiting"
                @click="submitForm"
              >
                {{ $t("publish") }}
              </el-button>
            </el-form-item>
          </el-form>
          <svg-icon
            class="preview-close"
            icon-class="close"
            @click="dialogVisible = false"
          ></svg-icon>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import FullPreview from "./FullPreview";
import { TaskItem } from "@/utils/Task";
import cookie from "@/utils/Cookie";

export default {
  data() {
    return {
      minVideoDuration: 6, // Seconds
      showPreview: false,
      dialogVisible: false,
      commiting: false,
      infoForm: {
        caption: "",
        hashtags: "",
        posters: null,
        access: "public",
        coverData: null
      },
      rules: {
        caption: [{ require: true, trigger: "blur" }]
      }
    };
  },
  components: {
    FullPreview
  },
  computed: {
    isEditPages() {
      const pages = ["Branding", "Music", "Scenes", "Styles"];
      return pages.includes(this.$route.name);
    },
    duration() {
      const duration = this.videos.reduce((res, item) => {
        if (item.media_type === "image") {
          res += 3000000;
        } else {
          res += item.duration;
        }
        return res;
      }, 0);
      return parseInt(duration / 1000000);
    },
    isProjectNotPublishable() {
      if (!this.videoProject) return false;
      const unPublishableState = ["published", "publish_pending", "compiled"];
      return unPublishableState.includes(this.videoProject.state);
    }
  },
  methods: {
    // 打开预览窗口
    preview() {
      this.showPreview = true;
    },
    // 关闭预览窗口
    close() {
      this.showPreview = false;
    },
    getCover() {
      const previewWindow = document.getElementById("preview-window");
      this.infoForm.coverData = previewWindow.toDataURL();
    },
    cancalPublish() {
      this.dialogVisible = false;
    },
    submitForm() {
      if (this.duration < this.minVideoDuration) return false;
      this.$refs["infoForm"].validate(valid => {
        if (!valid) return false;
        this.publish();
      });
    },
    async publish() {
      const channelId = cookie.get("channelId");
      this.commiting = true;
      try {
        const params = {
          access: this.infoForm.access,
          caption: this.infoForm.caption,
          hashtags: this.infoForm.hashtags.trim().split(","),
          video_posters: [],
          channel_id: channelId
        };
        const res = await this.axios.post(
          this.$api.videoProjectActionById("publish", this.$route.query.id),
          params
        );
        const progress_url = this.replaceStagingToSandBoxURL(res.progress_url);
        console.log(progress_url);
        this.$message({
          type: "info",
          message: "Video Compile In Progress..."
        });
        const options = {
          jobURL: progress_url,
          onSuccess: async r => {
            console.log("任务完成", r);
            this.taskFinish(r);
          },
          onError: e => {
            console.error("任务失败", e);
            this.$message({
              type: "error",
              message: "Video Compile Failed"
            });
          },
          onProgress: task => {
            this.$emit("publish-loading", task.progress);
          }
        };
        new TaskItem(options);
      } catch (error) {
        console.error("合成失败", error);
        this.$message({
          type: "error",
          message: "Video Compile Failed"
        });
      } finally {
        // Handle loading
        this.commiting = false;
        this.dialogVisible = false;
      }
    },
    // 测试 - 任务完成后的处理
    taskFinish(task) {
      console.log("taskFinish", task);
      task.result = "5mGkXz";
      const businessId = cookie.get("businessId");
      const channelId = cookie.get("channelId");
      // Navigate back to bizPortal
      window.location = this.$api.videoCreatedChannel(businessId, channelId);
    },
    handleBlur() {
      let strArr = this.infoForm.hashtags.split(",");
      if (strArr.length) {
        strArr = strArr.map(item => item.trim());
      }
      this.infoForm.hashtags = strArr.filter(Boolean).join(",");
    },
    replaceStagingToSandBoxURL(url) {
      return url.replace("//staging.", "//studio.sandbox.");
    },
    openDiablog() {
      this.dialogVisible = true;
      this.$bus.$emit(this.$keys.updateProject);
    }
  }
};
</script>

<style lang="scss">
.reconnection {
  padding: 0 !important;
  margin-left: 10px;
  color: #409eff !important;
  &:hover {
    color: #66b1ff !important;
  }
}
#title-bar {
  width: 100%;
  justify-content: space-between;
  .logo {
    width: 105px;
    height: 24px;
  }
  .round-btn {
    margin-left: 33px;
  }
  .el-breadcrumb__item {
    height: 15px;
    font-size: 16px;
    .el-breadcrumb__inner {
      color: $border-color;
      cursor: pointer;
      font-weight: 600;
    }
    &.current-path {
      .el-breadcrumb__inner {
        color: white;
      }
    }
    &.finish-path {
      .el-breadcrumb__inner {
        color: $active-color;
      }
    }
  }

  .publish-dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 3000;
    background-color: rgba($color: #000000, $alpha: 0.7);
    backdrop-filter: blur(10px);
    .publish-content {
      margin: 0 auto;
      margin-top: 20px;
      display: flex;
      background-color: $dialog-bgc;
      border-radius: 6px;
      align-items: center;
      height: 80%;
      width: 60%;
      min-width: 800px;
      position: relative;
      padding: 24px;
      .preview-close {
        position: absolute;
        right: -44px;
        top: 0;
        cursor: pointer;
        width: 1.5em;
        height: 1.5em;
      }
      .ln-form {
        height: 100%;
      }
      span.minor {
        color: $msg-font-color;
      }
    }
    .el-dialog__body {
      display: flex;
    }
    .preview-box {
      height: 100%;
      flex-grow: 0;
      margin-right: 30px;
    }
    .el-form {
      flex: 1;
      &.publish-form {
        display: flex;
        flex-direction: column;
        max-height: calc(100% - 100px);
        overflow-y: auto;
      }
    }
    .publish-form-item {
      position: absolute;
      right: 18px;
      bottom: 0;
    }
    .media-cover {
      width: 100%;
    }
    .form-poster {
      display: flex;
      flex-direction: column;
      .el-form-item__content {
        height: 100%;
      }
    }
    .cancal {
      background: $btn-bgc;
    }
    .posters {
      cursor: pointer;
      flex: 1;
      border: 1px dashed $main-bgc;
      background-color: $btn-bgc;
      border-radius: 6px;
      text-align: center;
      flex-direction: column;
      aspect-ratio: 9/16;
      color: $white;
      width: 115px;
      height: auto;
      i {
        font-size: 16px;
        // color: $white;
      }
    }
  }
  .full-preview {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 3000;
    background-color: rgba($color: #000000, $alpha: 0.7);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 40px 0;
    box-sizing: border-box;
    .preview-close {
      position: absolute;
      right: 22px;
      cursor: pointer;
    }
  }
}
.el-alert.publish-warning {
  overflow: unset;
}
</style>

<i18n>
{
  "en": {
    "preview":"Preview",
    "publish":"Publish",
    "create": "Create",
    "template": "Template",
    "sceneEditing": "Scene Editing",
    "post": "Post",
    "next": "Next",
    "caption":"Caption",
    "hashtags":"Hashtags",
    "posters":"Posters",
    "postTo":"Visibility",
    "global":"Global",
    "private":"Private",
    "hashtagHint":"Separate hashtag with commas (e.i Travel, Trip, Nomad)",
    "see": "See",
    "finish": "Video Compose Finish!",
    "running": "Video Compose Be In Progress...",
    "failed": "Video Compose Failed",
    "cancal": "Cancal",
    "posterMsg": "Add a new Poster"
  }
}
</i18n>
