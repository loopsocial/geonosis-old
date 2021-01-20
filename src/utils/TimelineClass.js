export default class TimelineClass extends NvsTimeline {
  constructor(streamingContext, canvasId, options) {
    super();
    this.streamingContext = streamingContext;
    this.timeline = null;
    this.canvasId = canvasId;
    if (options) {
      const { tracks, width, height, captions, stickers } = options;
      this.tracks = tracks || [];
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
    const liveWindow = this.streamingContext.createLiveWindow(
      canvasId || this.canvasId
    );
    liveWindow.setFillMode(NvsLiveWindowFillModeEnum.PreserveAspectFit);
    this.streamingContext.connectTimelineWithLiveWindow(
      this.timeline,
      liveWindow
    );
    return liveWindow;
  }
  async play() {
    nvsResumeAudioContext();
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
    this.createTimeline()
    const liveWindow = this.connectLiveWindow();

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
    captionRaw.setScaleX(scaleX);
    captionRaw.setScaleY(scaleY);
    captionRaw.setRotationZ(rotation);
    const offsetPointF = new NvsPointF(translationX, translationY);
    captionRaw.setCaptionTranslation(offsetPointF);
    captionRaw.setFontSize(fontSize);
  }
}
