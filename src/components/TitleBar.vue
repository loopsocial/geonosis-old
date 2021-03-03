<template>
  <div class="flex" id="title-bar">
    <svg-icon class="logo" icon-class="logo"></svg-icon>
    <div class="btn">
      <el-button type="text" size="medium" @click="preview">
        {{ $t("preview") }}
      </el-button>
      <el-button
        round
        class="round-btn"
        size="medium"
        @click="dialogVisible = true"
      >
        {{ $t("publish") }}
      </el-button>
    </div>

    <transition name="el-fade-in">
      <div class="full-preview" v-if="showPreview">
        <FullPreview class="preview-box"></FullPreview>
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
          <el-form :model="infoForm" class="ln-form">
            <el-form-item :label="$t('caption')" prop="caption">
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
            <el-form-item :label="$t('posters')" prop="posters">
              <div class="posters"></div>
            </el-form-item>
            <el-form-item :label="$t('postTo')" prop="postTo">
              <el-radio-group v-model="infoForm.postTo" class="ln-radio-group">
                <el-radio class="ln-radio" label="global">{{
                  $t("global")
                }}</el-radio>
                <el-radio class="ln-radio" label="private">{{
                  $t("private")
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item class="publish-form-item">
              <el-button
                round
                class="round-btn"
                size="medium"
                @click="handlePublish"
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
import { writeXml } from "../utils/XmlUtils";
export default {
  data() {
    return {
      showPreview: false,
      dialogVisible: false,
      infoForm: {
        caption: "",
        hashtags: "",
        posters: null,
        postTo: "global"
      }
    };
  },
  components: {
    FullPreview
  },
  computed: {},
  methods: {
    preview() {
      this.showPreview = true;
    },
    close() {
      this.showPreview = false;
    },
    handlePublish() {
      this.dialogVisible = false;
      writeXml("project.xml");
      console.log(FS.readFile("project.xml", { encoding: "utf8" }));
    },
    handleBlur() {
      let strArr = this.infoForm.hashtags.split(",");
      if (strArr.length) {
        strArr = strArr.map(item => item.trim());
      }
      this.infoForm.hashtags = strArr.filter(Boolean).join(",");
    }
  }
};
</script>

<style lang="scss">
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
      width: 80%;
      position: relative;
      padding: 24px;
      .preview-close {
        position: absolute;
        right: -44px;
        top: 0;
        cursor: pointer;
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
    }
    .publish-form-item {
      position: absolute;
      right: 18px;
      bottom: 0;
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
</style>

<i18n>
{
  "en": {
    "preview":"Preivew",
    "publish":"Publish",
    "create": "Create",
    "template": "Template",
    "sceneEditing": "Scene Editing",
    "post": "Post",
    "next": "Next",
    "caption":"Caption",
    "hashtags":"Hashtags",
    "posters":"Posters",
    "postTo":"Post To",
    "global":"Global",
    "private":"Private",
    "hashtagHint":"Separate hashtag with commas (e.i Travel, Trip, Nomad)"
  }
}
</i18n>
