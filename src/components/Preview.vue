<template>
  <div class="preview" @drop.prevent="drop" @dragover.prevent>
    <div
      class="live-window-container"
      v-loading="waiting"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        ref="liveWindow"
        class="live-window"
        id="live-window"
        width="540"
        height="960"
      ></canvas>
      <div id="work-flow" @click="clickLiveWindow"></div>
    </div>
    <div class="controls flex" @click="play">
      <svg-icon
        :class="[!isPlaying ? 'icon-play' : 'icon-pause', 'preview-icon']"
        :icon-class="!isPlaying ? 'play' : 'pause'"
      ></svg-icon>
    </div>
  </div>
</template>

<script>
import initSDK from "@/utils/NvBase";
import TimelineClass from "@/utils/TimelineClass";
import { CLIP_TYPES } from "@/utils/Global";
import { vectorRotate, getCaptionCenter } from "@/utils/common";
import { CaptionClip, StickerClip, AudioClip } from "@/utils/ProjectData";
import dragMixin from "@/mixins/dragMixin";
import keyBindMx from "@/mixins/keyBindMx";
import WorkFlow from "@/utils/WorkFlow";
import { mapActions, mapState } from "vuex";
import resource from "../mock/resource.json";
import { installAsset } from "../utils/AssetsUtils";
import { VideoClip } from "@/utils/ProjectData";
import { DEFAULT_FONT } from "@/utils/Global";
export default {
  mixins: [dragMixin, keyBindMx],
  props: {},
  data() {
    return {
      width: 0,
      height: null,
      isPlaying: false,
      waiting: false,
      timelineClass: null,
      seekVal: 0,
      flow: null
    };
  },
  async mounted() {
    try {
      await initSDK();
      this.setNvsStatus(true); // 设置状态. 表示SDK已加载完成
      console.log("SDK 初始化完成");
    } catch (error) {
      console.error("初始化失败", error);
      this.$message({
        type: "error",
        message: this.$t("loadModulesFailed")
      });
    }
    // 创建时间线
    if (!this.vuexLoaded) {
      await this.installFont();
      const mediaAssets = await this.getMediaAssets();
      await this.applyAssets(mediaAssets);
      console.log("media-assets", mediaAssets);
    } else {
      await this.$nextTick();
    }
    console.log("创建时间线");
    await this.createTimeline();
    document.body.addEventListener("mouseup", this.statusEvent);
  },
  computed: {
    ...mapState({
      editBoxStatus: "editBoxStatus"
    })
  },
  methods: {
    test(point1, point2, point3, point4, raw) {
      raw = raw ?? this.timelineClass.videoTrack.clips[0].splitList[0].raw;
      const fx = raw.appendRawBuiltinFx("Transform 2D");
      // fx.setFloatVal("Trans X", 100);
      // fx.setFloatVal("Trans Y", 100);
      console.log("吊");
      window.fx = fx;
      const mosaicFx = raw.appendRawBuiltinFx("Mosaic");
      mosaicFx.setFloatVal("Unit Size", 0);
      mosaicFx.setFilterIntensity(1);
      mosaicFx.setRegional(true);
      mosaicFx.setIgnoreBackground(true);
      mosaicFx.setInverseRegion(false);
      mosaicFx.setRegionalFeatherWidth(0);
      const region = new NvsVectorFloat();
      // pos1
      region.push_back(point1.x);
      region.push_back(point1.y);
      region.push_back(point2.x);
      region.push_back(point2.y);
      region.push_back(point3.x);
      region.push_back(point3.y);
      region.push_back(point4.x);
      region.push_back(point4.y);

      // pos2
      // region.push_back(-0.5);
      // region.push_back(-0.5);
      // // pos3
      // region.push_back(0.5);
      // region.push_back(-0.5);
      // // pos4
      // region.push_back(0.5);
      // region.push_back(0.5);
      mosaicFx.setRegion(region);

      this.timelineClass.seekTimeline();
    },
    statusEvent() {
      setTimeout(() => {
        this.setEditBoxstatus(false);
      });
    },
    // 点击livewindow, 是否显示操作转换框
    clickLiveWindow(e) {
      if (this.editBoxStatus) return; // 调整框
      if (this.flow && this.flow.isInRect({ x: e.offsetX, y: e.offsetY })) {
        // 点击的位置就是在编辑框内
        return;
      }
      const target = this.findClipAtNowPoint(e);
      if (target) {
        this.flow = new WorkFlow({
          containerId: "work-flow",
          clip: target,
          timelineClass: this.timelineClass
        });
      } else {
        if (this.flow) {
          this.flow.destroy();
          this.flow = null;
        }
      }
      this.$bus.$emit(this.$keys.setPanel, target);
    },
    // 查找当前时刻点击位置是否有字幕/贴纸
    findClipAtNowPoint(e) {
      let { offsetX, offsetY } = e;
      const seekVal = this.timelineClass.getCurrentPosition();
      const captions = this.captions.filter(
        ({ inPoint, duration }) =>
          seekVal >= inPoint && seekVal <= inPoint + duration
      );
      const stickers = this.stickers.filter(
        ({ inPoint, duration }) =>
          seekVal >= inPoint && seekVal <= inPoint + duration
      );
      if (captions.length || stickers.length) {
        return [...captions, ...stickers].find(item => {
          const point = WorkFlow.getCoordinateFromPoint(
            item,
            this.timelineClass.liveWindow
          );
          const { x, y, height, width } = point;
          if (item.rotation) {
            const p = { x: offsetX, y: offsetY };
            const origin = {
              x: x + width / 2,
              y: y + height / 2
            };
            let { x: newX, y: newY } = vectorRotate(
              p,
              (item.rotation / 180) * Math.PI,
              origin
            );
            offsetX = newX;
            offsetY = newY;
          }
          return (
            offsetX >= x &&
            offsetX <= x + width &&
            offsetY >= y &&
            offsetY <= y + height
          );
        });
      }
    },
    // eventBus事件绑定/解绑
    setEventBus() {
      // this.$bus.$on(this.$keys.deleteClip, this.deleteClip);
      this.$bus.$on(this.$keys.editClip, this.editClip);
      this.$bus.$on(this.$keys.changeMonitor, this.changeMonitor); // 切换监视器
      this.$bus.$on(this.$keys.getTimeline, this.getTimeline); // 切换监视器
      // this.$bus.$on(this.$keys.afreshVideoClip, this.afreshVideoClip); // 重新添加clip, 用于修改trim
      this.$bus.$on(this.$keys.addAudioClip, this.addAudioClip); // music页，添加audio
      this.$bus.$on(this.$keys.clearAudioTrack, this.clearAudioTrack); // music页，清空音频
      this.$bus.$on(this.$keys.delCaptionSticker, this.delCaptionSticker);
      this.$bus.$on(this.$keys.seek, this.seekTimeline);
      this.$bus.$on(this.$keys.closePanel, this.closePanel);
      this.$bus.$on(this.$keys.drawBox, this.drawBox);
      this.$bus.$on(this.$keys.rebuildTimeline, this.rebuildTimeline);
    },
    // 重新构建timeline
    async rebuildTimeline() {
      await this.timelineClass.buildTimeline();
      this.timelineClass.seekTimeline();
    },
    drawBox(clip) {
      if (this.flow) {
        this.flow.initStage(clip);
      } else {
        this.flow = new WorkFlow({
          containerId: "work-flow",
          clip: clip,
          timelineClass: this.timelineClass
        });
      }
    },
    // 关闭编辑panel
    closePanel() {
      this.$bus.$emit(this.$keys.setPanel, null);
      if (this.flow) {
        this.flow.destroy();
        this.flow = null;
      }
    },
    seekTimeline(t) {
      if (!isNaN(t)) this.seekVal = t * 1;
      if (this.flow) {
        // 正在显示字幕编辑框
        console.log(this.flow);
        const { inPoint, duration } = this.flow.clip;
        if (this.seekVal < inPoint || this.seekVal >= inPoint + duration) {
          this.closePanel();
        }
      }
      this.timelineClass.seekTimeline(t);
    },
    // 删除字幕/贴纸
    async delCaptionSticker(clip) {
      await this.timelineClass.stopEngin();
      let index = -1;
      if (clip.type === CLIP_TYPES.CAPTION) {
        this.timelineClass.timeline.removeCaption(clip.raw);
        index = this.captions.findIndex(i => i.uuid === clip.uuid);
      } else if (clip.type === CLIP_TYPES.STICKER) {
        this.timelineClass.timeline.removeAnimatedSticker(clip.raw);
        index = this.stickers.findIndex(i => i.uuid === clip.uuid);
      }
      this.timelineClass.seekTimeline();
      this.deleteClipToVuex({ type: clip.type, index });
    },
    // 拖放
    drop(e) {
      const data = JSON.parse(e.dataTransfer.getData("Text"));
      this.editClip(e, data);
    },
    async clearAudioTrack() {
      await this.timelineClass.stopEngin();
      this.timelineClass.clearAudioTrack();
      this.timelineClass.seekTimeline(0);
    },
    async addAudioClip(clip) {
      let durationCumulate = 0;
      const clipOptions = { ...clip };
      const clipDuration = clipOptions.trimOut - clipOptions.trimIn;
      const timelineDuration = this.timelineClass.timeline.getDuration();
      const count = Math.ceil(timelineDuration / clipDuration);
      let audios = [];
      for (let index = 0; index < count; index++) {
        durationCumulate += clipDuration;
        clipOptions.inPoint = index * clipDuration;
        if (durationCumulate > timelineDuration) {
          clipOptions.trimOut =
            clipDuration - (durationCumulate - timelineDuration);
        }
        audios.push(new AudioClip(clipOptions));
      }
      this.addClipToVuex(audios);
      await this.timelineClass.stopEngin();
      this.timelineClass.buildAudioTrack();
      this.timelineClass.seekTimeline();
    },
    calcMaterialDuration(currentTime) {
      let inPoint = 0;
      for (let video of this.videos) {
        for (let item of video.splitList) {
          inPoint += item.captureOut - item.captureIn;
          if (inPoint > currentTime) {
            return inPoint - currentTime;
          }
        }
      }
    },
    getInPointAndDuration(t) {
      let duration;
      const v = this.videos.find(video => {
        const s = video.splitList.find(split => {
          return t >= split.captureIn && t <= split.captureOut;
        });
        if (s) {
          duration = s.captureOut - s.captureIn;
        }
        return s;
      });
      return {
        duration,
        inPoint: v.inPoint
      };
    },
    async editClip(e, option) {
      const { type, target, raw } = option;
      const currentPosition = this.timelineClass.getCurrentPosition();
      const { inPoint, duration } = this.getInPointAndDuration(currentPosition);
      if (!raw && !target) return;
      await this.timelineClass.stopEngin();
      if (raw) {
        // 修改原有的clip
      } else {
        const container = document.getElementById("live-window");
        const { x, y } = container.getBoundingClientRect();
        let targetPoint;
        if (e) {
          targetPoint = WorkFlow.aTob(
            new NvsPointF(e.clientX - x, e.clientY - y),
            this.timelineClass.liveWindow
          );
        }
        let result;
        if (type === CLIP_TYPES.STICKER) {
          const sticker = new StickerClip({
            ...target,
            inPoint,
            duration,
            desc: target.id,
            translationX: targetPoint && targetPoint.x,
            translationY: targetPoint && targetPoint.y
          });
          result = this.timelineClass.addSticker(sticker);
          this.addClipToVuex(sticker);
        } else if (type === CLIP_TYPES.CAPTION) {
          const caption = new CaptionClip({
            ...target,
            inPoint,
            duration
          });
          if (!e) {
            // 点击caption上轨
            this.timelineClass.addCaption(caption);
          } else {
            // 拖拽caption上轨
            // 计算拖拽时, caption的放置点(LiveWindow坐标系)
            const raw = this.timelineClass.timeline.addCaption(
              caption.text,
              caption.inPoint,
              this.calcMaterialDuration(currentPosition),
              caption.styleDesc,
              false
            );
            caption.raw = raw;
            const { x, y } = getCaptionCenter(raw);
            caption.translationX = targetPoint.x - x;
            caption.translationY = targetPoint.y - y;
            TimelineClass.setCaption(caption);
          }
          this.addClipToVuex(caption);
        }
        if (result) {
          this.draggingClip = null;
        }
      }
      this.timelineClass.seekTimeline();
    },
    // async deleteClip(type, index) {
    //   const { VIDEO, AUDIO } = CLIP_TYPES;
    //   await this.timelineClass.stopEngin();
    //   if ([VIDEO, AUDIO].includes(type)) {
    //     this.timelineClass.deleteClipByIndex(type, index);
    //   }
    //   this.timelineClass.seekTimeline();
    // },
    ...mapActions({
      setNvsStatus: "setNvsStatus",
      setEditBoxstatus: "setEditBoxStatus"
    }),
    async createTimeline() {
      this.timelineClass = new TimelineClass("live-window", {
        videoTrack: { clips: this.videos },
        audioTrack: { clips: this.audios },
        captions: this.captions,
        stickers: this.stickers
      });
      window.timelineClass = this.timelineClass; // 调试用
      await this.timelineClass.buildTimeline();
      this.setContextEvent(); // 绑定SDK相关事件
      this.setEventBus(); // 绑定eventBus相关事件
      this.timelineClass.seekTimeline();
      console.log("时间线创建完成", this.timelineClass);
      this.keyBind();
    },
    // 安装字体
    async installFont() {
      const res = await this.axios.get(this.$api.materials, {
        params: {
          type: 6,
          page: 0,
          pageSize: 20
        }
      });
      const fonts = res.data.materialList;
      const font = fonts.find(item => item.stringValue === DEFAULT_FONT);
      console.log(font);
      await installAsset(font.packageUrl);
    },
    // 获取工程的mediaAssets
    async getMediaAssets() {
      let { mediaAssets } = this.$route.params;
      const { id } = this.$route.query;
      if (!Array.isArray(mediaAssets)) {
        // 这不是create跳转过来的，通过id查询mediaAssets
        if (id) {
          const project = await this.axios.get(
            `${this.$api.videoProjects}/${id}`
          );
          mediaAssets = project.media_assets;
        } else {
          mediaAssets = resource.resourceList; // 测试素材
        }
      }
      return mediaAssets;
    },
    // 安装m3u8 并且更新到vuex
    async applyAssets(mediaAssets) {
      const videoList = [];
      let inPoint = 0;
      for (let i = 0; i < mediaAssets.length; i++) {
        const v = mediaAssets[i];
        const m3u8Path = await installAsset(v[`hls_${v.media_type}_url`]); // 函数内部有处理, 防止重复安装
        const video = new VideoClip({
          m3u8Path,
          inPoint,
          duration: v.media_type === "image" ? 3000000 : v.duration * 1000000,
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
        videoList.push(video);
      }
      this.initVuex({ videos: videoList }); // 将选择的video列表更新到vuex
    },
    changeMonitor(canvasId) {
      canvasId = canvasId || "live-window";
      this.timelineClass.connectLiveWindow(canvasId);
      this.$nextTick(() => {
        this.timelineClass.seekTimeline(0);
        this.seekVal = 0;
      });
    },
    getTimeline(callback) {
      if (callback) {
        callback(this.timelineClass);
      }
    },
    // async afreshVideoClip(clip) {
    //   await this.timelineClass.stopEngin();
    //   this.timelineClass.afreshVideoClip(clip);
    //   this.timelineClass.seekTimeline();
    // },
    play() {
      if (this.isPlaying) {
        this.timelineClass.stop();
      } else {
        this.timelineClass.play();
      }
      this.isPlaying = !this.isPlaying;
      if (this.flow) {
        this.flow.destroy();
        this.flow = null;
      }
    },
    playingEvent(timeline, position) {
      if (timeline === this.timelineClass.timeline) {
        this.seekVal = position;
      }
    },
    stopEvent(timeline) {
      if (timeline === this.timelineClass.timeline) {
        this.isPlaying = false;
      }
    },
    statusChangeEvent(isVideo, waiting) {
      this.waiting = waiting;
    },
    // 设置context回调事件
    setContextEvent() {
      window.streamingContext.addEventListener(
        "onPlaybackStopped",
        this.stopEvent
      );
      window.streamingContext.addEventListener(
        "onPlaybackTimelinePosition",
        this.playingEvent
      );
      window.streamingContext.addEventListener(
        "onWebRequestWaitStatusChange",
        this.statusChangeEvent
      );
    },
    getImgFromTimeline(t) {
      return new Promise((resolve, reject) => {
        this.timelineClass
          .getImgFromTimeline(t)
          .then(data => {
            const array = new Uint8Array(data);
            const blob = new Blob([array], { type: "image/png" });
            const imageUrl = URL.createObjectURL(blob);
            resolve(imageUrl);
            // const str = String.fromCharCode(...array);
            // resolve(`data:image/jpeg;base64,${window.btoa(str)}`);
          })
          .catch(reject);
      });
    }
  },
  beforeDestroy() {
    if (this.timelineClass) {
      this.timelineClass.stopEngin().then(() => {
        this.timelineClass.destroy();
      });
    }
    if (this.flow) {
      this.flow.destroy();
      this.flow = null;
    }
    this.setNvsStatus(false);
    document.body.removeEventListener("mouseup", this.statusEvent);
    window.streamingContext.removeEventListener(
      "onPlaybackStopped",
      this.stopEvent
    );
    window.streamingContext.removeEventListener(
      "onPlaybackTimelinePosition",
      this.playingEvent
    );
    window.streamingContext.removeEventListener(
      "onWebRequestWaitStatusChange",
      this.statusChangeEvent
    );
    this.$bus.$off(this.$keys.editClip, this.editClip);
    this.$bus.$off(this.$keys.changeMonitor, this.changeMonitor);
    this.$bus.$off(this.$keys.getTimeline, this.getTimeline);
    // this.$bus.$off(this.$keys.afreshVideoClip, this.afreshVideoClip);
    // this.$bus.$off(this.$keys.deleteClip, this.deleteClip);
    this.$bus.$off(this.$keys.addAudioClip, this.addAudioClip);
    this.$bus.$off(this.$keys.clearAudioTrack, this.clearAudioTrack);
    this.$bus.$off(this.$keys.delCaptionSticker, this.delCaptionSticker);
    this.$bus.$off(this.$keys.seek, this.seekTimeline);
    this.$bus.$off(this.$keys.rebuildTimeline, this.rebuildTimeline);
  }
};
</script>

<style lang="scss" scoped>
.preview {
  margin-left: 32px;
  max-width: 100%;
  height: 100%;
  aspect-ratio: 9/16;
  position: relative;
  &:hover {
    .controls {
      visibility: inherit;
      opacity: 1;
    }
  }
  .live-window-container {
    height: 100%;
    position: relative;
    width: auto;
    aspect-ratio: 9/16;
    .live-window {
      border-radius: 6px;
      border: 2px solid white;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
    }
    #work-flow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
  }
  .controls {
    bottom: 10px;
    left: 10px;
    position: absolute;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    z-index: 2010;
    width: 38px;
    height: 38px;
    cursor: pointer;
    visibility: hidden;
    opacity: 0;
    transition: all 0.2s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.3);
    }
  }
  .preview-mask {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 999;
  }
}
</style>

<i18n>
{
  "en": {
    "loadModulesFailed": "Loading Failed"
  }
}
</i18n>
