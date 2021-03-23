import api from "../api/apiPath";
// 上传，目前上传到美摄服务器（本地上传），用于测试
export function uploadToMS(file) {
  const params = {
    type: 5,
    extension: "xml",
    isNeedCallback: 0,
    uploadModule: "temp",
    projectId: 8357,
    isDir: 0
  };
  const stsUrl = api.msSts;
  const uploadUrl = api.msUpload;
  return axios
    .post(stsUrl, params)
    .then(r => {
      file =
        file instanceof Blob ? file : new File([file], { type: "text/plain" });
      const data = new FormData();
      data.append("files", file);
      data.append("keys", r.data.relativePath);
      return axios.post(uploadUrl, data);
    })
    .then(r => {
      return r.data.urls[0];
    });
}
function isFileTypeImage(file) {
  return file.type.startsWith("image");
}
function isFileTypeVideo(file) {
  return file.type.startsWith("video");
}
function getSignature(file) {
  const payload = {};
  if (isFileTypeImage(file)) {
    payload.image = { filename: file.name, mime_type: file.type };
  }
  if (isFileTypeVideo(file)) {
    payload.video = { filename: file.name, mime_type: file.type };
  }
  return axios.post(api.mediaAssets, payload);
}

export function uploadToS3(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    try {
      getSignature(file).then(response => {
        let signature = null;
        if (response.image_signature !== null) {
          signature = response.image_signature;
        } else if (response.video_signature !== null) {
          signature = response.video_signature;
        }
        const xhr = new global.XMLHttpRequest();
        xhr.open("PUT", signature.put_url);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = event => {
          const progress = Math.round((event.loaded * 100) / event.total);
          onProgress(progress);
        };

        xhr.onload = () => {
          if (xhr.status !== 200) {
            return reject(xhr);
          }
          resolve({
            media_asset_id: response.media_asset.id,
            key: signature.key,
            url: `${signature.action}/${signature.key}`
          });
        };
        xhr.onerror = () => reject(xhr);
        xhr.send(file);
      });
    } catch (error) {
      reject(error);
    }
  });
}
