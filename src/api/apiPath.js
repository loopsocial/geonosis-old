// ^/ms为美摄测试用接口
// ^/fw为fw接口
// ^/fwServe 部署到loop now服务器的接口
function p(path) {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction ? "" : `/${path}`;
}
export default {
  resources: `${p("ms")}/resource/list`,
  materials: `${p("ms")}/material/list`,
  msSts: `${p("ms")}/upload/sts/info`,
  msUpload: `${p("ms")}/upload/files`,

  videoCreate: `${p("fwServe")}/bs/video/create`, // 发起合成任务
  jobInfo: `${p("fwServe")}/bs/job/info`, // 查询任务

  soundTracks: `${p("fw")}/api/soundtracks`,

  videoProjects: `${p("fw")}/studio/video_projects`,
  mediaAssets: `${p("fw")}/studio/media_assets`,

  mediaAssetsUploadComplete: id =>
    `/fw/studio/media_assets/${id}/upload_completed`
};
