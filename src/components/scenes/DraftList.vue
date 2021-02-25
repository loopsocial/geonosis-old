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
      ref="dialog"
    >
      <template #title>
        <h1>{{ $t("trimVideo") }}</h1>
      </template>

      <div
        class="live-window-wrapper"
        v-loading="waiting"
        element-loading-background="rgba(0, 0, 0, 0)"
      >
        <div class="undo-btn inline-block">
          <svg-icon
            @click="handleRedo"
            class="icon"
            icon-class="redo"
          ></svg-icon>
          <svg-icon
            @click="handleUndo"
            class="icon"
            icon-class="undo"
          ></svg-icon>
        </div>

        <canvas
          width="540"
          height="960"
          class="live-window inline-block"
          id="trim-window"
        ></canvas>

        <div
          @click="handleSplit"
          class="split-btn inline-block"
          :style="{ visibility: isImage ? 'hidden' : 'visible' }"
        >
          <svg-icon class="split-icon" icon-class="split"></svg-icon>
          <span>{{ $t("split") }}</span>
        </div>
      </div>

      <!-- 图片时长设置 -->
      <div class="duration-input flex margin-top-10" v-if="isImage">
        <svg-icon
          @click="handleImageDurationPlus"
          class="duration-modify-icon"
          icon-class="plus"
        ></svg-icon>
        <span class="white">{{ format(imageDuration) }}</span>
        <svg-icon
          @click="handleImageDurationMinus"
          class="duration-modify-icon"
          icon-class="minus"
        ></svg-icon>
      </div>
      <!-- 缩略图 -->
      <div class="clips-wrapper margin-top-20" v-else>
        <svg-icon
          @click="handlePlay"
          class="play-icon"
          :icon-class="!isPlaying ? 'play-button' : 'pause'"
        ></svg-icon>
        <div class="clip-list-container">
          <div class="clip-list-full" ref="clipList">
            <div
              class="clip-list"
              :style="{
                background: backgroundCover
                  ? 'linear-gradient(to right, ' +
                    backgroundCover +
                    '),' +
                    background
                  : background
              }"
            >
              <!-- <div class="vector" :style="{ left: vectorLeft + 'px' }"></div> -->
            </div>
            <div class="clip-item-container" @click="handleClipClick">
              <div
                class="clip-item"
                v-for="(clip, idx) of activeClip.splitList"
                :style="{
                  width:
                    calcSplittedItemWidth(clip.trimIn, clip.trimOut) * 100 + '%'
                }"
                :data-index="idx"
                :key="clip.id"
              ></div>
            </div>

            <div
              class="capture-wrapper"
              :style="{
                width: captureWidth * 100 + '%',
                left: captureLeft * 100 + '%'
              }"
              v-if="activeIndex != -1"
              ref="capture"
            >
              <div class="capture-inner" @mousedown="handleCaptureMouseDown">
                <div class="slice-duration">{{ format(duration) }}</div>
                <div class="left-controller" @mousedown="handleLeftMouseDown">
                  <svg-icon
                    class="arrow-icon"
                    icon-class="left-arrow"
                  ></svg-icon>
                </div>
                <div class="right-controller" @mousedown="handleRightMouseDown">
                  <svg-icon
                    class="arrow-icon"
                    icon-class="right-arrow"
                  ></svg-icon>
                </div>
                <!-- <div class="background" :style="{ backgroundPosition }">
                  <div class="background-inner" :style="{ background }"></div>
                </div> -->
              </div>
            </div>

            <div
              class="splitter"
              :style="{ left: splittreLeft * 100 + '%' }"
              @mousedown="handleSplitterMouseDown"
            ></div>
          </div>
        </div>
      </div>

      <span slot="footer" class="dialog-footer flex">
        <span>{{ $t("totalVideoDuration") }} {{ format(totalDuration) }}</span>
        <el-button
          class="round-btn white-btn"
          :style="{ background: '#2B2B2B' }"
          @click="dialogVisible = false"
          >{{ $t("cancel") }}</el-button
        >
        <el-button class="round-btn" type="primary" @click="handleNext">{{
          $t("next")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { us2time } from "../../utils/common";
import { CLIP_TYPES } from "@/utils/Global";
import TimelineClass from "../../utils/TimelineClass";

export default {
  components: {
    // DraftListItem
  },
  props: {},
  data() {
    return {
      // clipList: [
      //   {
      //     id: (Math.random() * 100).toFixed(),
      //     width: 1,
      //     trimIn: 0,
      //     trimOut: 15000000,
      //     captureIn: 0,
      //     captureOut: 15000000
      //   }
      // ],
      height: 0,
      dialogVisible: false,
      captureWidth: 0, // 可计算用滑块宽度
      mouseStartX: 0, // 鼠标开始点
      captureLeft: 0, // 滑块距离缩略图轨道左边距离
      captureEndPercentage: 0, // 滑块右边占整个缩略图轨道比例，只用于滑块左边箭头拉动前计算
      vectorLeft: 0,
      splittreLeft: 0,
      item: null,
      background: "",
      duration: 0,
      isPlaying: false,
      waiting: false,
      imageDuration: 0,
      mousePos: 0,
      backgroundPosition: 0,
      activeIndex: -1, // 当前被选中的被分割的片段
      backgroundCover: ""
      // "rgba(100,100,100,.7) 100px, transparent 0, transparent 88%, rgba(100,100,100,.7) 0"
    };
  },
  computed: {
    // 当前选中被编辑的视频
    activeClip() {
      if (!this.currentVideoUuid) return [];
      return this.videos.find(item => this.currentVideoUuid === item.uuid);
    },

    isImage() {
      return this.activeClip && this.activeClip.videoType === CLIP_TYPES.IMAGE;
    },
    videoDuration() {
      if (!this.activeClip) return NaN;
      return this.activeClip.duration;
    },
    totalDuration() {
      if (!this.videos.length) return NaN;
      return this.videos.reduce((prev, cur) => prev + cur.duration, 0);
    }
  },
  mounted() {
    document.body.addEventListener("mousedown", this.handleDocumentClick);
  },
  methods: {
    calcSplittedItemWidth(startTime, endTime) {
      const { activeClip } = this;
      return (
        endTime / activeClip.orgDuration - startTime / activeClip.orgDuration
      );
    },
    refreshBackgroundCover() {
      this.backgroundCover = "";
      this.activeClip.splitList.forEach(item => {
        const captureStartPoint = item.captureIn / this.activeClip.orgDuration;
        const captureEndPoint = item.captureOut / this.activeClip.orgDuration;
        const trimOutPoint = item.trimOut / this.activeClip.orgDuration;
        this.backgroundCover +=
          "rgba(100,100,100,.7) " +
          captureStartPoint * 100 +
          "% , transparent " +
          captureStartPoint * 100 +
          "% , transparent " +
          captureEndPoint * 100 +
          "%, rgba(100,100,100,.7) " +
          captureEndPoint * 100 +
          "%, rgba(100,100,100,.7) " +
          trimOutPoint * 100 +
          "%,";
      });
      this.backgroundCover = this.backgroundCover.substring(
        0,
        this.backgroundCover.length - 1
      );
    },
    handleDocumentClick(e) {
      e.stopPropagation();
      const isOnClipList = e.path.find(item => item === this.$refs.clipList);
      if (isOnClipList) return;
      this.activeIndex = -1;
    },
    handleSplitterMouseDown() {
      addEventListener("mousemove", this.handleSplitterMouseMove);
    },
    handleSplitterMouseMove(e) {
      const { clipList } = this.$refs;

      e.preventDefault();
      this.splittreLeft =
        (e.clientX - clipList.getBoundingClientRect().left) /
        clipList.offsetWidth;

      if (this.splittreLeft < 0) {
        // 处理左拖拽限制
        this.splittreLeft = 0;
      }
      if (this.splittreLeft > 1) {
        // 处理右侧拖拽限制
        this.splittreLeft = 1;
      }

      const currentSeekTime = this.splittreLeft * this.activeClip.orgDuration;
      this.trimTimeline.seekTimeline(currentSeekTime);

      addEventListener("mouseup", this.handleSplitterMouseUp);
    },
    handleSplitterMouseUp(e) {
      e.stopPropagation();

      removeEventListener("mousemove", this.handleSplitterMouseMove);
    },

    handleSplit() {
      const splitterPercentage = this.splittreLeft;
      const trimTime = splitterPercentage * this.activeClip.orgDuration;
      let splitedArr = [];
      this.activeClip.splitList.reduce((prev, cur, curIdx, arr) => {
        const curWidth = this.calcSplittedItemWidth(cur.trimIn, cur.trimOut);
        if (splitterPercentage < curWidth + prev && splitterPercentage > prev) {
          // 一分为二
          splitedArr = [
            {
              trimIn: cur.trimIn,
              trimOut: trimTime,
              captureIn: cur.trimIn,
              captureOut: trimTime
            },
            {
              trimIn: trimTime,
              trimOut: cur.trimOut,
              captureIn: trimTime,
              captureOut: cur.trimOut
            }
          ];
          arr.splice(curIdx, 1, ...splitedArr);
        }
        return prev + curWidth;
      }, 0);
      this.refreshBackgroundCover();
    },

    handleImageDurationPlus() {
      this.imageDuration += 1000;
    },
    handleImageDurationMinus() {
      this.imageDuration -= 1000;
      if (this.imageDuration < 0) {
        this.imageDuration = 0;
      }
    },
    handlePlaying(timeline, currentTime) {
      this.vectorLeft =
        this.calcCurrentPercentage(currentTime) * this.captureWidth;
    },
    resetVector() {
      this.vectorLeft = this.captureLeft;
      this.trimTimeline.seekTimeline(this.getStartTime());
    },
    handleResize() {},
    handleNext() {
      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      this.activeClip.trimIn = startTime;
      this.activeClip.trimOut = endTime;
      this.activeClip.duration = endTime - startTime;
      this.dialogVisible = false;
      console.log("sss", this.clipList);
      this.$bus.$emit(this.$keys.afreshVideoClip, this.activeClip);
    },
    // 视频裁剪
    cut(item) {
      this.dialogVisible = true;
      this.item = item;
      this.isImage ||
        this.$nextTick(() => {
          this.createTrimTimeline();
          this.getClipListImages();
        });
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
    // 计算出当前播放位置占总体百分比
    calcCurrentPercentage(currentTime) {
      const currentPercentage = currentTime / this.duration;
      return currentPercentage;
    },
    // 创建监视器时间线
    async createTrimTimeline() {
      this.trimTimeline = new TimelineClass("trim-window", {
        videoTrack: {
          clips: [
            {
              ...this.activeClip,
              inPoint: 0,
              trimIn: 0,
              trimOut: this.activeClip.orgDuration
            }
          ]
        }
      });
      await this.trimTimeline.stopEngin();
      await this.trimTimeline.buildTimeline();
      this.setContextEvent();
      this.trimTimeline.seekTimeline();
    },
    selected(item) {
      this.currentVideoUuid = item.uuid;
    },
    format(ms) {
      return us2time(ms);
    },
    handleUndo() {
      //
    },
    handleRedo() {
      //
    },
    handlePlay() {
      if (!this.isPlaying) {
        this.trimTimeline.play();
      } else {
        this.trimTimeline.stop();
      }
      this.isPlaying = !this.isPlaying;
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
      this.refreshBackgroundCover();
      this.splittreLeft = 0;
    },
    // 处理切片的选中
    handleClipClick(e) {
      if (!e.target.dataset.index) return;

      this.activeIndex = parseInt(e.target.dataset.index);
      const clip = this.activeClip.splitList[this.activeIndex];

      this.duration = clip.captureOut - clip.captureIn;

      this.captureLeft = clip.captureIn / this.activeClip.orgDuration;
      this.captureWidth = this.duration / this.activeClip.orgDuration;
    },
    handleLeftMouseDown(e) {
      const { clipList } = this.$refs;
      e.stopPropagation();
      this.mousePos =
        clipList.getBoundingClientRect().left +
        this.captureLeft * clipList.offsetWidth -
        e.clientX;

      this.captureEndPercentage = this.captureWidth + this.captureLeft;

      document.body.addEventListener("mousemove", this.handleLeftMouseMove);
      document.body.addEventListener("mouseup", this.handleLeftMouseUp, {
        once: true
      });
    },
    handleLeftMouseMove(e) {
      e.preventDefault();

      const { clipList } = this.$refs;
      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      const active = this.activeClip.splitList[this.activeIndex];

      this.captureLeft =
        (e.clientX - clipList.getBoundingClientRect().left + this.mousePos) /
        clipList.offsetWidth;

      this.captureWidth = this.captureEndPercentage - this.captureLeft;

      if (this.captureWidth < 0) {
        // 往右拉动限制
        this.captureWidth = 0;
        this.captureLeft = this.captureEndPercentage;
      }

      if (this.captureLeft < active.trimIn / this.activeClip.orgDuration) {
        // 往左拉动限制
        this.captureLeft = active.trimIn / this.activeClip.orgDuration;
        this.captureWidth = this.captureEndPercentage - this.captureLeft;
      }

      active.captureIn = this.captureLeft * this.activeClip.orgDuration;
      active.captureOut = endTime;

      this.duration = endTime - startTime;

      this.refreshBackgroundCover();
      this.trimTimeline.seekTimeline(startTime);
      this.resetVector();
    },
    handleLeftMouseUp(e) {
      e.stopPropagation();
      document.body.removeEventListener("mousemove", this.handleLeftMouseMove);
    },
    handleRightMouseDown(e) {
      const { clipList } = this.$refs;
      e.stopPropagation();

      this.mousePos =
        e.clientX -
        (clipList.getBoundingClientRect().left +
          this.captureLeft * clipList.offsetWidth +
          this.captureWidth * clipList.offsetWidth);

      document.body.addEventListener("mousemove", this.handleRightMouseMove);
      document.body.addEventListener("mouseup", this.handleRightMouseUp, {
        once: true
      });
    },
    handleRightMouseMove(e) {
      e.preventDefault();

      const { clipList } = this.$refs;
      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      const active = this.activeClip.splitList[this.activeIndex];
      this.captureWidth =
        (e.clientX -
          clipList.getBoundingClientRect().left -
          this.captureLeft * clipList.offsetWidth -
          this.mousePos) /
        clipList.offsetWidth;

      if (
        this.captureWidth + this.captureLeft >
        active.trimOut / this.activeClip.orgDuration
      ) {
        // 往右拉动限制
        this.captureWidth =
          active.trimOut / this.activeClip.orgDuration - this.captureLeft;
      }
      if (this.captureWidth < 0) {
        // 往左拉动限制
        this.captureWidth = 0;
      }

      this.duration = endTime - startTime;
      active.captureIn = startTime;
      active.captureOut = endTime;
      this.resetVector();
      this.refreshBackgroundCover();
    },
    handleRightMouseUp() {
      document.body.removeEventListener("mousemove", this.handleRightMouseMove);
    },
    handleCaptureMouseDown(e) {
      e.stopPropagation();

      this.mousePos =
        e.clientX - this.$refs.capture.getBoundingClientRect().left - 18;

      document.body.addEventListener("mousemove", this.handleCaptureMouseMove);
      document.body.addEventListener("mouseup", this.handleCaptureMouseUp, {
        once: true
      });
    },
    handleCaptureMouseMove(e) {
      e.preventDefault();

      const { clipList } = this.$refs;
      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      const active = this.activeClip.splitList[this.activeIndex];
      this.captureLeft =
        (e.clientX - this.mousePos - clipList.getBoundingClientRect().left) /
        clipList.offsetWidth;

      if (this.captureLeft < active.trimIn / this.activeClip.orgDuration) {
        // 往左拉动限制
        this.captureLeft = active.trimIn / this.activeClip.orgDuration;
      }
      if (
        this.captureLeft + this.captureWidth >
        active.trimOut / this.activeClip.orgDuration
      ) {
        // 往右拉动限制
        this.captureLeft =
          active.trimOut / this.activeClip.orgDuration - this.captureWidth;
      }

      this.duration = endTime - startTime;
      active.captureIn = startTime;
      active.captureOut = endTime;
      this.trimTimeline.seekTimeline(startTime);

      this.resetVector();
      this.refreshBackgroundCover();
    },
    getStartTime() {
      const startTime = this.captureLeft * this.activeClip.duration;
      return parseInt(startTime.toFixed());
    },
    getEndTime() {
      const endTime =
        (this.captureLeft + this.captureWidth) * this.activeClip.duration;
      return parseInt(endTime.toFixed());
    },
    handleCaptureMouseUp() {
      document.body.removeEventListener(
        "mousemove",
        this.handleCaptureMouseMove
      );
    },
    // 播放停止的事件
    stopEvent(timeline) {
      if (timeline === this.trimTimeline.timeline) {
        this.isPlaying = false;
      }
    },
    statusChangeEvent(isVideo, waiting) {
      this.waiting = waiting;
    },
    setContextEvent() {
      window.streamingContext.addEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.addEventListener(
        "onWebRequestWaitStatusChange",
        this.statusChangeEvent
      );
      window.streamingContext.addEventListener(
        "onPlaybackTimelinePosition",
        this.handlePlaying
      );
    },
    // 销毁时间线, 并解除事件绑定
    destroy() {
      if (this.trimTimeline) {
        this.trimTimeline.stopEngin().then(() => {
          this.trimTimeline.destroy();
        });
      }
      window.streamingContext.removeEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.removeEventListener(
        "onWebRequestWaitStatusChange",
        this.statusChangeEvent
      );
      window.streamingContext.removeEventListener(
        "onPlaybackTimelinePosition",
        this.handlePlaying
      );
    }
  },
  beforeDestroy() {}
};
</script>

<style lang="scss" scoped>
$infoBgc: rgba(0, 0, 0, 0.5);
.draft-list {
  min-width: 111px;
  height: 100%;
  width: 216px;
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
    padding-bottom: 70px;
    box-sizing: border-box;
    padding-bottom: 68px;
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
        color: #fff;
        font-size: 14px;
      }
      .duration {
        position: absolute;
        right: 4px;
        top: 6px;
        padding: 4px 8px;
        background-color: $infoBgc;
        border-radius: 6px;
        color: #fff;
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
      border-color: #fff;
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
      color: #fff;
      user-select: none;
    }
  }
}
::v-deep.el-dialog__wrapper {
  .el-dialog {
    width: 600px;
    height: 560px;
    .el-dialog__body {
      padding-bottom: 10px;
    }
  }
}

.ln-dialog {
  .live-window-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    .undo-btn {
      margin-bottom: 25px;
      .icon {
        cursor: pointer;
        width: 40px;
        height: 40px;
      }
    }
    .split-btn {
      margin-bottom: 30px;
      margin-right: 30px;
      color: #fff;
      cursor: pointer;

      .split-icon {
        width: 20px;
        height: 18.95px;
      }
      span {
        margin-left: 10px;
        vertical-align: 3px;
      }
    }
    .live-window {
      width: 276px;
      height: 360px;
      background-color: violet;
    }
  }

  h1 {
    color: #fff;
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
  .duration-input {
    .duration-modify-icon {
      width: 40px;
      height: 40px;
      user-select: none;
    }
  }
  .play-icon {
    margin-right: 6px;
    height: 30px;
    width: 30px;
    vertical-align: 0;
  }
  .clips-wrapper {
    .splitter {
      top: -8px;
      position: absolute;
      height: 45px;
      border: 1px solid #fff;
      width: 0;
      transform: translateX(-1px);
      z-index: 1000;
      &::before {
        content: "";
        display: block;
        width: 5px;
        height: 100%;
        transform: translateX(-2px);
      }
    }

    .clip-list-container {
      display: inline-block;
      position: relative;
      height: 30px;
      .clip-item-container {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        .clip-item {
          float: left;
          height: 100%;
          box-sizing: border-box;
          border: 1px solid #fff;
          border-radius: 6px;
        }
      }
      .clip-list-full {
        position: relative;
        margin-left: 18px;
        height: 100%;
        width: 500px;
      }
      .clip-list {
        position: relative;
        display: inline-block;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        border-radius: 6px;
        .vector {
          position: absolute;
          top: 0;
          height: 40px;
          width: 0;
          transform: translateY(-6px);
          border: 1px solid #fff;
        }
      }
    }
  }

  .capture-wrapper {
    left: 0;
    top: -5px;
    position: absolute;
    width: 507px;
    height: 30px;
    border: 5px solid #fff;
    border-left: 18px solid #fff;
    border-right: 18px solid #fff;
    border-radius: 6px;
    transform: translateX(-18px);
    z-index: 999;
    .capture-inner {
      width: 100%;
      height: 100%;
      border-radius: 12px;
      background-color: transparent;
      position: absolute;
      left: -5px;
      top: -5px;
      border: 5px solid #fff;
      // .background {
      //   width: 100%;
      //   height: 100%;
      //   border-radius: 6px;
      //   pointer-events: none;
      //   .background-inner {
      //     height: 100%;
      //   }
      // }
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
    "cancel": "Cancel",
    "split":"Split",
    "totalVideoDuration":"Total video duration"
  }
}
</i18n>
