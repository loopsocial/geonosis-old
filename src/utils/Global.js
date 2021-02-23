// IndexDB内所有的资源分类, 同时也是FS内的文件目录
export const objectStores = [
  "m3u8",
  "font",
  "captionstyle",
  "animatedsticker",
  "compoundcaption"
];

// 资源包对应的类型
export const assetTypes = {
  captionstyle: 2,
  animatedsticker: 3,
  compoundcaption: 7
};

// 需要安装的资源
export const needInstall = Object.keys(assetTypes);

// clip类型
export const CLIP_TYPES = {
  VIDEO: "video",
  AUDIO: "audio",
  IMAGE: "image",
  CAPTION: "caption",
  STICKER: "sticker"
};
// track 类型
export const TRACK_TYPES = {
  VIDEO: "videoTrack",
  AUDIO: "audioTrack",
  CAPTION: "captionTrack",
  STICKER: "stickerTrack"
};
