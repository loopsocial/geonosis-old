export default class TimelineClass {
  constructor(canvasId, options) {
    this.streamingContext = nvsGetStreamingContextInstance();
    this.timeline = null;
    this.canvasId = canvasId;
    const { videoTrack, audioTrack, width, height, captions, stickers } =
      options || {};
    this.videoTrack = videoTrack || {};
    this.audioTrack = audioTrack || {};
    this.width = width || 540;
    this.height = height || 960;
    this.captions = captions || [];
    this.stickers = stickers || [];
    this.init();
  }
  // 初始化
  async init() {
    await this.createTimeline();
    this.connectLiveWindow();
  }
  // 创建时间线实例
  async createTimeline() {
    await this.stopEngin();
    if (!this.streamingContext) {
      console.error("stream context is null");
      return;
    }
    const resolution = new NvsVideoResolution(this.width, this.height);
    this.timeline = this.streamingContext.createTimeline(
      resolution,
      new NvsRational(25, 1),
      new NvsAudioResolution(44100, 2)
    );
    if (this.timeline) {
      console.log("初始化时间线完成");
    } else {
      console.warn("时间线创建失败");
    }
  }
  connectLiveWindow(canvasId) {
    if (this.liveWindow) {
      this.streamingContext.removeLiveWindow(this.liveWindow);
    }
    this.liveWindow = this.streamingContext.createLiveWindow(
      canvasId || this.canvasId
    );
    this.liveWindow.setFillMode(NvsLiveWindowFillModeEnum.PreserveAspectFit);
    this.streamingContext.connectTimelineWithLiveWindow(
      this.timeline,
      this.liveWindow
    );
    console.log("连接liveWindow完成");
  }
  // 构建时间线
  async buildTimeline() {
    await this.streamingContext.streamingEngineReadyForTimelineModification();
    this.clearVideoTrack();
    this.clearAudioTrack();
    this.clearCaptions();
    this.clearStickers();
    this.buildVideoTrack();
    this.buildAudioTrack();
    this.captions.map(c => this.addCaption(c));
    this.stickers.map(s => this.addSticker(s));
  }
  async play(t) {
    t = t === undefined ? this.getCurrentPosition() : t;
    this.streamingContext.playbackTimeline(
      this.timeline,
      t,
      -1,
      NvsVideoPreviewSizeModeEnum.LiveWindowSize,
      true,
      0
    );
  }
  isPlaying() {
    const streamingEngineState = this.streamingContext.getStreamingEngineState();
    return (
      streamingEngineState ===
      NvsStreamingEngineStateEnum.StreamingEngineStatePlayback
    );
  }
  stop() {
    this.streamingContext.stop();
  }
  removeLiveWindow(liveWindow) {
    this.streamingContext.removeLiveWindow(liveWindow);
  }
  removeTimeline() {
    this.streamingContext.removeTimeline(this.timeline);
  }
  stopEngin() {
    return this.streamingContext.streamingEngineReadyForTimelineModification();
  }
  seekTimeline(t) {
    t =
      t === undefined
        ? this.getCurrentPosition()
        : Math.min(t, this.timeline.getDuration());
    this.streamingContext.seekTimeline(
      this.timeline,
      t,
      NvsVideoPreviewSizeModeEnum.LiveWindowSize,
      NvsSeekFlagEnum.ShowCaptionPoster |
        NvsSeekFlagEnum.ShowAnimatedStickerPoster
    );
  }
  getCurrentPosition() {
    return this.streamingContext.getTimelineCurrentPosition(this.timeline);
  }
  buildVideoTrack() {
    if (!this.videoTrack.raw) {
      this.videoTrack.raw = this.timeline.appendVideoTrack();
    }
    if (Array.isArray(this.videoTrack.clips)) {
      this.videoTrack.clips.map(clip => {
        clip.raw = this.addVideoClip(clip, this.videoTrack.raw);
      });
    }
  }
  // 重新添加一次clip
  afreshVideoClip(clip) {
    const index = clip.raw.getIndex();
    this.videoTrack.raw.removeClip(index, false);
    this.addVideoClip(clip, this.videoTrack.raw);
  }
  buildAudioTrack() {
    if (!this.audioTrack.raw) {
      this.audioTrack.raw = this.timeline.appendAudioTrack();
    }
    if (Array.isArray(this.audioTrack.clips)) {
      this.audioTrack.clips.map(clip => {
        clip.raw = this.addAudioClip(clip, this.videoTrack.raw);
      });
    }
  }
  addCaption(caption) {
    const {
      text,
      inPoint,
      duration,
      styleDesc,
      fontSize,
      scaleX,
      scaleY,
      rotation,
      translationX,
      translationY
    } = caption;
    const captionRaw = this.timeline.addCaption(
      text,
      inPoint,
      duration,
      styleDesc,
      false
    );
    if (!captionRaw) {
      console.warn("caption add fail", caption);
      return;
    }
    const { x, y } = getCenter(captionRaw);
    caption.raw = captionRaw;
    this.captions.push(caption); // 可能需要改成按照inPoint进行插入
    scaleX !== undefined && captionRaw.setScaleX(scaleX);
    scaleY !== undefined && captionRaw.setScaleY(scaleY);
    rotation !== undefined && captionRaw.setRotationZ(rotation);
    const offsetPointF = new NvsPointF(translationX - x, translationY - y);
    captionRaw.setCaptionTranslation(offsetPointF);
    fontSize !== undefined && captionRaw.setFontSize(fontSize);
    return captionRaw;
  }
  addSticker(sticker) {
    const {
      inPoint,
      duration,
      desc,
      scale,
      rotation,
      translationX,
      translationY,
      horizontalFlip,
      verticalFlip,
      z
    } = sticker;
    console.log("添加贴纸", sticker);
    const stickerRaw = this.timeline.addAnimatedSticker(
      inPoint,
      duration,
      desc + "",
      false,
      false,
      ""
    );
    if (!stickerRaw) {
      console.warn("sticker add fail", sticker);
      return false;
    }
    sticker.raw = stickerRaw;
    this.stickers.push(sticker); // 可能需要改成按照inPoint进行插入
    scale !== undefined && stickerRaw.setScale(scale);
    rotation !== undefined && stickerRaw.setRotationZ(rotation);
    if (translationX !== undefined && translationX !== undefined) {
      const offsetPointF = new NvsPointF(translationX, translationY);
      stickerRaw.setTranslation(offsetPointF);
    }
    horizontalFlip !== undefined &&
      stickerRaw.setHorizontalFlip(horizontalFlip);
    verticalFlip !== undefined && stickerRaw.setVerticalFlip(verticalFlip);
    z !== undefined && stickerRaw.setZValue(z);
    return true;
  }
  addVideoClip(clip, trackRaw) {
    const { m3u8Path, inPoint, trimIn, trimOut, orgDuration } = clip;
    return trackRaw.addClip2(
      m3u8Path,
      inPoint,
      trimIn || 0,
      trimOut || orgDuration
    );
  }
  deleteClipByIndex(type, index) {
    this[`${type}Track`].raw.removeClip(index, false);
  }
  addAudioClip(clip, trackRaw) {
    const { m3u8Path, inPoint, trimIn, trimOut, orgDuration } = clip;
    return trackRaw.addClip2(
      m3u8Path,
      inPoint,
      trimIn || 0,
      trimOut || orgDuration
    );
  }
  clearCaptions() {
    let caption = this.timeline.getFirstCaption();
    while (caption) {
      caption = this.timeline.removeCaption(caption);
    }
  }
  clearStickers() {
    let sticker = this.timeline.getFirstAnimatedSticker();
    while (sticker) {
      sticker = this.timeline.removeAnimatedSticker(sticker);
    }
  }
  clearVideoTrack() {
    while (this.timeline.videoTrackCount() !== 0) {
      this.timeline.removeVideoTrack(0);
    }
  }
  clearAudioTrack() {
    while (this.timeline.audioTrackCount() !== 0) {
      this.timeline.removeAudioTrack(0);
    }
  }
  destroy() {
    if (this.isPlaying) this.stop();
    this.liveWindow && this.removeLiveWindow(this.liveWindow);
    this.removeTimeline();
  }
  getImgFromTimeline(point) {
    return new Promise((resolve, reject) => {
      window.streamingContext.addEventListener(
        "onImageGrabbedArrived",
        function slot(data) {
          window.streamingContext.removeEventListener(
            "onImageGrabbedArrived",
            slot
          );
          resolve(data);
        }
      );
      setTimeout(() => {
        reject(new Error("Get cover timeout"));
      }, 5000);
      this.streamingContext.grabImageFromTimeline(
        this.timeline,
        point || 0,
        new NvsRational(1, 1),
        0
      );
    });
  }
}
// 字幕放置到中心点
function getCenter(captionRaw) {
  const vertices = captionRaw.getBoundingRectangleVertices();
  const p1 = vertices.get(0);
  // const p2 = vertices.get(1);
  const p3 = vertices.get(2);
  // const p4 = vertices.get(3);
  return {
    x: (p1.x + p3.x) / 2,
    y: (p3.y + p1.y) / 2
  };
}
