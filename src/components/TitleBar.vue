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
      <FullPreview
        v-if="showPreview"
        class="preview-box"
        @close="close"
      ></FullPreview>
    </transition>

    <el-dialog
      top="0"
      custom-class="ln-dialog"
      width="70%"
      center
      :visible.sync="dialogVisible"
    >
      <div class="live-window"></div>
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
          <span>{{ $t("hashtagHint") }}</span>
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
    </el-dialog>
  </div>
</template>

<script>
import FullPreview from "./FullPreview";
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

  .ln-dialog {
    height: 653px;

    .el-dialog__body {
      display: flex;
    }
    .live-window {
      height: 100%;
      width: 300px;
      flex-grow: 0;
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
