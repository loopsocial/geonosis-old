<template>
  <div class="preview" @drop.prevent="drop" @dragover.prevent>
    <div
      class="live-window-container"
      v-loading="waiting"
      ref="liveWindowContainer"
      element-loading-background="rgba(0, 0, 0, 0.5)"
    >
      <canvas
        ref="liveWindow"
        class="live-window"
        id="live-window"
        :width="liveWindowStyle.width"
        :height="liveWindowStyle.height"
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
import { writeXml, readProjectXml } from "@/utils/XmlUtils";
import getDefaultAsset from "@/utils/getDefaultAsset";

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
      flow: null,
      liveWindowStyle: {
        width: 0,
        height: 0
      }
    };
  },
  async mounted() {
    addEventListener("resize", this.calcLivewindowStyle);
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
      try {
        // 读取并安装asset/styleAssets下的captionstyle
        await getDefaultAsset();
        await this.installFont(); // 安装字体
      } catch (error) {
        console.warn("字体安装失败");
      }
      const { mediaAssets, xml } = await this.getProjectInfo(); // 获取media assets（依次是：路由参数、查询档案信息、测试素材）
      console.log("media-assets", mediaAssets);
      await this.applyAssetsXml(mediaAssets, xml); // 更新vuex 安装并应用素材
      this.updateProject();
      this.changeVuexLoaded(true);
    } else {
      await this.$nextTick();
    }
    console.log("创建时间线");
    this.setEventBus(); // 绑定eventBus相关事件
    await this.createTimeline();
    document.body.addEventListener("mouseup", this.statusEvent);
    this.$emit("on-loaded");
    this.setProjectStatus(true); // 工程加载完成
    this.calcLivewindowStyle(); // 计算a/b倍数
  },
  computed: {
    ...mapState({
      editBoxStatus: "editBoxStatus"
    })
  },
  methods: {
    calcLivewindowStyle() {
      if (!this.timelineClass) return null;
      const liveWindowContainer = document.body.querySelector(
        ".live-window-container"
      );
      this.liveWindowStyle.width = liveWindowContainer.offsetWidth;
      this.liveWindowStyle.height = liveWindowContainer.offsetHeight;
      const bWidth =
        -WorkFlow.aTob(new NvsPointF(0, 0), this.timelineClass.liveWindow).x *
        2;
      const ABTimes = this.liveWindowStyle.width / bWidth;
      window.ABTimes = ABTimes;
    },
    // 更新工程。初始化档案时；添加、删除素材时调用
    async updateProject(callback) {
      const { id: projectId } = this.$route.query;
      if (!projectId) {
        if (typeof callback === "function") callback(false);
        return;
      }
      try {
        const mediaIds = this.videos.reduce((ids, v) => {
          if (typeof v.id === "string") ids.push(v.id);
          return ids;
        }, []);
        writeXml("project.xml");
        const xml = FS.readFile("project.xml", { encoding: "utf8" });
        const r = await this.axios.put(
          this.$api.videoProjects + `/${projectId}`,
          {
            media_asset_ids: mediaIds,
            dom_xml: xml
          }
        );
        if (typeof callback === "function") callback(true);
        console.log("保存成功", r);
      } catch (error) {
        if (typeof callback === "function") callback(false);
        console.error("保存失败", error);
      }
    },
    statusEvent() {
      setTimeout(() => {
        this.setEditBoxstatus(false);
      });
    },
    // 点击livewindow, 是否显示操作转换框
    clickLiveWindow(e) {
      // 注释部分用来测试，只是为了看坐标系转换时计算是否正确
      //       const { offsetX, offsetY } = e;
      //       let v = WorkFlow.aTob(
      //         new NvsPointF(offsetX, offsetY),
      //         this.timelineClass.liveWindow
      //       );
      //       console.log(`canvas X ${offsetX} Y ${offsetY}
      // live window X:${v.x} Y:${v.y}`);
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
      this.$bus.$on(this.$keys.updateProject, this.updateProject);
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
      const clipOptions = { ...clip, url: clip.file_url };
      let audios = [];
      const timelineDuration = this.timelineClass.timeline.getDuration();
      const clipDuration = clipOptions.orgDuration;

      if (clipOptions.inPoint > 0) {
        /**
         *                      \---------------\
         **      \--------------\---------------\----------------\
         *                      \---------------\
         *   视频起始点      音频起始点       音频结束点       视频结束点
         *
         *   如果第一段音频入点在视频内，此时 起始音频 inPoint 非 0
         */
        let durationCumulate = clipOptions.inPoint;
        const count = Math.ceil(
          (timelineDuration - clipOptions.inPoint) / clipDuration
        );
        for (let index = 0; index < count; index++) {
          durationCumulate += clipDuration;
          index >= 1 && (clipOptions.inPoint = durationCumulate);
          if (durationCumulate > timelineDuration) {
            /**
             *                      \------------------\
             **      \--------------\--------\         \
             *                      \------------------\
             *   视频起始点      音频起始点   视频结束点  音频结束点
             *
             */
            clipOptions.trimOut =
              clipDuration - (durationCumulate - timelineDuration);
          }

          clipOptions.duration = clipOptions.trimOut - clipOptions.trimIn;
          audios.push(new AudioClip(clipOptions));
        }
      } else {
        /**
         *       \------------------------------\
         **      \              \---------------\----------------\
         *       \------------------------------\
         *   音频起始点      视频起始点        音频结束点         视频结束点
         *
         *    如果视频起点在音频内，此时起始段音频 trimIn 非 0
         *
         */
        let durationCumulate = 0;
        while (durationCumulate < timelineDuration) {
          if (durationCumulate === 0) {
            // 起始段音频 trimIn 非 0 需要单独处理
            durationCumulate = clipOptions.trimOut - clipOptions.trimIn;
            if (durationCumulate > timelineDuration) {
              /**
               *       \----------------------------------\
               **      \         \---------------\        \
               *       \----------------------------------\
               *   音频起始点   视频起始点    视频结束点    音频结束点
               *
               *  如果起始段音频 裁剪后duration 超过视频长度，即说明音频只播放一次（音频为被截取部分），需修改 trimOut 使其和视频结尾时长相符
               *
               */
              clipOptions.trimOut = timelineDuration + clipOptions.trimIn;
            }
          } else {
            // 后面音频循环部分处理
            clipOptions.trimIn = 0;
            clipOptions.inPoint = durationCumulate;
            durationCumulate += clipDuration;

            if (durationCumulate > timelineDuration) {
              clipOptions.trimOut =
                clipDuration - (durationCumulate - timelineDuration);
            }
          }

          clipOptions.duration = clipOptions.trimOut - clipOptions.trimIn;
          audios.push(new AudioClip(clipOptions));
        }
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
      let durationCumulate = 0;
      for (let video of this.videos) {
        for (let item of video.splitList) {
          const duration = item.captureOut - item.captureIn - 1;
          if (durationCumulate + duration >= t) {
            return {
              duration,
              inPoint: durationCumulate
            };
          }
          durationCumulate += item.captureOut - item.captureIn;
        }
      }
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
          this.flow = new WorkFlow({
            containerId: "work-flow",
            clip: sticker,
            timelineClass: this.timelineClass
          });
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
          this.flow = new WorkFlow({
            containerId: "work-flow",
            clip: caption,
            timelineClass: this.timelineClass
          });
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
      setEditBoxstatus: "setEditBoxStatus",
      setProjectStatus: "setProjectStatus"
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
      await installAsset(font.packageUrl);
    },
    // 获取工程的mediaAssets
    async getProjectInfo() {
      const { id } = this.$route.query;
      let mediaAssets;
      let xml;
      // 这不是create跳转过来的，通过id查询mediaAssets
      try {
        if (id) {
          const project = await this.axios.get(
            `${this.$api.videoProjects}/${id}`
          );
          mediaAssets = project.media_assets;
          xml = project.dom_xml;
        } else {
          mediaAssets = resource.resourceList; // 测试素材
        }
      } catch (error) {
        console.error("获取工程信息失败, 使用测试素材", error);
        mediaAssets = resource.resourceList; // 测试素材
      }
      return { mediaAssets, xml };
    },
    // 安装m3u8 并且更新到vuex
    async applyAssetsXml(mediaAssets, xml) {
      let timelineData = {};
      if (xml) {
        FS.writeFile("project.xml", xml);
        const data = await readProjectXml("project.xml");
        timelineData = await this.installMedia(mediaAssets, data);
        console.log("工程解析后数据", timelineData);
      } else {
        // 没有xml的时候，表示新选择的素材创建工程
        timelineData.videos = await this.applyAssets(mediaAssets);
      }
      this.initVuex(timelineData); // 将选择的video列表更新到vuex
    },
    // 安装音视频的m3u8，并且更新封面、缩率图、原始视频等
    async installMedia(mediaAssets, data) {
      const videos = [];
      for (let i = 0; i < data.videos.length; i++) {
        const video = data.videos[i];
        const media = mediaAssets.find(item => `${item.id}` == `${video.id}`);
        if (media) {
          video.url = media[`${media.media_type}_url`];
          video.videoType = media.media_type;
          video.m3u8Url = media[`hls_${media.media_type}_url`];
          video.coverUrl = media.thumbnail_url || media.coverUrl;
          video.thumbnails = media.thumbnails;
          video.m3u8Path = await installAsset(video.m3u8Url);
          video.duration =
            media.media_type === "image" ? 3000000 : media.duration * 1000000;
          video.orgDuration =
            media.media_type === "image" ? 3000000 : media.duration * 1000000;
          videos.push(new VideoClip(video));
        } else {
          console.log("工程内没有这个素材", video.id);
        }
      }
      return { ...data, videos };
    },
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
      return videoList;
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
    removeEventListener("resize", this.calcLivewindowStyle);
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
    this.$bus.$off(this.$keys.updateProject, this.updateProject);
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
