import { getNameFromUrl } from "./common";
import { objectStores, assetTypes, needInstall } from "./Global";
import axios from "axios";
import store from "../store";

const name = "nvBSEditorAssets";
const version = 1;
let db;
// 初始化indexDB
export function initIndexDB() {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(name, version);
    request.onerror = e => {
      reject("open index db error!", e);
    };
    request.onsuccess = function(e) {
      db = e.target.result;
      console.log("index db version:" + db.version);
      resolve(db);
    };
    request.onupgradeneeded = function(e) {
      console.log("DB version changed to " + version);
      const ret = e.target.result;
      objectStores.map(item => {
        ensureAssetIndexDBObject(ret, item);
      });
    };
  });
}
// 确保底层SDK加载完成
function ensureMeisheModule() {
  const poll = (resolve, reject) => {
    if (store.state.isFinishNvs) {
      resolve();
    } else {
      setTimeout(() => poll(resolve, reject), 400);
    }
  };
  return new Promise(poll);
}
function ensureAssetIndexDBObject(ret, name) {
  if (!ret.objectStoreNames.contains(name)) {
    ret.createObjectStore(name, { keyPath: "id" });
  }
}
/**
 * 获取资源包对应的IndexDB StoreName
 * @param {string} key 资源包的名称 例如:E6AD8162-1394-44F5-BA22-6402C828B12F.2.captionstyle
 */
function getStoreName(key) {
  let storeName;
  if (key.toLowerCase().search(/ttc|ttf|otf$/) > -1) {
    storeName = "font";
  } else {
    storeName = objectStores.find(item => key.toLowerCase().includes(item));
  }
  return storeName;
}
/**
 * 保存资源到IndexDB
 * @param {string} packageUrl 需要保存的资源地址  例如:https://xx.com/E6AD8162-1394-44F5-BA22-6402C828B12F.2.captionstyle?a=1
 * @param {*} value 资源包的内容
 */
export function saveAssetToIndexDB(packageUrl, value) {
  const key = getNameFromUrl(packageUrl); // E6AD8162-1394-44F5-BA22-6402C828B12F.2.captionstyle
  const storeName = getStoreName(key); // captionstyle
  const uuid = key.split(".").shift(); // E6AD8162-1394-44F5-BA22-6402C828B12F
  if (db !== undefined && db.objectStoreNames.contains(storeName)) {
    var transaction = db.transaction(storeName, "readwrite");
    var store = transaction.objectStore(storeName);
    store.put({ id: uuid, name: key, data: value });
  } else {
    console.error(storeName + " is not prepared while adding data ----", key);
  }
}
/**
 * 从IndexDB中获取资源数据
 * @param {string} packageUrl 资源地址
 */
export function getAssetFromIndexDB(packageUrl) {
  const key = getNameFromUrl(packageUrl);
  return new Promise(resolve => {
    const storeName = getStoreName(key);
    const id = key.split(".").shift();
    let transaction = db.transaction(storeName, "readwrite");
    let store = transaction.objectStore(storeName);
    let request = store.get(id);
    request.onsuccess = e => {
      const ret = e.target.result;
      resolve(ret ? ret.data : "");
    };
    request.onerror = () => {
      resolve("");
    };
  });
}
/**
 * 从网络中下载资源数据, 并保存到IndexDB中
 * @param {string} packageUrl 资源地址
 */
export function getAssetFromNetwork(packageUrl) {
  return new Promise((resolve, reject) => {
    axios
      .get(packageUrl, { responseType: "arraybuffer" })
      .then(res => {
        saveAssetToIndexDB(packageUrl, new Uint8Array(res.data));
        resolve(new Uint8Array(res.data));
      })
      .catch(e => {
        reject(e);
      });
  });
}
/**
 *
 * @param {string} packageUrl 资源包的地址
 * @param {boolean} checkLic 是否验证授权
 */
export async function installAsset(packageUrl, checkLic) {
  return new Promise((resolve, reject) => {
    ensureMeisheModule()
      .then(() => {
        return getAssetFromIndexDB(packageUrl);
      })
      .then(data => {
        if (data) return data;
        return getAssetFromNetwork(packageUrl);
      })
      .then(async data => {
        if (!data) {
          reject(new Error("get asset fail. " + packageUrl));
        }
        const key = getNameFromUrl(packageUrl);
        const storeName = getStoreName(key);
        const uuid = key.split(".").shift();
        const filePath = `/${storeName}/${key}`;
        FS.writeFile(filePath, data);
        if (storeName === "font") {
          const fontFamily = nvsGetStreamingContextInstance().registerFontByFilePath(
            filePath
          );
          resolve(fontFamily);
        } else if (storeName === "m3u8") {
          resolve(filePath);
        } else if (needInstall.includes(storeName)) {
          const status = window.streamingContext.streamingContext
            .getAssetPackageManager()
            .getAssetPackageStatus(uuid, assetTypes[storeName]);
          if (status === NvsAssetPackageStatusEnum.NotInstalled) {
            let licPath = "";
            if (checkLic) {
              // 是否需要授权
              const data = await getAssetFromIndexDB(`${uuid}.lic`);
              if (data) {
                licPath = `lic/${uuid}.lic`;
                FS.writeFile(licPath);
              }
            }
            window.streamingContext.addEventListener(
              "onFinishAssetPackageInstallation",
              function slot(id, path, type, error) {
                if (id !== uuid) return;
                window.streamingContext.removeEventListener(
                  "onFinishAssetPackageInstallation",
                  slot
                );
                try {
                  // 安装完成后删除FS内的文件
                  FS.unlink(path, 0);
                  if (licPath) FS.unlink(licPath, 0);
                } catch (error) {
                  console.log("FS 删除失败", path, licPath);
                }
                if (error === 0) resolve(filePath);
                else {
                  reject(new Error(`资源安装失败${filePath} 错误码: ${error}`));
                }
              }
            );
            window.streamingContext.streamingContext
              .getAssetPackageManager()
              .installAssetPackage(filePath, licPath, assetTypes[storeName]);
          } else {
            resolve(filePath);
          }
        }
      })
      .catch(reject);
  });
}
