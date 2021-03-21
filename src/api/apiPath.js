// ^/ms为美摄测试用接口
// ^/fw为fw接口
export default {
  resources: `/ms/resource/list`,
  materials: `/ms/material/list`,
  soundTracks: `/fw/api/soundtracks`,
  videoProjects: `https://studio.sandbox.fireworktv.com/studio/video_projects`,
  mediaAssets: `https://studio.sandbox.fireworktv.com/studio/media_assets`,
  mediaAssetsUploadComplete: id =>
    `https://studio.sandbox.fireworktv.com/studio/media_assets/${id}/upload_completed`
};
