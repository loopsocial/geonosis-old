export default class TimelineClass extends NvsTimeline {
  constructor(streamingContext, canvasId, options) {
    super();
    this.streamingContext = streamingContext;
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
  }
  createTimeline(width, height) {
    if (!this.streamingContext) {
      console.error("stream context is null");
      return;
    }
    const resolution = new NvsVideoResolution(
      width || this.width,
      height || this.height
    );
    this.timeline = this.streamingContext.createTimeline(
      resolution,
      new NvsRational(25, 1),
      new NvsAudioResolution(44100, 2)
    );
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
  }
  async play() {
    await this.streamingContext.streamingEngineReadyForTimelineModification();
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
  run() {
    this.createTimeline();
    this.connectLiveWindow();
    this.buildTrack();
  }
  buildVideoTrack() {
    if (!this.videoTrack.raw) {
      this.videoTrack.raw = this.timeline.appendVideoTrack();
    }
    this.videoTrack.clips.map(clip => {
      clip.raw = this.addVideoClip(clip, this.videoTrack.raw);
    });
  }
  buildAudioTrack() {
    if (!this.audioTrack.raw) {
      this.audioTrack.raw = this.timeline.appendAudioTrack();
    }
    this.audioTrack.clips.map(clip => {
      clip.raw = this.addAudioClip(clip, this.videoTrack.raw);
    });
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
}
