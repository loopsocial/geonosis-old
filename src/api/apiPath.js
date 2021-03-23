// ^/ms为美摄测试用接口
// ^/fw为fw接口
export default {
  resources: `/ms/resource/list`,
  materials: `/ms/material/list`,
  msSts: `/ms/upload/sts/info`,
  msUpload: "/ms/upload/files",

  videoCreate: "/fwServe/video/create", // 发起合成任务
  jobInfo: "/fwServe/job/info", // 查询任务

  soundTracks: `/fw/api/soundtracks`,

  videoProjects: `https://studio.sandbox.fireworktv.com/studio/video_projects`,
  mediaAssets: `https://studio.sandbox.fireworktv.com/studio/media_assets`,
  mediaAssetsUploadComplete: id =>
    `https://studio.sandbox.fireworktv.com/studio/media_assets/${id}/upload_completed`
};
