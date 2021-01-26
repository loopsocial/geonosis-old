<template>
  <div class="media-content">
    <el-upload
      class="ln-upload"
      action="/"
      multiple
      :show-file-list="false"
      accept="image/*, video/*"
      :before-upload="beforeUpload"
    >
      <el-button round size="small" type="text" class="upload-btn">
        <svg-icon icon-class="camera" class="icon-camera"></svg-icon>
        <span>{{ $t("upload") }}</span>
      </el-button>
    </el-upload>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="ln-tabs-body">
      <el-tab-pane :label="$t('upload')" name="upload">
        <div class="empty flex">{{ $t("msg") }}</div>
      </el-tab-pane>
      <el-tab-pane :label="$t('library')" name="library"> </el-tab-pane>
    </el-tabs>

    <div class="media-footage flex">
      <div class="selected-medias"></div>
      <div class="media-btns">
        <el-button type="text" size="medium">{{ $t("cancel") }}</el-button>
        <el-button round class="round-btn" :disabled="true" size="medium">
          {{ $t("next") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeName: "upload"
    };
  },
  methods: {
    handleClick(val) {
      console.log(val);
    },
    beforeUpload(file) {
      console.log(file);
      return false;
    }
  }
};
</script>
<style lang="scss">
.media-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  .ln-upload {
    z-index: 10;
    position: absolute;
    top: 0;
    right: 0;
    .upload-btn {
      padding: 6px 18px 6px 6px;
      background-color: $btn-bgc;
      span {
        color: white;
        font-size: 15px;
        font-weight: 500;
      }
      .icon-camera {
        width: 22px;
        height: 18px;
        margin-right: 12px;
      }
    }
  }
  .ln-tabs-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    .el-tabs__content {
      flex: 1;
      .el-tab-pane {
        height: 100%;
      }
    }
    .empty {
      color: $msg-font-color;
      height: 100%;
    }
  }
  .media-footage {
    .selected-medias {
      flex: 1;
    }
    .media-btns {
      button + button {
        margin-left: 24px;
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "upload": "Upload",
    "library": "Library",
    "next": "Next",
    "cancel": "Cancel",
    "msg": "Your uploads will appear here"
  }
}
</i18n>
