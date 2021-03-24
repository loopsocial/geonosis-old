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
      <el-button
        round
        size="small"
        type="text"
        class="upload-btn"
        ref="uploadBtn"
      >
        <svg-icon icon-class="camera" class="icon-camera"></svg-icon>
        <span>{{ $t("upload") }}</span>
      </el-button>
    </el-upload>
    <el-tabs v-model="activeName" class="ln-tabs-body">
      <el-tab-pane :label="$t('upload')" name="upload" class="meida-container">
        <div class="empty flex" v-if="uploadList.length === 0 && !loading">
          {{ $t("msg") }}
        </div>
        <div class="media-list">
          <UploadItem @openUploader="openUploader"> </UploadItem>
          <MediaItem
            v-for="media in uploadList"
            :key="media.id"
            :media="media"
            ref="mediaItem"
            :playing-id="playingId"
            @click.native="selectedMedia(media)"
            @play="play"
          ></MediaItem>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('library')" name="library">
        <div class="library-controls">
          <el-input
            :placeholder="$t('search')"
            v-model="searchVal"
            autocomplete="on"
            class="search-input"
            clearable
            prefix-icon="el-icon-search"
            size="medium"
            @keyup.native.enter="search"
          >
          </el-input>
          <el-checkbox-group
            v-model="checkedList"
            class="check-group flex"
            :min="1"
          >
            <el-checkbox
              :label="item.value"
              v-for="item in typeList"
              :key="item.value"
            >
              {{ item.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="meida-container library">
          <div class="media-list">
            <MediaItem
              v-for="media in libraryList"
              :key="media.id"
              :media="media"
              :playing-id="playingId"
              @play="play"
              ref="mediaItem"
              @click.native="selectedMedia(media)"
            ></MediaItem>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-divider></el-divider>
    <div class="media-footage flex">
      <div class="selected-medias">
        <transition-group name="el-zoom-in-center">
          <el-image
            :src="getThumbnailUrl(item)"
            fit="cover"
            class="thumb"
            :key="item.id"
            v-for="item in selectedList"
          ></el-image>
        </transition-group>
      </div>
      <div class="duration-total" v-if="selectedList.length">
        {{ durationTotal }}s
        {{ $t("total") }}
      </div>
      <div class="media-btns">
        <el-button type="text" size="medium" @click="cancel">{{
          $t("cancel")
        }}</el-button>
        <el-button
          round
          class="round-btn"
          :disabled="selectedList.length === 0"
          size="medium"
          :loading="addMediaLoading"
          @click="next"
        >
          {{ $t("next") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import UploadItem from "./UploadItem";
import MediaItem from "./MediaItem";
import { MEDIA_TYPES } from "@/utils/Global";
import { installAsset } from "@/utils/AssetsUtils";
import { VideoClip } from "@/utils/ProjectData";

const cloneDeep = require("clone-deep");

const pageSize = 20;
export default {
  components: {
    MediaItem,
    UploadItem
  },
  data() {
    return {
      activeName: "upload",
      addMediaLoading: false,
      uploadList: [], // 已上传的列表
      uploadTotal: 0,
      uploadPage: 0,
      libraryTotal: 0,
      libraryPage: 0,
      libraryList: [], // 素材库
      loading: false,
      searchVal: "", // 搜索
      typeList: [
        { label: this.$t("image"), value: "image" },
        { label: this.$t("video"), value: "video" },
        { label: this.$t("gif"), value: "gif" }
      ],
      checkedList: ["image", "video", "gif"],
      selectedList: [], // 选中的素材列表, 有顺序
      playingId: null // 正在播放的素材id
    };
  },
  async created() {
    try {
      await this.getMediaFromUpload();
      // await this.getMediaFromLibrary();
      this.selectedList = cloneDeep(this.videos);
      this.uploadList.map(item => {
        if (this.videos.find(i => i.id === item.id)) {
          item.selected = true;
        }
      });
    } catch (error) {
      console.error("请求数据失败", error);
    }
  },
  mounted() {
    // 无线滚动
    const doms = document.querySelectorAll(".ln-tabs-body .media-list");
    if (doms && doms.length) {
      doms.forEach(d => {
        d.addEventListener("scroll", this.loadMore);
        this.$once("hook:beforeDestroy", () => {
          d.removeEventListener("scroll", this.loadMore);
        });
      });
    }
  },
  watch: {
    checkedList() {
      this.search();
    }
  },
  computed: {
    durationTotal() {
      const duration = this.selectedList.reduce((res, item) => {
        if (item.media_type === "image") {
          res += 3000;
        } else {
          res += item.duration;
        }
        return res;
      }, 0);
      return parseInt(duration / 1000);
    }
  },
  methods: {
    play(id) {
      this.playingId = id;
    },
    loadMore(e) {
      const { target } = e;
      if (target.scrollTop >= target.scrollHeight - target.clientHeight - 20) {
        if (this.activeName === "upload") {
          if (this.uploadTotal > this.uploadList.length) {
            this.uploadPage++;
            this.getMediaFromUpload();
          }
        } else if (this.activeName === "library") {
          if (this.libraryTotal > this.libraryList.length) {
            this.libraryPage++;
            this.getMediaFromLibrary();
          }
        }
      }
    },
    async beforeUpload(file) {
      console.log(file);
      // Upload to S3
      const uploadToS3Res = await this.uploadToS3(file);
      console.log(uploadToS3Res.media_asset_id);
      // Notity server that upload is completed
      await this.axios.put(
        this.$api.mediaAssetsUploadComplete(uploadToS3Res.media_asset_id)
      );
      return false;
    },
    selectedMedia(media) {
      media.selected = !media.selected;
      if (media.selected) {
        this.selectedList.push(media);
      } else {
        const index = this.selectedList.findIndex(m => m.id === media.id);
        this.selectedList.splice(index, 1);
      }
    },
    async next() {
      this.playingId = null;
      const videos = [];
      this.addMediaLoading = true;
      videos.push(...this.selectedList.map(media => media.id));
      try {
        const videoProject = await this.axios.post(this.$api.videoProjects, {
          media_asset_ids: videos
        });
        this.$emit("selected-finish", videoProject);
      } catch (error) {
        this.$message({
          type: "error",
          message: this.$t("failed")
        });
        console.error("操作失败", error);
      } finally {
        this.addMediaLoading = false;
      }
    },
    cancel() {
      this.uploadList.map(item => {
        item.selected = false;
      });
      this.selectedList = [];
      this.playingId = null;
      this.$emit("cancel");
    },
    search() {
      this.libraryPage = 1;
      this.libraryList = [];
      this.getMediaFromLibrary();
    },
    getMediaFromUpload() {
      if (this.loading) return;
      this.loading = true;
      return this.axios.get(this.$api.mediaAssets).then(res => {
        const { media_assets } = res;
        this.uploadTotal = media_assets.length;
        media_assets.map(item => {
          item.selected = false;
          item.type = MEDIA_TYPES[item.mediaType];
          item.duration = item.duration * 1000;
          item.orgDuration = item.duration * 1000;
        });
        this.uploadList.push(...media_assets);
        this.loading = false;
      });
    },
    getMediaFromLibrary() {
      if (this.loading) return;
      this.loading = true;
      const params = {
        pageNum: this.libraryPage,
        pageSize,
        keyWord: this.searchVal,
        types: this.checkedList
      };
      return this.axios
        .get(this.$api.resources, {
          params
        })
        .then(res => {
          this.loading = false;
          const { total, rows } = res.data;
          rows.map(item => {
            item.selected = false;
          });
          this.libraryTotal = total;
          this.libraryList.push(...rows);
        });
    },
    openUploader() {
      this.$refs.uploadBtn.$el.click();
    },
    isFileTypeImage(file) {
      return file.type.startsWith("image");
    },
    isFileTypeVideo(file) {
      return file.type.startsWith("video");
    },
    async getSignature(file) {
      const payload = {};
      if (this.isFileTypeImage(file)) {
        payload.image = { filename: file.name, mime_type: file.type };
      }
      if (this.isFileTypeVideo(file)) {
        payload.video = { filename: file.name, mime_type: file.type };
      }
      return await this.axios.post(this.$api.mediaAssets, payload);
    },
    async uploadToS3(file, onProgress = () => {}) {
      return new Promise((resolve, reject) => {
        try {
          this.getSignature(file).then(response => {
            let signature = null;
            if (response.image_signature !== null) {
              signature = response.image_signature;
            } else if (response.video_signature !== null) {
              signature = response.video_signature;
            }
            const xhr = new global.XMLHttpRequest();
            xhr.open("PUT", signature.put_url);
            xhr.setRequestHeader("Content-Type", file.type);

            xhr.upload.onprogress = event => {
              const progress = Math.round((event.loaded * 100) / event.total);
              onProgress(progress);
            };

            xhr.onload = () => {
              if (xhr.status !== 200) {
                return reject(xhr);
              }
              resolve({
                media_asset_id: response.media_asset.id,
                key: signature.key,
                url: `${signature.action}/${signature.key}`
              });
            };
            xhr.onerror = () => reject(xhr);
            xhr.send(file);
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    getThumbnailUrl(item) {
      return item.thumbnail_url || item.coverUrl;
    }
  }
};
</script>
<style lang="scss">
@media screen and (max-width: 1600px) {
  .media-list {
    grid-template-columns: repeat(5, 1fr) !important;
  }
}
@media screen and (max-width: 1300px) {
  .media-list {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
@media screen and (max-width: 1000px) {
  .media-list {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}

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
    display: flex;
    flex-direction: column;
    height: 0;
    .el-tabs__content {
      flex: 1;
      .el-tab-pane {
        height: 100%;
      }
      .meida-container {
        .media-list {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 20px 10px;
          height: 100%;
          overflow: auto;
          @include scrollBarStyle;
        }
        &.library {
          height: calc(100% - 52px);
        }
      }
      .library-controls {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        justify-content: space-between;
        .check-group {
          .el-checkbox__input {
            &.is-checked,
            &.is-focus,
            &.is-indeterminate {
              .el-checkbox__inner {
                background-color: white;
                border-color: white;
              }
            }
            & + .el-checkbox__label {
              color: white;
            }
            &.is-checked .el-checkbox__inner::after {
              border-color: $btn-bgc;
            }
            &.is-disabled + span.el-checkbox__label {
              color: #606266;
            }
          }
          .el-checkbox__inner {
            &:hover {
              border-color: $btn-bgc;
            }
          }
        }
        .search-input {
          max-width: 350px;
          input {
            background-color: $btn-bgc;
            border-radius: 18px;
            border-width: 0;
          }
        }
      }
    }
    .empty {
      color: $msg-font-color;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
  .el-divider {
    background-color: $border-color;
  }
  .media-footage {
    height: 46px;
    .selected-medias {
      flex: 1;
      white-space: nowrap;
      overflow: auto;
      @include scrollBarStyle;
      margin-right: 16px;
      .thumb {
        height: 100%;
        width: 42px;
        height: 42px;
        border-radius: 4px;
      }
      .thumb + .thumb {
        margin-left: 8px;
      }
    }
    .duration-total {
      color: white;
      font-size: 12px;
    }
    .media-btns {
      button {
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
    "msg": "Your uploads will appear here",
    "total": "Total",
    "search": "Enter keyword search",
    "image": "Image",
    "video": "Video",
    "gif": "Gif",
    "failed": "Operation Failed"
  }
}
</i18n>
