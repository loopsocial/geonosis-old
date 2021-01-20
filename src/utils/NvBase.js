function initPlayerWasm() {
  return new Promise((resolve, reject) => {
    console.warn(`${process.env.BASE_URL}static/NvWasmPlayer_1_4_0`);
    const loader = WASMLoader({
      showError: reject,
      loadingFinished: resolve
    });
    loader.loadEmscriptenModule(
      `${process.env.BASE_URL}static/NvWasmPlayer_1_4_0`
    );
  });
}
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
// 处理indexDB
function prepareAssetIndexDB() {
  return new Promise((resolve, reject) => {
    // ....
    resolve();
  });
}
// 处理FS, 创建目录
function createFSDir() {
  FS.mkdir("/m3u8");
  FS.mkdir("/caption");
  FS.mkdir("/sticker");
}
// SDK 鉴权
function verifySdkLicenseFile(authUrl) {
  return new Promise(resolve => {
    const streamingContext = nvsGetStreamingContextInstance();
    streamingContext.onWebRequestAuthFinish = success => {
      if (success) console.error("SDK 鉴权失败");
      resolve(streamingContext);
    };
    streamingContext.verifySdkLicenseFile(
      authUrl || "https://eapi.meishesdk.com:7443/app/auth"
    );
  });
}

export default function initSDK() {
  return new Promise((resolve, reject) => {
    initPlayerWasm()
      .then(() => {
        return ensureMeisheModule();
      })
      .then(() => {
        createFSDir();
        return prepareAssetIndexDB();
      })
      .then(() => {
        return verifySdkLicenseFile();
      })
      .then(resolve)
      .catch(reject);
  });
}
