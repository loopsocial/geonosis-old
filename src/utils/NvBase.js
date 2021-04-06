import { objectStores } from "./Global";
import { initIndexDB } from "./AssetsUtils";
import EventBus from "../EventBus";
import EventBusKeys from "./EventBusKeys";

// import StreamingContext from "./StreamingContext";
// 初始化wasm
function initPlayerWasm() {
  return new Promise((resolve, reject) => {
    console.log("加载 wasm");
    const loader = WASMLoader({
      showError: reject,
      loadingFinished: resolve
    });
    loader.loadEmscriptenModule(
      `${process.env.BASE_URL}static/NvWasmPlayer_1_4_0`
    );
  });
}
// 确保wasm加载完成
function ensureMeisheModule() {
  const poll = (resolve, reject) => {
    if (Module.Meishe !== undefined) {
      resolve();
    } else {
      setTimeout(() => poll(resolve, reject), 400);
    }
  };
  return new Promise(poll);
}
// 处理FS, 创建目录
function createFSDir() {
  const dirs = FS.readdir("/");
  objectStores.map(item => {
    if (!dirs.includes(item)) {
      FS.mkdir(`/${item}`);
    }
  });
}
// SDK 鉴权
function verifySdkLicenseFile(authUrl) {
  return new Promise(resolve => {
    const streamingContext = nvsGetStreamingContextInstance();
    streamingContext.onWebRequestAuthFinish = success => {
      if (!success) console.error("SDK 鉴权失败");
      resolve(streamingContext);
    };
    streamingContext.verifySdkLicenseFile(
      authUrl || "https://testeditor.meishesdk.com:7443/app/auth"
    );
  });
}
// 添加音频上下文
function resumeAudio() {
  document.body.addEventListener("mousedown", slot);
  window.addEventListener("keydown", slot);
}
function slot() {
  console.log("调用音频上下文");
  nvsResumeAudioContext();
  document.body.removeEventListener("mousedown", slot);
  window.removeEventListener("keydown", slot);
}
function initStreamContextEvent() {
  const streamingContext = nvsGetStreamingContextInstance();

  // 播放停止的回调
  streamingContext.onPlaybackStopped = timeline => {
    EventBus.$emit(EventBusKeys.onPlaybackStopped, timeline);
  };
  // 播放中回调
  streamingContext.onPlaybackTimelinePosition = (timeline, position) => {
    EventBus.$emit(EventBusKeys.onPlaybackTimelinePosition, timeline, position);
  };
  // 生成图片的回调
  streamingContext.onImageGrabbedArrived = (imageData, time) => {
    EventBus.$emit(EventBusKeys.onImageGrabbedArrived, imageData, time);
  };
  // 播放状态发生改变的回调
  streamingContext.onWebRequestWaitStatusChange = (isVideo, waiting) => {
    EventBus.$emit(EventBusKeys.onWebRequestWaitStatusChange, isVideo, waiting);
  };
  // 资源安装完成的回调
  streamingContext.getAssetPackageManager().onFinishAssetPackageInstallation = (
    assetPackageId,
    assetPackageFilePath,
    assetPackageType,
    error
  ) => {
    EventBus.$emit(
      EventBusKeys.onFinishAssetPackageInstallation,
      assetPackageId,
      assetPackageFilePath,
      assetPackageType,
      error
    );
  };
}
export default function initSDK() {
  return new Promise((resolve, reject) => {
    if (Module.Meishe) {
      createFSDir();
      initIndexDB()
        .then(resolve)
        .catch(reject);
    } else {
      initPlayerWasm()
        .then(() => {
          return ensureMeisheModule();
        })
        .then(() => {
          createFSDir();
          // window.streamingContext = new StreamingContext();
          initStreamContextEvent();
          return initIndexDB();
        })
        .then(() => {
          resumeAudio();
          return verifySdkLicenseFile();
        })
        .then(resolve)
        .catch(reject);
    }
  });
}
