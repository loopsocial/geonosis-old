// 上传，目前上传到美摄服务器（本地上传），用于测试
export default function upload(file) {
  const params = {
    type: 5,
    extension: "xml",
    isNeedCallback: 0,
    uploadModule: "temp",
    projectId: 8357,
    isDir: 0
  };
  const stsUrl = "https://testeapi.meishesdk.com:8443/upload/sts/info";
  const uploadUrl = "https://testeapi.meishesdk.com:8443/upload/files";
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
