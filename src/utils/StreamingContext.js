export default class StreamingContext {
  constructor() {
    this.streamingContext = nvsGetStreamingContextInstance();
    this.onPlaybackStopped = []; // 播放停止的回调列表
    this.onPlaybackTimelinePosition = []; // 播放过程中的回调列表
    this.onFinishAssetPackageInstallation = []; // 安装资源 完成的回调列表
    this.onImageGrabbedArrived = []; // 生成图片的回调列表
    this.onWebRequestWaitStatusChange = []; // 播放器加载状态改变的回调
    this.setEvents();
  }
  setEvents() {
    // 播放停止的回调
    this.streamingContext.onPlaybackStopped = timeline => {
      this.onPlaybackStopped.map(fn => {
        fn(timeline);
      });
    };
    // 播放中回调
    this.streamingContext.onPlaybackTimelinePosition = (timeline, position) => {
      this.onPlaybackTimelinePosition.map(fn => {
        fn(timeline, position);
      });
    };
    // 生成图片的回调
    this.streamingContext.onImageGrabbedArrived = (imageData, time) => {
      this.onImageGrabbedArrived.map(fn => {
        fn(imageData, time);
      });
    };
    // 播放状态发生改变的回调
    this.streamingContext.onWebRequestWaitStatusChange = (isVideo, waiting) => {
      this.onWebRequestWaitStatusChange.map(fn => {
        fn(isVideo, waiting);
      });
    };
    // 资源安装完成的回调
    this.streamingContext.getAssetPackageManager().onFinishAssetPackageInstallation = (
      assetPackageId,
      assetPackageFilePath,
      assetPackageType,
      error
    ) => {
      this.onFinishAssetPackageInstallation.map(fn => {
        fn(assetPackageId, assetPackageFilePath, assetPackageType, error);
      });
    };
  }
  addEventListener(event, callback) {
    if (this[event] && callback) {
      this[event].push(callback);
      console.log("添加事件", event, this[event]);
    } else {
      console.warn("添加事件监听失败", event, callback);
    }
  }
  removeEventListener(event, callback) {
    if (this[event] && callback) {
      const index = this[event].indexOf(callback);
      if (index > -1) {
        this[event].splice(index, 1);
      } else {
        console.warn(`这个回调函数不在${event}内`);
      }
    } else {
      console.warn("添加事件监听失败", event, callback);
    }
  }
  // 清空回调事件, 传参的话只清空这个事件, 不传的话清空全部事件
  clearEvents(event) {
    if (event && this[event]) {
      this[event] = [];
    } else {
      this.streamingContext = nvsGetStreamingContextInstance();
      this.onPlaybackStopped = [];
      this.onPlaybackTimelinePosition = [];
      this.onFinishAssetPackageInstallation = [];
      this.onImageGrabbedArrived = [];
      this.onWebRequestWaitStatusChange = [];
    }
  }
}
