import host from "./apiHost";
// ^/ms为美摄测试用接口
// ^/fw为fw接口
// ^/fwServe 部署到loop now  https://meishe.fireworktv.net 服务器的接口

// 开发环境使用proxy代理，其他环境使用host[path]
function isDev(path) {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? `/${path}` : host[path];
}
export default {
  resources: `${isDev("ms")}/resource/list`,
  materials: `${isDev("ms")}/material/list`,
  msSts: `${isDev("ms")}/upload/sts/info`,
  msUpload: `${isDev("ms")}/upload/files`,

  videoCreate: `${isDev("fwServe")}/bs/video/create`, // 发起合成任务
  jobInfo: `${isDev("fwServe")}/bs/job/info`, // 查询任务

  soundTracks: `${isDev("fw")}/api/soundtracks`,

  videoProjects: `${isDev("fw")}/studio/video_projects`,
  videoProjectById: id => `${isDev("fw")}/studio/video_projects/${id}`,
  mediaAssets: `${isDev("fw")}/studio/media_assets`,

  mediaAssetsUploadComplete: id =>
    `${isDev("fw")}/studio/media_assets/${id}/upload_completed`
};
