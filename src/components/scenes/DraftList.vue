<template>
  <div class="draft-list">
    <div class="draft-list-container">
      <div
        :class="['draft-list-item']"
        v-for="(item, index) in videos"
        :key="item.uuid"
      >
        <div
          :class="[
            'split-item',
            item.uuid + `_${i}`,
            currentVideoUuid === item.uuid + `_${i}` ? 'onfocus' : ''
          ]"
          v-for="(split, i) in item.splitList"
          :key="i"
          @click="selected(item, i)"
          :style="{
            background:
              `linear-gradient(
              180deg,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.3) 100%
            ),
            url( &quot;` +
              getCover(item, i) +
              `&quot;) no-repeat center center/auto 100%`
          }"
        >
          <div class="order-number">{{ getNum(index, i) + 1 }}</div>
          <div class="duration">
            {{ format(split.captureOut - split.captureIn, true) }}
          </div>
          <transition name="el-fade-in-linear">
            <div
              class="operate-btns"
              v-if="currentVideoUuid === item.uuid + `_${i}`"
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
                  @click="del(index, i)"
                ></svg-icon>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <div class="add-media-btn flex" @click="mediaDialog = true">
      <svg-icon class="add-icon" icon-class="plus"></svg-icon>
      <span class="add-text">{{ $t("addMedia") }}</span>
    </div>

    <el-dialog
      custom-class="ln-dialog"
      :visible.sync="dialogVisible"
      top="0"
      :modal-append-to-body="false"
      :close-on-click-modal="false"
      destroy-on-close
      :before-close="destroy"
    >
      <template #title>
        <h1>{{ $t("trimVideo") }}</h1>
      </template>

      <div
        class="video-container"
        v-loading="waiting"
        element-loading-background="rgba(0, 0, 0, 0)"
      >
        <div class="undo-btn inline-block">
          <svg-icon
            @click.prevent="handleUndo"
            class="icon"
            :icon-class="undoable ? 'undo' : 'undo-deactive'"
          ></svg-icon>
          <svg-icon
            @click.prevent="handleRedo"
            class="icon"
            :icon-class="redoable ? 'redo' : 'redo-deactive'"
          ></svg-icon>
        </div>

        <div class="live-window-wrapper" ref="liveWindowWrapper">
          <div
            class="live-window"
            ref="liveWindow"
            :style="{
              width: Math.floor(dialogCanvasSize.width) + 'px',
              height: Math.floor(dialogCanvasSize.height) + 'px'
            }"
          >
            <canvas
              :width="dialogCanvasSize.width"
              :height="dialogCanvasSize.height"
              class="live-window inline-block"
              id="trim-window"
            ></canvas>
            <div class="selected-rect-wrapper">
              <div
                class="selected-rect"
                :style="{
                  width: rect.width * 100 + '%',
                  height: rect.height * 100 + '%',
                  left: rect.left * 100 + '%',
                  top: rect.top * 100 + '%'
                }"
              ></div>
            </div>
            <div
              class="selected-rect"
              :style="{
                width: rect.width * 100 + '%',
                height: rect.height * 100 + '%',
                left: rect.left * 100 + '%',
                top: rect.top * 100 + '%'
              }"
              @mousedown="handleRectMouseDown"
              ref="selectedRect"
            >
              <div class="left-top point"></div>
              <div class="right-top point"></div>
              <div class="right-bottom point"></div>
              <div class="left-bottom point"></div>
            </div>
          </div>
        </div>

        <div @click="handleSplit" class="split-btn inline-block">
          <svg-icon
            class="split-icon"
            icon-class="split"
            v-if="!isImage"
          ></svg-icon>
          <span>{{ btnText }}</span>
        </div>
      </div>

      <!-- 图片时长设置 -->
      <div class="duration-input flex margin-top-10" v-if="isImage">
        <svg-icon
          @click="handleImageDurationPlus"
          class="duration-modify-icon"
          icon-class="plus"
        ></svg-icon>
        <span class="white">{{ format(imageDuration, true) }}</span>
        <svg-icon
          @click="handleImageDurationMinus"
          class="duration-modify-icon"
          icon-class="minus"
        ></svg-icon>
      </div>
      <!-- 缩略图 -->
      <div class="clips-wrapper margin-top-20" ref="clipWrapper" v-else>
        <div class="play-icon flex" @click="handlePlay">
          <svg-icon :icon-class="!isPlaying ? 'play' : 'pause'"></svg-icon>
        </div>

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
                v-for="(clip, idx) of splitList"
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
                <div class="slice-duration">{{ format(duration, true) }}</div>
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
        <span
          >{{ $t("totalVideoDuration") }}
          {{ format(totalDuration, true) }}</span
        >
        <el-button
          class="round-btn white-btn"
          :style="{ background: '#2B2B2B' }"
          @click="(dialogVisible = false), destroy()"
          >{{ $t("cancel") }}</el-button
        >
        <el-button class="round-btn" type="primary" @click="handleNext">{{
          $t("next")
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="$t('pick')"
      top="0"
      custom-class="ln-dialog"
      width="80%"
      center
      :visible.sync="mediaDialog"
    >
      <Medias @cancel="cancel" @selected-finish="selectedFinish"></Medias>
    </el-dialog>
  </div>
</template>

<script>
import { us2hm, us2time } from "../../utils/common";
import {
  CLIP_TYPES,
  FX_DESC,
  TRANSFORM2D_KEYS,
  PARAMS_TYPES
} from "@/utils/Global";
import TimelineClass from "../../utils/TimelineClass";
import { VideoClip, FxParam, VideoFx } from "@/utils/ProjectData";
import OperateStack from "@/utils/OperateStack";
import Medias from "../create/Medias";
import { RATIO } from "@/utils/Global";
import WorkFlow from "@/utils/WorkFlow";
import { installAsset } from "@/utils/AssetsUtils";

export default {
  components: {
    Medias
    // DraftListItem
  },
  props: {},
  data() {
    return {
      dialogCanvasSize: {
        width: 0,
        height: 0
      },
      mediaDialog: false, // 添加素材的弹窗
      currentSplitList: [],
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
      motion: true,
      mousePos: 0,
      backgroundPosition: 0,
      activeIndex: -1, // 当前被选中的被分割的片段
      backgroundCover: "",
      splitList: [],
      totalDuration: 0,
      operateStack: null,
      captureMoved: false,
      videoInfo: null,
      currentSplitedIdx: 0,
      rect: {
        width: 0,
        height: 0,
        left: 0,
        top: 0,
        startRight: 0, // 按下四角时候记录
        startBottom: 0, // 按下四角时候记录
        mousePosX: 0,
        mousePosY: 0
      },
      isDisplayingMessage: null
    };
  },
  computed: {
    undoable() {
      if (!this.operateStack) return false;
      return !this.operateStack.isOnBottom;
    },
    redoable() {
      if (!this.operateStack) return false;
      return !this.operateStack.isOnTop;
    },
    // 当前选中被编辑的视频
    activeClip() {
      if (!this.currentVideoUuid) return {};
      return this.videos.find(item =>
        this.currentVideoUuid.includes(item.uuid)
      );
    },
    isImage() {
      return this.activeClip && this.activeClip.videoType === CLIP_TYPES.IMAGE;
    },
    videoDuration() {
      if (!this.activeClip) return NaN;
      return this.activeClip.duration;
    },
    btnText() {
      if (this.isImage) {
        return this.motion ? this.$t("motionOn") : this.$t("motionOff");
      }
      return this.$t("split");
    }
  },
  mounted() {},
  methods: {
    getCover(item, splitItem) {
      const inPoint = item.splitList[splitItem].captureIn;
      if (inPoint === 0) {
        return item.coverUrl;
      }
      return (
        item.thumbnails[Math.round(inPoint / 1000000)]?.url ?? item.coverUrl
      );
    },
    handleRectMouseDown(e) {
      const { width, height } = this.dialogCanvasSize;

      this.rect.startLeft = this.rect.left;
      this.rect.startRight = this.rect.left + this.rect.width;
      this.rect.startBottom = this.rect.top + this.rect.height;
      this.rect.mousePosX =
        e.clientX -
        this.rect.left * width -
        this.$refs.liveWindow.getBoundingClientRect().left;
      this.rect.mousePosY =
        e.clientY -
        this.rect.top * height -
        this.$refs.liveWindow.getBoundingClientRect().top;

      if (e.target.classList.contains("right-bottom")) {
        document.body.addEventListener(
          "mousemove",
          this.handleRightBottomResizeMouseMove
        );
      } else if (e.target.classList.contains("right-top")) {
        document.body.addEventListener(
          "mousemove",
          this.handleRightTopResizeMouseMove
        );
      } else if (e.target.classList.contains("left-bottom")) {
        document.body.addEventListener(
          "mousemove",
          this.handleLeftBottomResizeMouseMove
        );
      } else if (e.target.classList.contains("left-top")) {
        document.body.addEventListener(
          "mousemove",
          this.handleLeftTopResizeMouseMove
        );
      } else {
        document.body.addEventListener("mousemove", this.handleRectMouseMove);
      }
      document.body.addEventListener("mouseup", this.handleRectMouseUp, {
        once: true
      });
    },
    widthToHeight(w) {
      const { width, height } = this.dialogCanvasSize;
      this.rect.height = (w * width) / RATIO / height;
    },
    heightToWidth(h) {
      const { width, height } = this.dialogCanvasSize;
      this.rect.width = (h * height * RATIO) / width;
    },
    handleRightTopResizeMouseMove(e) {
      e.preventDefault();
      const { width } = this.dialogCanvasSize;
      const {
        rect,
        widthToHeight,
        heightToWidth,
        $refs: { liveWindow }
      } = this;

      rect.width =
        (e.clientX -
          liveWindow.getBoundingClientRect().left -
          rect.left * width) /
        width;
      widthToHeight(rect.width);

      rect.top = rect.startBottom - rect.height;

      if (rect.top < 0) {
        rect.top = 0;
        rect.height = rect.startBottom;
        heightToWidth(rect.height);
      }
      if (rect.width + rect.left > 1) {
        rect.width = 1 - rect.left;
        widthToHeight(rect.width);
        rect.top = rect.startBottom - rect.height;
      }
    },
    handleRightBottomResizeMouseMove(e) {
      e.preventDefault();
      const { width, height } = this.dialogCanvasSize;
      const {
        rect,
        heightToWidth,
        widthToHeight,
        $refs: { liveWindow }
      } = this;

      rect.width =
        (e.clientX -
          liveWindow.getBoundingClientRect().left -
          rect.left * width) /
        width;
      rect.height = (rect.width * width) / RATIO / height;

      if (rect.width + rect.left > 1) {
        rect.width = 1 - rect.left;
        widthToHeight(rect.width);
      }
      if (rect.height + rect.top > 1) {
        rect.height = 1 - rect.top;
        heightToWidth(rect.height);
      }
    },
    handleLeftTopResizeMouseMove(e) {
      e.preventDefault();
      const { width } = this.dialogCanvasSize;
      const {
        rect,
        widthToHeight,
        heightToWidth,
        $refs: { liveWindow }
      } = this;

      rect.left = (e.clientX - liveWindow.getBoundingClientRect().left) / width;
      rect.width = rect.startRight - rect.left;

      widthToHeight(rect.width);
      rect.top = rect.startBottom - rect.height;

      if (rect.top < 0) {
        rect.top = 0;
        rect.height = rect.startBottom;
        heightToWidth(rect.height);
        rect.left = rect.startRight - rect.width;
      }
      if (rect.left < 0) {
        rect.left = 0;
        rect.width = rect.startRight;
        widthToHeight(rect.width);
        rect.top = rect.startBottom - rect.height;
      }
    },
    handleLeftBottomResizeMouseMove(e) {
      e.preventDefault();
      const { width } = this.dialogCanvasSize;
      const { left } = this.$refs.liveWindow.getBoundingClientRect();
      const { rect, widthToHeight, heightToWidth } = this;

      rect.width = rect.startRight - (e.clientX - left) / width;
      rect.left = rect.startRight - rect.width;
      widthToHeight(rect.width);

      if (rect.height + rect.top > 1) {
        rect.height = 1 - rect.top;
        heightToWidth(rect.height);
        rect.left = rect.startRight - rect.width;
      }
      if (rect.left < 0) {
        rect.left = 0;
        rect.width = rect.startRight;
        widthToHeight(rect.width);
      }
    },
    handleRectMouseMove(e) {
      e.preventDefault();
      const { width, height } = this.dialogCanvasSize;
      const { left, top } = this.$refs.liveWindow.getBoundingClientRect();

      this.rect.left = (e.clientX - this.rect.mousePosX - left) / width;
      this.rect.top = (e.clientY - this.rect.mousePosY - top) / height;

      this.rect.left <= 0 && (this.rect.left = 0);
      this.rect.top <= 0 && (this.rect.top = 0);

      if (this.rect.left + this.rect.width >= 1) {
        this.rect.left = 1 - this.rect.width;
      }
      if (this.rect.top + this.rect.height >= 1) {
        this.rect.top = 1 - this.rect.height;
      }
    },
    handleRectMouseUp() {
      document.body.removeEventListener(
        "mousemove",
        this.handleRightTopResizeMouseMove
      );
      document.body.removeEventListener(
        "mousemove",
        this.handleRightBottomResizeMouseMove
      );
      document.body.removeEventListener(
        "mousemove",
        this.handleLeftTopResizeMouseMove
      );
      document.body.removeEventListener(
        "mousemove",
        this.handleLeftBottomResizeMouseMove
      );
      document.body.removeEventListener("mousemove", this.handleRectMouseMove);
    },
    calcSelectRectSize() {
      const { width, height } = this.$refs.liveWindow.getBoundingClientRect();
      const { videoFxs } = this.activeClip.splitList[this.currentSplitedIdx];
      const {
        width: videoWidth,
        height: videoHeight
      } = this.videoInfo.videoStreamInfo;
      const transformData = videoFxs.find(
        fx => fx.desc === FX_DESC.TRANSFORM2D
      );
      if (transformData) {
        let paramX = 0;
        let paramY = 0;
        let scaleX = 1;
        let scaleY = 1;
        transformData.params.forEach(param => {
          switch (param.key) {
            case TRANSFORM2D_KEYS.TRANS_X:
              paramX = param.value;
              break;
            case TRANSFORM2D_KEYS.TRANS_Y:
              paramY = param.value;
              break;
            case TRANSFORM2D_KEYS.SCALE_X:
              scaleX = param.value;
              break;
            case TRANSFORM2D_KEYS.SCALE_Y:
              scaleY = param.value;
              break;
          }
        });

        const {
          imageWidth,
          imageHeight,
          standardizedVideoHeight,
          standardizedVideoWidth
        } = this.calcTransformParams();

        const centerX = -(
          paramX /
          ((imageWidth / standardizedVideoWidth) * scaleX)
        );
        const centerY = -(
          paramY /
          ((imageHeight / standardizedVideoHeight) * scaleY)
        );

        if (videoWidth > videoHeight) {
          this.rect.height = standardizedVideoHeight / scaleY / videoHeight;
          this.rect.width =
            ((9 / 16) * (this.rect.height * videoHeight)) / videoWidth;
        } else {
          this.rect.width = standardizedVideoWidth / scaleX / videoWidth;
          this.rect.height =
            ((16 / 9) * (this.rect.width * videoWidth)) / videoHeight;
        }

        const centerInLiveWindow = WorkFlow.bToa(
          new NvsPointF(centerX, centerY),
          this.trimTimeline.liveWindow
        );

        this.rect.left = centerInLiveWindow.x / width - this.rect.width / 2;
        this.rect.top = centerInLiveWindow.y / height - this.rect.height / 2;
      } else {
        const { width, height } = this.dialogCanvasSize;
        if (width / height > RATIO) {
          this.rect.height = 1;
          this.rect.width = (height * RATIO) / width;
          this.rect.top = 0;
          this.rect.left = (1 - this.rect.width) / 2;
        } else {
          // 高度过高
          this.rect.width = 1;
          this.rect.height = width / RATIO / height;
          this.rect.top = 0;
          this.rect.left = 0;
        }
      }
    },
    cancel() {
      this.mediaDialog = false;
    },
    getNum(videoIndex, splitIndex) {
      let sum = 0;
      for (let i = 0; i < videoIndex; i++) {
        sum += this.videos[i].splitList.length;
      }
      return sum + splitIndex;
    },
    async selectedFinish(videos) {
      let medias = videos.filter(
        ({ id }) => !this.videos.find(v => v.id === id)
      );
      const assets = [];
      const lastVideo = this.videos[this.videos.length - 1]; // 用户可能是删除完所有的素材，然后再添加
      let inPoint = lastVideo
        ? lastVideo.splitList.reduce((duration, item) => {
            duration += item.captureOut - item.captureIn;
            return duration;
          }, lastVideo.inPoint || 0)
        : 0;
      for (let i = 0; i < medias.length; i++) {
        const v = medias[i];
        const m3u8Path = await installAsset(v[`hls_${v.media_type}_url`]);
        const video = new VideoClip({
          m3u8Path,
          inPoint,
          duration: v.media_type === "image" ? 3000000 : v.duration,
          videoType: v.media_type,
          coverUrl: v.thumbnail_url,
          url: v[`${v.media_type}_url`],
          m3u8Url: v[`hls_${v.media_type}_url`],
          widht: v.width,
          height: v.height,
          aspectRatio: v.aspect_ratio,
          id: v.id,
          thumbnails: v.thumbnails
        });
        inPoint += video.duration;
        assets.push(video);
      }
      this.addClipToVuex(assets);
      this.$bus.$emit(this.$keys.rebuildTimeline);
      this.$bus.$emit(this.$keys.updateProject); // 更新工程 media assets和dom xml
      this.mediaDialog = false;
    },
    calcSplittedItemWidth(startTime, endTime) {
      const { activeClip } = this;
      return (
        endTime / activeClip.orgDuration - startTime / activeClip.orgDuration
      );
    },
    refreshBackgroundCover() {
      this.backgroundCover = "";
      this.splitList.forEach(item => {
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
      const isOnClipList = e.path.find(
        item => item === this.$refs.clipList || item === this.$refs.clipWrapper
      );
      if (isOnClipList) return;
      this.activeIndex = -1;
    },
    handleSplitterMouseDown() {
      document.body.addEventListener("mousemove", this.handleSplitterMouseMove);
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

      document.body.addEventListener("mouseup", this.handleSplitterMouseUp, {
        once: true
      });
    },
    handleSplitterMouseUp(e) {
      e.stopPropagation();
      document.body.removeEventListener(
        "mousemove",
        this.handleSplitterMouseMove
      );
    },

    handleSplit() {
      if (this.isImage) {
        this.motion = !this.motion;
        return;
      }
      const splitterPercentage = this.splittreLeft;
      const splitPoint = splitterPercentage * this.activeClip.orgDuration;
      let splitedArr = [];
      this.splitList.reduce((prev, cur, curIdx, arr) => {
        const curWidth = this.calcSplittedItemWidth(cur.trimIn, cur.trimOut);
        if (splitterPercentage < curWidth + prev && splitterPercentage > prev) {
          this.delMaterials(cur);
          // 一分为二
          splitedArr = [
            {
              raw: cur.raw,
              videoFxs: cur.videoFxs || [],
              trimIn: Math.round(cur.trimIn),
              trimOut: Math.round(splitPoint),
              captureIn: Math.round(cur.trimIn),
              captureOut: Math.round(splitPoint)
            },
            {
              videoFxs: cur.videoFxs || [],
              trimIn: Math.round(splitPoint),
              trimOut: Math.round(cur.trimOut),
              captureIn: Math.round(splitPoint),
              captureOut: Math.round(cur.trimOut)
            }
          ];
          arr.splice(curIdx, 1, ...splitedArr);
        }
        return prev + curWidth;
      }, 0);
      this.refreshBackgroundCover();
      this.calcDuration();
      this.operateStack.pushSnapshot(this.splitList);
    },

    handleImageDurationPlus() {
      this.imageDuration += 1000000;
      this.calcDuration(null, null, true);
    },
    handleImageDurationMinus() {
      this.imageDuration -= 1000000;
      if (this.imageDuration < 0) {
        this.imageDuration = 0;
      }
      this.calcDuration(null, null, true);
    },
    handlePlaying(timeline, currentTime) {
      this.splittreLeft = this.calcCurrentPercentage(currentTime);
    },
    handleResize() {
      !this.isImage && this.getClipListImages();
      const { width, height } = this.videoInfo.videoStreamInfo;
      const { offsetWidth, offsetHeight } = this.$refs.liveWindowWrapper;
      // this.dialogCanvasSize = {
      //   height: this.$refs.liveWindow.offsetHeight,
      //   width: (width / height) * this.$refs.liveWindow.offsetHeight
      // };
      if (offsetWidth / offsetHeight < width / height) {
        this.$nextTick(() => {
          this.dialogCanvasSize = {
            width: this.$refs.liveWindowWrapper.offsetWidth,
            height: (height / width) * this.$refs.liveWindowWrapper.offsetWidth
          };
          // this.$refs.liveWindow.style.height =
          //   Math.floor(this.dialogCanvasSize.height) + "px";
        });
      } else {
        this.$nextTick(() => {
          this.dialogCanvasSize = {
            height: this.$refs.liveWindowWrapper.offsetHeight,
            width: (width / height) * this.$refs.liveWindowWrapper.offsetHeight
          };
          // this.$refs.liveWindow.style.width =
          //   Math.floor(this.dialogCanvasSize.width) + "px";
        });
      }
    },

    calcTransformParams(centerPos) {
      const { videoWidth: w, videoHeight: h } = this.$store.state.clip;
      let { imageWidth, imageHeight } = new NvsVideoResolution(w, h); // 主 LiveWindow 渲染层视频像素宽高

      // dialog中视频宽高
      const {
        width: videoWidth,
        height: videoHeight
      } = this.videoInfo.videoStreamInfo;

      let standardizedVideoHeight = 0; //原始素材按 9/16 计算后高度
      let standardizedVideoWidth = 0; //原始素材按 9/16 计算后宽度
      let scaleX = 0;
      let scaleY = 0;

      if (videoWidth > videoHeight) {
        standardizedVideoHeight = (16 / 9) * videoWidth;
        standardizedVideoWidth = videoWidth;
        scaleY =
          1 / ((videoHeight * this.rect.height) / standardizedVideoHeight);
        scaleX = scaleY;
      } else {
        standardizedVideoWidth = (9 / 16) * videoHeight;
        standardizedVideoHeight = videoHeight;
        scaleX = 1 / ((videoWidth * this.rect.width) / standardizedVideoWidth);
        scaleY = scaleX;
      }
      if (!centerPos)
        return {
          imageWidth,
          imageHeight,
          standardizedVideoHeight,
          standardizedVideoWidth
        };

      const transX =
        -(imageWidth / standardizedVideoWidth) * centerPos.x * scaleX;
      const transY =
        -(imageHeight / standardizedVideoHeight) * centerPos.y * scaleY;

      return {
        transX,
        transY,
        scaleX,
        scaleY
      };
    },
    handleNext() {
      this.dialogVisible = false;
      const { width, height } = this.$refs.liveWindow.getBoundingClientRect();

      // 计算特效参数
      // ui层 选中的rect中点(视图坐标系为基准)
      let center = {
        x: (this.rect.left + this.rect.width / 2) * width,
        y: (this.rect.top + this.rect.height / 2) * height
      };
      // 渲染层 选中的rect中点（时间线坐标系为基准）
      const centerPos = WorkFlow.aTob(
        new NvsPointF(center.x, center.y),
        this.trimTimeline.liveWindow
      );

      const { transX, transY, scaleX, scaleY } = this.calcTransformParams(
        centerPos
      );

      const transformFx = new VideoFx(FX_DESC.TRANSFORM2D);
      transformFx.params = [
        new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.TRANS_X, transX), // 偏移
        new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.TRANS_Y, transY),

        new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.SCALE_X, scaleX), // 缩放
        new FxParam(PARAMS_TYPES.FLOAT, TRANSFORM2D_KEYS.SCALE_Y, scaleY)
      ];

      const mosaicFx = new VideoFx(FX_DESC.MOSAIC);
      if (this.isImage) {
        // 图片处理
        this.activeClip.splitList[0].trimOut = this.imageDuration;
        this.activeClip.splitList[0].captureOut = this.imageDuration;
        this.activeClip.splitList[0].videoFxs = [transformFx, mosaicFx];
        this.activeClip.motion = this.motion;
      } else {
        // 视频处理
        this.activeClip.splitList = this.splitList.map(item => {
          item.videoFxs = [transformFx, mosaicFx];
          return item;
        });
      }
      this.updateClipToVuex(this.activeClip);
      // 底层执行操作
      this.$bus.$emit(this.$keys.rebuildTimeline);
      this.destroy();
    },
    initSplit() {
      this.splitList = this.activeClip.splitList.map(item => ({ ...item }));
    },
    // 视频裁剪
    cut(item) {
      this.dialogVisible = true;
      this.item = item;
      this.videoInfo = streamingContext.streamingContext.getAVFileInfo(
        this.activeClip.m3u8Path,
        0
      );
      this.$nextTick(async () => {
        this.handleResize(); // 计算canvas尺寸、计算缩略图
        await this.createTrimTimeline();
        this.operateStack = new OperateStack();
        if (this.isImage) {
          const { captureIn, captureOut } = this.activeClip.splitList[0];
          this.imageDuration = captureOut - captureIn;
          this.motion = this.activeClip.motion;
          this.calcDuration(null, null, true);
          this.operateStack.pushSnapshot(this.splitList);
        } else {
          this.initSplit(); // 根据当前video的splitList分隔当前缩略图
          this.refreshBackgroundCover(); // 计算缩略图灰色半透明覆盖部分
          this.calcDuration(); // 计算Duration（dialog底部展示）
          this.splittreLeft = 0;
          this.operateStack.pushSnapshot(this.splitList);
          addEventListener("resize", this.handleResize);
          document.body.addEventListener("mousedown", this.handleDocumentClick);
        }
        this.calcSelectRectSize(); // 计算video部分选中框大小
      });
    },
    delMaterials(delItem) {
      ["captions", "stickers"].forEach(type => {
        for (let i = 0; i < this[type].length; i++) {
          const caption = this[type][i];
          if (
            delItem.captureIn <= caption.inPoint &&
            delItem.captureOut > caption.inPoint
          ) {
            this[type].splice(i, 1);
            i--;
          }
        }
      });
    },
    del(index, splitIndex) {
      const v = [];
      let inPoint = 0;
      const delItem = this.videos[index].splitList.splice(splitIndex, 1)[0];

      this.delMaterials(delItem);

      for (let i = 0; i < this.videos.length; i++) {
        const el = this.videos[i];
        if (!el.splitList.length) continue;
        el.inPoint = inPoint;
        inPoint += el.duration;
        v.push(el);
      }
      this.resetClips({ type: CLIP_TYPES.VIDEO, clips: v });
      const i = Math.min(index, v.length);
      this.currentVideoUuid = v[i] && v[i].uuid + "_0";
      this.$bus.$emit(this.$keys.rebuildTimeline);
      this.$bus.$emit(this.$keys.updateProject); // 更新工程 media assets和dom xml
    },

    // 计算出当前播放位置占总体百分比
    calcCurrentPercentage(currentTime) {
      const currentPercentage = currentTime / this.activeClip.orgDuration;
      return currentPercentage;
    },
    // 创建监视器时间线
    async createTrimTimeline() {
      const videoClip = new VideoClip({ ...this.activeClip, inPoint: 0 });
      this.trimTimeline = new TimelineClass(
        "trim-window",
        streamingContext.streamingContext.getAVFileInfo(
          this.activeClip.m3u8Path,
          0
        ).videoStreamInfo
      );
      await this.trimTimeline.stopEngin();
      await this.trimTimeline.buildTimeline([videoClip]);
      this.setContextEvent();
      this.trimTimeline.seekTimeline();
    },
    selected(item, i) {
      this.currentVideoUuid = item.uuid + `_${i}`;
      this.currentSplitedIdx = i;
      this.$bus.$emit(this.$keys.getTimeline, timeline => {
        const currentTime = timeline.getCurrentPosition();
        if (
          currentTime < item.inPoint ||
          currentTime >= item.inPoint + item.duration
        ) {
          this.$bus.$emit(this.$keys.seek, item.inPoint);
        }
      });
    },
    format(ms, hm = false) {
      return hm ? us2hm(ms) : us2time(ms);
    },
    handleUndo() {
      if (!this.undoable) return;
      this.splitList = this.operateStack.moveDown();
      this.refreshBackgroundCover();
    },
    handleRedo() {
      if (!this.redoable) return;
      this.splitList = this.operateStack.moveUp();
      this.refreshBackgroundCover();
    },

    handlePlay(e) {
      e.stopPropagation();

      if (!this.isPlaying) {
        if (this.activeIndex === -1) {
          // 片段未选中
          this.trimTimeline.play(0);
        } else {
          // 片段已选中
          this.trimTimeline.seekTimeline(
            this.captureLeft * this.activeClip.orgDuration
          );
          this.trimTimeline.play(
            undefined,
            this.splitList[this.activeIndex].captureOut
          );
        }
      } else {
        this.trimTimeline.stop();
      }
      this.isPlaying = !this.isPlaying;
    },
    // 拼出缩略图
    getClipListImages() {
      if (!this.item.thumbnails.length) {
        if (!this.isDisplayingMessage) {
          return (this.isDisplayingMessage = this.$message({
            type: "warning",
            message: "No thumbnails!",
            onClose: () => {
              this.isDisplayingMessage = null;
            }
          }));
        }
        return null;
      }
      const { offsetWidth } = this.$refs.clipList;
      const { width, height } = this.videoInfo.videoStreamInfo;
      const clipItemWidth = 30 * (width / height); // 每个缩略图宽度
      const clipItemDuration =
        (clipItemWidth / offsetWidth) * this.activeClip.orgDuration;

      const containableItemNum = Math.floor(offsetWidth / clipItemWidth);
      const step = Math.floor(this.item.thumbnails.length / containableItemNum);

      let bg = "";
      let counter = 0;

      if (step !== 0) {
        // 如果缩略图可以涵盖整个缩略图条
        for (let i = 0; i < this.item.thumbnails.length; i++) {
          if (i % step === 0) {
            bg += `url("${this.item.thumbnails[i].url}") ${counter *
              clipItemWidth}px 0/${clipItemWidth}px 100% no-repeat,`;

            counter++;
          }
        }
      } else {
        // 如果缩略图数量过少，计算时加入时间维度
        let durationCumulate = 0;
        // 先插入第一张
        bg += `url("${this.item.thumbnails[0].url}") 0 0/${clipItemWidth}px 100% no-repeat,`;
        durationCumulate += clipItemDuration;
        counter++;

        for (let i = 1; i < this.item.thumbnails.length; i++) {
          const thumbnail = this.item.thumbnails[i];
          if (durationCumulate <= thumbnail.time) {
            // 时间区间可以容纳多少缩略图
            const capableItemNum = Math.floor(
              (thumbnail.time - durationCumulate) / clipItemDuration
            );
            if (capableItemNum >= 1) {
              for (let j = 0; j < capableItemNum; j++) {
                bg += `url("${this.item.thumbnails[i - 1].url}") ${counter++ * // 因为此时间点是上一个时间点缩略图的重复，所以最后一个时间点一直到结尾的缩略图可能无法展示，需要单独补充
                  clipItemWidth}px 0/${clipItemWidth}px 100% no-repeat,`;
                durationCumulate += clipItemDuration;
              }
            }
          }
        }

        // 补充最后一张
        if (durationCumulate < this.activeClip.orgDuration) {
          bg += `url("${this.item.thumbnails.slice(-1)[0].url}") ${counter++ *
            clipItemWidth}px 0/${clipItemWidth}px 100% repeat,`;
        }
      }
      this.background = bg.substring(0, bg.length - 1);
    },
    // 处理切片的选中
    handleClipClick(e) {
      if (!e.target.dataset.index) return;

      this.activeIndex = parseInt(e.target.dataset.index);
      const clip = this.splitList[this.activeIndex];

      this.calcDuration(clip.captureIn, clip.captureOut);

      this.captureLeft = clip.captureIn / this.activeClip.orgDuration;
      this.captureWidth =
        (clip.captureOut - clip.captureIn) / this.activeClip.orgDuration;
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
      const active = this.splitList[this.activeIndex];

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

      const startTime = this.getStartTime();
      const endTime = this.getEndTime();

      active.captureIn = startTime;
      active.captureOut = endTime;

      this.calcDuration(startTime, endTime);
      this.refreshBackgroundCover();
      this.trimTimeline.seekTimeline(startTime);
    },
    handleLeftMouseUp(e) {
      e.stopPropagation();
      this.operateStack.pushSnapshot(this.splitList);
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

      const active = this.splitList[this.activeIndex];
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

      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      active.captureIn = startTime;
      active.captureOut = endTime;
      this.calcDuration(startTime, endTime);
      this.refreshBackgroundCover();
    },
    calcDuration(startTime, endTime, isImage) {
      if ((startTime && endTime) ?? false) {
        this.duration = endTime - startTime;
      }
      const otherVideoDuration = this.videos.reduce((prev, cur) => {
        if (Object.is(cur, this.activeClip)) {
          return prev;
        }
        const captureDuration = cur.splitList.reduce((prevSplit, curSplit) => {
          return prevSplit + (curSplit.captureOut - curSplit.captureIn);
        }, 0);
        return prev + captureDuration;
      }, 0);
      const currentVideoDuration = isImage
        ? this.imageDuration
        : this.splitList.reduce(
            (prev, cur) => prev + cur.captureOut - cur.captureIn,
            0
          );
      this.totalDuration = otherVideoDuration + currentVideoDuration;
    },
    handleRightMouseUp() {
      this.operateStack.pushSnapshot(this.splitList);
      document.body.removeEventListener("mousemove", this.handleRightMouseMove);
    },
    handleCaptureMouseDown(e) {
      e.stopPropagation();

      this.captureMoved = false;
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
      const active = this.splitList[this.activeIndex];

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

      const startTime = this.getStartTime();
      const endTime = this.getEndTime();
      active.captureIn = startTime;
      active.captureOut = endTime;
      this.trimTimeline.seekTimeline(startTime);

      this.captureMoved = true;
      this.refreshBackgroundCover();
    },
    getStartTime() {
      const startTime = this.captureLeft * this.activeClip.duration;
      return Math.round(startTime);
    },
    getEndTime() {
      const endTime =
        (this.captureLeft + this.captureWidth) * this.activeClip.duration;
      return Math.round(endTime);
    },
    handleCaptureMouseUp() {
      if (this.captureMoved) this.operateStack.pushSnapshot(this.splitList);
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
    destroy(done) {
      if (this.trimTimeline) {
        this.trimTimeline.stopEngin().then(() => {
          this.trimTimeline.destroy();
          done && done();
        });
      }
      document.body.removeEventListener("mousedown", this.handleDocumentClick);
      removeEventListener("resize", this.handleResize);
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
      .split-item {
        border: 2px solid transparent;
        border-radius: 6px;
        transition: 0.3s;
        position: relative;
        height: 180px;
        width: 180px;
        &.onfocus {
          border-color: $white;
        }
      }
    }
    .draft-list-item + .draft-list-item {
      margin-top: 12px;
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
    // width: 600px;
    // height: 560px;
    .el-dialog__body {
      // height: calc(100% - 130px);
      display: flex;
      flex-direction: column;
      justify-content: space-around;

      // display: flex;
    }
  }
}

@media screen and (max-width: 1650px) {
  .live-window-wrapper {
    width: 66%;
  }
}
@media screen and (min-width: 1651px) {
  .live-window-wrapper {
    width: 75%;
  }
}
.ln-dialog {
  .video-container {
    height: calc(100% - 50px);
    // flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    .live-window-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
    .live-window {
      position: relative;
      .selected-rect-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .selected-rect {
          outline: rgba(0, 0, 0, 0.6) solid 1000px;
        }
      }
      .selected-rect {
        position: absolute;
        top: 0;
        // width: 100%;
        height: 100%;
        border: 1px solid;
        box-sizing: border-box;
        .point {
          position: absolute;
          width: 8px;
          height: 8px;
          background-color: #fff;
          border-radius: 50%;
          cursor: crosshair;
          // visibility: hidden;
          &.left-top {
            left: -4px;
            top: -4px;
          }
          &.right-top {
            right: -4px;
            top: -4px;
          }
          &.right-bottom {
            bottom: -4px;
            right: -4px;
          }
          &.left-bottom {
            left: -4px;
            bottom: -4px;
          }
        }
      }
    }
    .undo-btn {
      margin-bottom: 25px;
      .icon {
        cursor: pointer;
        width: 40px;
        height: 40px;
        user-select: none;
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
    width: 38px;
    height: 38px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 50%;
  }

  .clips-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-around;
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
        width: 14px;
        height: 100%;
        transform: translateX(-7px);
      }
    }

    .clip-list-container {
      flex: 1;
      position: relative;
      height: 30px;
      .clip-item-container {
        display: flex;
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        overflow: hidden;
        .clip-item {
          flex-shrink: 0;
          flex-grow: 0;
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
    "totalVideoDuration":"Total video duration",
    "motionOn": "Motion On ",
    "motionOff": "Motion Off",
    "pick": "Pick Media"
  }
}
</i18n>
