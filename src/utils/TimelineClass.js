export default class TimelineClass {
  constructor(canvasId, options) {
    this.streamingContext = nvsGetStreamingContextInstance();
    this.timeline = null;
    this.canvasId = canvasId;
    if (options) {
      const {
        videoTrack,
        audioTrack,
        width,
        height,
        captions,
        stickers
      } = options;
      this.videoTrack = videoTrack || {};
      this.audioTrack = audioTrack || {};
      this.width = width || 540;
      this.height = height || 960;
      this.captions = captions || [];
      this.stickers = stickers || [];
    }
    this.init();
  }
  // 初始化
  init() {
    this.createTimeline();
    this.connectLiveWindow();
  }
  // 创建时间线实例
  createTimeline() {
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
    console.log("初始化时间线完成");
  }
  connectLiveWindow(canvasId) {
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
  async play() {
    console.log("timeline class 播放!!", this.timeline, NvsVideoPreviewSizeModeEnum.LiveWindowSize);
    this.streamingContext.playbackTimeline(
      this.timeline,
      0,
      -1,
      NvsVideoPreviewSizeModeEnum.LiveWindowSize,
      true,
      0
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
    scaleX !== undefined && captionRaw.setScaleX(scaleX);
    scaleY !== undefined && captionRaw.setScaleY(scaleY);
    rotation !== undefined && captionRaw.setRotationZ(rotation);
    if (translationX !== undefined && translationX !== undefined) {
      const offsetPointF = new NvsPointF(translationX, translationY);
      captionRaw.setCaptionTranslation(offsetPointF);
    }
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
    const stickerRaw = this.timeline.addAnimatedSticker(
      inPoint,
      duration,
      desc + "",
      false,
      false,
      ""
    );
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
  destroyed() {
    this.liveWindow && this.removeLiveWindow(this.liveWindow);
    this.removeTimeline();
  }
}
