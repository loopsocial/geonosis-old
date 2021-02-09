import { objectStores } from "./Global";
import { initIndexDB } from "./AssetsUtils";
import StreamingContext from "./StreamingContext";
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
      authUrl || "https://eapi.meishesdk.com:7443/app/auth"
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
          window.streamingContext = new StreamingContext();
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
