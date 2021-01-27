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
    <el-tabs v-model="activeName" class="ln-tabs-body">
      <el-tab-pane :label="$t('upload')" name="upload" class="meida-container">
        <div class="empty flex" v-if="uploadList.length === 0 && !loading">
          {{ $t("msg") }}
        </div>
        <div class="media-list">
          <MediaItem
            v-for="media in uploadList"
            :key="media.id"
            :media="media"
            ref="mediaItem"
            :playing-id="playingId"
            :item-hieght="itemHieght"
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
              :item-hieght="itemHieght"
              @click.native="selectedMedia(media)"
            ></MediaItem>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-divider></el-divider>
    <div class="media-footage flex">
      <div class="selected-medias">
        <img
          :src="item.coverUrl"
          srcset=""
          v-for="item in selectedList"
          :key="item.id"
        />
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
        >
          {{ $t("next") }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import MediaItem from "./MediaItem";
const pageSize = 20;
export default {
  components: {
    MediaItem
  },
  data() {
    return {
      activeName: "upload",
      uploadList: [], // 已上传的列表
      uploadTotal: 0,
      uploadPage: 1,
      libraryTotal: 0,
      libraryPage: 0,
      libraryList: [], // 素材库
      itemHieght: 0,
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
      await this.getMediaFromLibrary();
      await this.$nextTick();
      this.resize();
      window.addEventListener("resize", this.resize);
      this.$once("hook:beforeDestroy", () => {
        window.removeEventListener("resize", this.resize);
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
        if (item.type === "image") {
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
    resize() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        const ref = this.$refs.mediaItem[0];
        if (ref) {
          this.itemHieght = (ref.$el.offsetWidth / 9) * 16;
        }
        this.timer = null;
      }, 300);
    },
    beforeUpload(file) {
      console.log(file);
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
    cancel() {
      this.uploadList.map(item => {
        item.selected = false;
      });
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
      return this.axios
        .get(this.$api.uploadList, {
          params: {
            pageNum: this.uploadPage,
            pageSize
          }
        })
        .then(res => {
          const { total, rows } = res.data;
          this.uploadTotal = total;
          rows.map(item => {
            item.selected = false;
          });
          this.uploadList.push(...rows);
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
        .get(this.$api.libraryList, {
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
    }
  }
};
</script>
<style lang="scss">
@media screen and (max-width: 1600px) {
  .media-list {
    grid-template-columns: repeat(6, 1fr) !important;
  }
}
@media screen and (max-width: 1300px) {
  .media-list {
    grid-template-columns: repeat(5, 1fr) !important;
  }
}
@media screen and (max-width: 1000px) {
  .media-list {
    grid-template-columns: repeat(4, 1fr) !important;
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
      img {
        height: 100%;
        width: 42px;
        height: 42px;
        border-radius: 4px;
      }
      img + img {
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
    "gif": "Gif"
  }
}
</i18n>
