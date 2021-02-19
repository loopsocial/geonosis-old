<template>
  <div class="draft-list">
    <div class="draft-list-container">
      <div
        :class="[
          'draft-list-item',
          currentVideoUuid === item.uuid ? 'onfocus' : ''
        ]"
        v-for="(item, index) in videos"
        :key="item.uuid"
        @click="selected(item)"
        :style="{
          background: `linear-gradient(
            180deg,
            rgba(0, 0, 0, 0) 0%,
            rgba(0, 0, 0, 0.3) 100%
          ),
          url('${item.coverUrl}') no-repeat center center/auto 100%`
        }"
      >
        <div class="order-number">{{ index + 1 }}</div>
        <div class="duration">{{ format(item.duration) }}</div>
        <transition name="el-fade-in-linear">
          <div
            class="operate-btns"
            v-if="currentVideoUuid === item.uuid"
            @click.stop
          >
            <div class="icon flex">
              <svg-icon
                class="cut-icon"
                icon-class="cut"
                @click="cut(item)"
              ></svg-icon>
            </div>
            <div class="icon flex">
              <svg-icon
                class="delete-icon"
                icon-class="trash"
                @click="del(index)"
              ></svg-icon>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="add-media-btn flex">
      <svg-icon class="add-icon" icon-class="plus"></svg-icon>
      <span class="add-text">{{ $t("addMedia") }}</span>
    </div>

    <el-dialog
      custom-class="ln-dialog"
      :visible.sync="dialogVisible"
      top="0"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      @close="handleClose"
      ref="dialog"
    >
      <h1>{{ $t("trimVideo") }}</h1>

      <div class="live-window"></div>

      <div class="clips-wrapper">
        <svg-icon
          @click="handlePlay"
          class="play-icon"
          icon-class="play-button"
        ></svg-icon>

        <div class="clip-list-container">
          <div class="clip-list" ref="clipList" :style="{ background }"></div>

          <div
            class="splitter-wrapper"
            :style="{ width: splitterWidth + 'px', left: splitterLeft + 'px' }"
          >
            <div class="vector" :style="{ left: vectorLeft }"></div>
            <div class="splitter-inner" @mousedown="handleSplitterMouseDown">
              <div class="slice-duration">{{ format(duration / 1000) }}</div>
              <div class="left-controller" @mousedown="handleLeftMouseDown">
                <svg-icon class="arrow-icon" icon-class="left-arrow"></svg-icon>
              </div>
              <div class="right-controller" @mousedown="handleRightMouseDown">
                <svg-icon
                  class="arrow-icon"
                  icon-class="right-arrow"
                ></svg-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer flex">
        <span>Total video duration {{ videoDuration | msFormat }}</span>
        <el-button @click="dialogVisible = false">{{ $t("cancel") }}</el-button>
        <el-button type="primary" @click="dialogVisible = false">{{
          $t("next")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { us2time } from "../../utils/common";
import { CLIP_TYPES } from "@/utils/Global";
export default {
  components: {
    // DraftListItem
  },
  props: {},
  data() {
    return {
      height: 0,
      dialogVisible: false,
      splitterWidth: 0, // 可计算用滑块宽度
      mouseStartX: 0, // 鼠标开始点
      splitterLeft: 0, // 滑块距离缩略图轨道左边距离
      splitterEndPercentage: 0, // 滑块右边占整个缩略图轨道比例，只用于滑块左边箭头拉动前计算
      vectorLeft: 0,
      item: null,
      background: "",
      duration: 0
    };
  },
  computed: {
    activeClip() {
      if (!this.currentVideoUuid) return;
      return this.videos.find(item => this.currentVideoUuid === item.uuid);
    },
    videoDuration() {
      if (!this.activeClip) return NaN;
      return this.activeClip.duration;
    }
  },
  mounted() {},
  methods: {
    handleResize() {},
    cut(item) {
      this.dialogVisible = true;
      this.item = item;
      this.$nextTick(this.getClipListImages);
    },
    del(index) {
      this.deleteClipToVuex({
        type: CLIP_TYPES.VIDEO,
        index
      });
      const i = Math.min(index, this.videos.length);
      this.currentVideoUuid = this.videos[i].uuid;
      this.$bus.$emit(this.$keys.deleteClip, CLIP_TYPES.VIDEO, index);
    },
    selected(item) {
      this.currentVideoUuid = item.uuid;
    },
    format(ms) {
      return us2time(ms * 1000);
    },
    handlePlay() {
      const durationOfOnePx =
        this.activeClip.duration / this.$refs.clipList.offsetWidth;
      console.log(durationOfOnePx.toFixed());
    },
    handleClose() {
      document.body.removeEventListener("mouseup", this.handleLeftMouseUp);
      document.body.removeEventListener("mouseup", this.handleRightMouseUp);
      document.body.removeEventListener("mouseup", this.handleSplitterMouseUp);
    },
    // 拼出缩略图
    getClipListImages() {
      const videoInfo = streamingContext.streamingContext.getAVFileInfo(
        this.activeClip.m3u8Path,
        0
      );
      const { width, height } = videoInfo.videoStreamInfo;
      const clipItemWidth = 30 * (width / height); // 每个缩略图宽度

      const containableItemNum = Math.floor(
        this.$refs.clipList.offsetWidth / clipItemWidth
      );
      const step = Math.floor(this.item.thumbnails.length / containableItemNum);
      let counter = 0;
      let bg = "";
      for (let i = 0; i < this.item.thumbnails.length; i++) {
        if (i % step === 0) {
          bg += `url("${this.item.thumbnails[i].url}") ${counter *
            clipItemWidth}px 0/${clipItemWidth}px 100% no-repeat,`;

          counter++;
        }
      }
      this.background = bg.substring(0, bg.length - 1);
      this.changeSplitterSize(1);
    },
    // 调整裁剪器大小
    changeSplitterSize(percentage) {
      this.splitterWidth = percentage * this.$refs.clipList.offsetWidth;
      this.duration = this.calcDuration();
    },
    handleLeftMouseDown(e) {
      e.stopPropagation();

      this.mouseStartX = e.clientX;
      document.body.addEventListener("mousemove", this.handleLeftMouseMove);
      document.body.addEventListener("mouseup", this.handleLeftMouseUp);
      this.splitterEndPercentage =
        (this.splitterWidth + this.splitterLeft) /
        this.$refs.clipList.offsetWidth;
    },
    handleLeftMouseMove(e) {
      e.preventDefault();

      const offsetX = e.clientX - this.mouseStartX;
      this.mouseStartX = e.clientX;
      this.splitterLeft += offsetX;
      this.splitterWidth -= offsetX;

      if (this.splitterWidth < 0) {
        // 往右拉动限制
        this.splitterWidth = 0;
        this.splitterLeft =
          this.splitterEndPercentage * this.$refs.clipList.offsetWidth;
      }

      if (this.splitterLeft < 0) {
        // 往左拉动限制
        this.splitterLeft = 0;
        this.splitterWidth = Math.floor(
          this.splitterEndPercentage * this.$refs.clipList.offsetWidth
        );
      }
      this.duration = this.calcDuration();
    },
    handleLeftMouseUp() {
      document.body.removeEventListener("mousemove", this.handleLeftMouseMove);

      this.getStartTime();
      this.getEndTime();
    },
    handleRightMouseDown(e) {
      e.stopPropagation();

      this.mouseStartX = e.clientX;
      document.body.addEventListener("mousemove", this.handleRightMouseMove);
      document.body.addEventListener("mouseup", this.handleRightMouseUp);
    },
    handleRightMouseMove(e) {
      e.preventDefault();

      const offsetX = e.clientX - this.mouseStartX;
      const { clipList } = this.$refs;
      this.mouseStartX = e.clientX;
      this.splitterWidth += offsetX;
      if (this.splitterWidth + this.splitterLeft > clipList.offsetWidth) {
        this.splitterWidth = clipList.offsetWidth - this.splitterLeft;
      }
      if (this.splitterWidth < 0) {
        this.splitterWidth = 0;
      }
      this.duration = this.calcDuration();
    },
    handleRightMouseUp() {
      document.body.removeEventListener("mousemove", this.handleRightMouseMove);

      this.getStartTime();
      this.getEndTime();
    },
    handleSplitterMouseDown(e) {
      e.stopPropagation();
      this.mouseStartX = e.clientX;
      document.body.addEventListener("mousemove", this.handleSplitterMouseMove);
      document.body.addEventListener("mouseup", this.handleSplitterMouseUp);
    },
    handleSplitterMouseMove(e) {
      e.preventDefault();

      const offsetX = e.clientX - this.mouseStartX;
      const { clipList } = this.$refs;

      this.mouseStartX = e.clientX;
      this.splitterLeft += offsetX;
      if (this.splitterLeft < 0) {
        this.splitterLeft = 0;
      }
      if (this.splitterLeft + this.splitterWidth > clipList.offsetWidth) {
        this.splitterLeft = clipList.offsetWidth - this.splitterWidth;
      }
      this.duration = this.calcDuration();
    },
    calcDuration() {
      return this.getEndTime() - this.getStartTime();
    },
    getStartTime() {
      const startPercentage =
        this.splitterLeft / this.$refs.clipList.offsetWidth;
      const startTime = startPercentage * this.activeClip.duration * 1000;
      return parseInt(startTime.toFixed());
    },
    getEndTime() {
      const endPercentage =
        (this.splitterLeft + this.splitterWidth) /
        this.$refs.clipList.offsetWidth;
      const endTime = endPercentage * this.activeClip.duration * 1000;
      return parseInt(endTime.toFixed());
    },
    handleSplitterMouseUp() {
      document.body.removeEventListener(
        "mousemove",
        this.handleSplitterMouseMove
      );
    }
  },
  beforeDestroy() {
    this.handleClose();
  }
};
</script>

<style lang="scss" scoped>
$infoBgc: rgba(0, 0, 0, 0.5);
$white: #fff;
.draft-list {
  min-width: 111px;
  height: 100%;
  position: relative;
  /* Hide scrollbar for Chrome, Safari and Opera */
  .draft-list-container {
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    position: relative;
    height: 100%;
    width: 100%;
    border-radius: 12px;
    overflow-y: auto;
    padding: 16px;
    box-sizing: border-box;
    .draft-list-item {
      position: relative;
      height: 180px;
      width: 180px;
      border: 2px solid transparent;
      border-radius: 6px;
      transition: 0.3s;
      .order-number {
        position: absolute;
        top: 6px;
        left: 4px;
        width: 2em;
        height: 2em;
        line-height: 2em;
        text-align: center;
        background-color: $infoBgc;
        border-radius: 50%;
        color: $white;
        font-size: 14px;
      }
      .duration {
        position: absolute;
        right: 4px;
        top: 6px;
        padding: 4px 8px;
        background-color: $infoBgc;
        border-radius: 6px;
        color: $white;
        font-size: 14px;
      }
      .operate-btns {
        position: absolute;
        bottom: 10px;
        width: 100%;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 15px;
        box-sizing: border-box;
        .icon {
          border-radius: 50%;
          height: 40px;
          width: 40px;
          transition: all 0.3s;
          cursor: pointer;
          &:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }
        }
      }
      .cut-icon {
        bottom: 10px;
        left: 10px;
        width: 100%;
        height: 100%;
      }
      .delete-icon {
        bottom: 10px;
        right: 10px;
        width: 100%;
        height: 100%;
      }
    }
    .draft-list-item + .draft-list-item {
      margin-top: 12px;
    }
    .onfocus {
      border-color: $white;
    }
  }

  .add-media-btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 12px;
    width: calc(100% - 32px);
    height: 44px;
    border-radius: 6px;
    background-color: #474747;
    line-height: 46px;
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 0 30px #000000;
    .add-icon {
      display: inline-block;
      height: 24px;
      width: 24px;
      text-align: center;
      vertical-align: middle;
      margin-right: 8px;
    }
    .add-text {
      margin-right: 6%;
      font-size: 14px;
      color: $white;
      user-select: none;
    }
  }
}
::v-deep.el-dialog__wrapper{
  .el-dialog{
  width: 600px;
  height: 560px;
  }
}
.ln-dialog {

  .live-window {
    height: 276px;
    height: 360px;
  }
  h1 {
    color: $white;
    margin: 0;
    text-align: center;
    font-weight: 500;
  }

  .dialog-footer {
    text-align: left;

    color: #fff;

    span {
      flex: 10;
    }
  }

  .play-icon {
    margin-right: 6px;
    height: 30px;
    width: 30px;
    vertical-align: 0;
  }
  .clip-list-container {
    display: inline-block;
    position: relative;
    height: 30px;

    .clip-list {
      display: inline-block;
      margin-left: 18px;
      width: 500px;
      height: 100%;
      border-radius: 6px;
    }
  }
  .splitter-wrapper {
    left: 0;
    top: -5px;
    position: absolute;
    width: 507px;
    height: 30px;
    border: 5px solid #fff;
    border-left: 18px solid #fff;
    border-right: 18px solid #fff;
    border-radius: 6px;
    .vector {
      position: absolute;
      height: 40px;
      width: 0;
      transform: translateY(-6px);
      border: 1px solid #fff;
    }
    .splitter-inner {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      background-color: transparent;
      position: absolute;
      left: -5px;
      top: -5px;
      border: 5px solid #fff;

      .slice-duration {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 2px;
        background-color: rgba(0, 0, 0, 0.5);
        border-radius: 6px;
        font-size: 14px;
        color: #fff;
        white-space: nowrap;
        user-select: none;
        cursor: default;
      }
      .left-controller {
        position: absolute;
        left: -15px;
        top: 50%;
        transform: translateY(-50%);
      }
      .right-controller {
        position: absolute;
        right: -15px;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
</style>

<i18n>
{
  "en": {
    "addMedia": "Add Media",
    "trimVideo":"Trim Video",
    "next": "Next",
    "cancel": "Cancel"
  }
}
</i18n>
